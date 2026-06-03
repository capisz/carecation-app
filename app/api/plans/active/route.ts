import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createCarePlan, updateCarePlan } from "@/lib/server/plans";
import type { ItineraryPlan } from "@/lib/itinerary-types";

type ActivePlanRequestBody = {
  title?: string;
  plan?: ItineraryPlan;
};

export async function GET() {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to view saved plans.", 401);

  const { data, error: activeError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) {
    return jsonError("Failed to load active plan.", 500, activeError.message);
  }

  return NextResponse.json({ plan: data ?? null });
}

export async function PUT(request: Request) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to save a plan.", 401);

  const body = (await request.json().catch(() => ({}))) as ActivePlanRequestBody;
  const plan = body.plan ?? {};
  const title = body.title?.trim() || "Carecation plan";

  try {
    const { data: existingPlan, error: loadError } = await supabase
      .from("care_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (loadError) {
      throw loadError;
    }

    const savedPlan = existingPlan
      ? await updateCarePlan({
          supabase,
          user,
          planId: existingPlan.id,
          title,
          plan,
        })
      : await createCarePlan({
          supabase,
          user,
          title,
          plan,
        });

    return NextResponse.json({ plan: savedPlan });
  } catch (saveError) {
    return jsonError(
      "Failed to save active plan.",
      500,
      saveError instanceof Error ? saveError.message : saveError,
    );
  }
}
