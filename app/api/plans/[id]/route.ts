import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { updateCarePlan } from "@/lib/server/plans";
import type { ItineraryPlan } from "@/lib/itinerary-types";

type PlanRouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type PlanPatchBody = {
  title?: string;
  status?: "active" | "archived";
  plan?: ItineraryPlan;
};

async function getPlanId(context: PlanRouteContext): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: Request, context: PlanRouteContext) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to view saved plans.", 401);

  const planId = await getPlanId(context);
  const { data, error: planError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("id", planId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (planError) {
    return jsonError("Failed to load plan.", 500, planError.message);
  }

  if (!data) {
    return jsonError("Plan not found.", 404);
  }

  return NextResponse.json({ plan: data });
}

export async function PATCH(request: Request, context: PlanRouteContext) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to update saved plans.", 401);

  const planId = await getPlanId(context);
  const body = (await request.json().catch(() => ({}))) as PlanPatchBody;

  try {
    const savedPlan = await updateCarePlan({
      supabase,
      user,
      planId,
      title: body.title?.trim(),
      status: body.status,
      plan: body.plan,
    });

    return NextResponse.json({ plan: savedPlan });
  } catch (saveError) {
    return jsonError(
      "Failed to update plan.",
      500,
      saveError instanceof Error ? saveError.message : saveError,
    );
  }
}

export async function DELETE(_request: Request, context: PlanRouteContext) {
  const { supabase, user, error } = await getAuthenticatedUser();
  if (!supabase) return jsonError(error ?? "Supabase is not configured.", 503);
  if (!user) return jsonError("Sign in to delete saved plans.", 401);

  const planId = await getPlanId(context);
  const { error: deleteError } = await supabase
    .from("care_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (deleteError) {
    return jsonError("Failed to delete plan.", 500, deleteError.message);
  }

  return NextResponse.json({ ok: true });
}
