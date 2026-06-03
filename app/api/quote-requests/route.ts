import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";

type QuoteRequestBody = {
  planId?: string | null;
  providerId?: string;
  providerName?: string;
  name?: string;
  email?: string;
  phone?: string;
  travelWindow?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as QuoteRequestBody;
  const name = body.name?.trim();
  const email = body.email?.trim();

  if (!name || !email) {
    return jsonError("name and email are required.", 400);
  }

  const { supabase, user } = await getAuthenticatedUser();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      persisted: false,
      message: "Quote request accepted locally. Supabase is not configured.",
    });
  }

  const { data, error } = await supabase
    .from("quote_requests")
    .insert({
      user_id: user?.id ?? null,
      plan_id: user ? body.planId ?? null : null,
      provider_id: body.providerId ?? null,
      provider_name: body.providerName ?? null,
      contact_name: name,
      email,
      phone: body.phone ?? null,
      travel_window: body.travelWindow ?? null,
      notes: body.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return jsonError("Failed to submit quote request.", 500, error.message);
  }

  return NextResponse.json({ ok: true, persisted: true, id: data.id });
}
