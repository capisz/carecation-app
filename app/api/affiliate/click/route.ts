import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";

type AffiliateClickBody = {
  partner?: string;
  outboundUrl?: string;
  planId?: string | null;
  destinationCountry?: string | null;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AffiliateClickBody;
  const partner = body.partner?.trim();
  const outboundUrl = body.outboundUrl?.trim();

  if (!partner || !outboundUrl) {
    return jsonError("partner and outboundUrl are required.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("affiliate_clicks").insert({
    user_id: user?.id ?? null,
    plan_id: user ? body.planId ?? null : null,
    partner,
    outbound_url: outboundUrl,
    destination_country: body.destinationCountry ?? null,
    metadata: body.metadata ?? {},
  });

  if (error) {
    return jsonError("Failed to record affiliate click.", 500, error.message);
  }

  return NextResponse.json({ ok: true, persisted: true });
}
