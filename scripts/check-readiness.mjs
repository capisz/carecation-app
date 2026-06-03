import fs from "node:fs";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const REQUIRED_SUPABASE_TABLES = [
  "profiles",
  "care_plans",
  "plan_items",
  "providers",
  "quote_requests",
  "provider_applications",
  "testimonials",
  "affiliate_clicks",
  "audit_events",
];

function loadDotEnvLocal() {
  if (!fs.existsSync(".env.local")) {
    return {};
  }

  const entries = fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      if (index === -1) {
        return [line, ""];
      }
      return [line.slice(0, index), line.slice(index + 1)];
    });

  return Object.fromEntries(entries);
}

function hasValue(value) {
  return Boolean(value && !value.startsWith("your_"));
}

function logCheck(label, ok, detail = "") {
  const marker = ok ? "OK" : "NEEDS ATTENTION";
  console.log(`${marker}: ${label}${detail ? ` - ${detail}` : ""}`);
}

async function checkAmadeus(env) {
  const hasClientId = hasValue(env.AMADEUS_CLIENT_ID);
  const hasClientSecret = hasValue(env.AMADEUS_CLIENT_SECRET);
  logCheck("Amadeus client id present", hasClientId);
  logCheck("Amadeus client secret present", hasClientSecret);

  if (!hasClientId || !hasClientSecret) {
    return;
  }

  const baseUrl =
    env.AMADEUS_BASE_URL ||
    (env.AMADEUS_ENV === "production"
      ? "https://api.amadeus.com"
      : "https://test.api.amadeus.com");

  const tokenResponse = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.AMADEUS_CLIENT_ID,
      client_secret: env.AMADEUS_CLIENT_SECRET,
    }),
  });

  logCheck("Amadeus token request", tokenResponse.ok, `${tokenResponse.status}`);
  if (!tokenResponse.ok) {
    const body = await tokenResponse.text();
    console.log(body.slice(0, 500));
    return;
  }

  const tokenPayload = await tokenResponse.json();
  const url = new URL(`${baseUrl}/v1/reference-data/locations`);
  url.searchParams.set("keyword", "Bangkok");
  url.searchParams.set("subType", "AIRPORT");
  url.searchParams.set("page[limit]", "5");
  url.searchParams.set("view", "LIGHT");

  const locationResponse = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });
  logCheck(
    "Amadeus location search",
    locationResponse.ok,
    `${locationResponse.status} for Bangkok`,
  );
}

async function checkSupabase(env) {
  const hasUrl = hasValue(env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
  const hasPublishableKey = hasValue(publishableKey);
  const hasSecretKey = hasValue(secretKey);

  logCheck("Supabase URL present", hasUrl);
  logCheck("Supabase publishable/anon key present", hasPublishableKey);
  logCheck("Supabase secret/service role key present", hasSecretKey);

  if (!hasUrl || !hasSecretKey) {
    console.log("Supabase table checks skipped until URL and secret/service role key are set.");
    return;
  }

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  for (const table of REQUIRED_SUPABASE_TABLES) {
    const { error } = await supabase.from(table).select("*", { count: "exact" }).limit(1);
    logCheck(`Supabase table ${table}`, !error, error?.message ?? "");
  }
}

async function checkPexels(env) {
  const hasPexelsKey = hasValue(env.PEXELS_API_KEY);
  logCheck("Pexels API key present", hasPexelsKey);

  if (!hasPexelsKey) {
    return;
  }

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", "Bangkok hotel exterior");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "1");

  const response = await fetch(url, {
    headers: {
      Authorization: env.PEXELS_API_KEY,
    },
  });

  logCheck("Pexels image search", response.ok, `${response.status}`);
}

async function main() {
  const env = { ...process.env, ...loadDotEnvLocal() };
  const majorNode = Number(process.versions.node.split(".")[0]);

  console.log("Carecation readiness check\n");
  logCheck("Node 22 active", majorNode === 22, `current ${process.version}`);
  logCheck("AMADEUS_ENV", env.AMADEUS_ENV === "production" || env.AMADEUS_ENV === "test", env.AMADEUS_ENV || "defaults to test");

  console.log("\nAmadeus");
  await checkAmadeus(env);

  console.log("\nSupabase");
  await checkSupabase(env);

  console.log("\nPexels");
  await checkPexels(env);

  console.log("\nRequired Supabase redirect URLs:");
  console.log("- http://localhost:3000/auth/callback");
  console.log("- http://localhost:3021/auth/callback");
  console.log("- https://your-vercel-domain.vercel.app/auth/callback");
  console.log("- https://your-custom-domain.com/auth/callback");
}

main().catch((error) => {
  console.error("Readiness check failed:", error.message);
  process.exitCode = 1;
});
