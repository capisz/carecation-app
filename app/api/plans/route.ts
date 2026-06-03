import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createCarePlan } from "@/lib/server/plans";
import type { ItineraryPlan } from "@/lib/itinerary-types";

type PlanRequestBody = {
  title?: string;
  plan?: ItineraryPlan;
};

export async function GET() {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to view saved plans.", 401);

  const { data, error: plansError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (plansError) {
    return jsonError("Failed to load plans.", 500, plansError.message);
  }

  return NextResponse.json({
    plans: data ?? [],
    count: data?.length ?? 0,
  });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to save a plan.", 401);

  const body = (await request.json().catch(() => ({}))) as PlanRequestBody;
  const plan = body.plan ?? {};
  const title = body.title?.trim() || "Carecation plan";

  try {
    const savedPlan = await createCarePlan({
      supabase,
      user,
      title,
      plan,
    });

    return NextResponse.json({ plan: savedPlan }, { status: 201 });
  } catch (saveError) {
    return jsonError(
      "Failed to save plan.",
      500,
      saveError instanceof Error ? saveError.message : saveError,
    );
  }
}
