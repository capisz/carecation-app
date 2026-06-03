import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ItineraryPlan } from "@/lib/itinerary-types";

export type CarePlanRecord = {
  id: string;
  user_id: string;
  title: string;
  status: "active" | "archived";
  plan_snapshot: ItineraryPlan;
  created_at: string;
  updated_at: string;
};

type PlanItemInput = {
  item_type: "flight" | "hotel" | "healthcare_estimate" | "travel_recommendation";
  item_snapshot: Record<string, unknown>;
  source: string;
};

function buildPlanItems(plan: ItineraryPlan): PlanItemInput[] {
  const items: PlanItemInput[] = [];

  if (plan.flight) {
    items.push({
      item_type: "flight",
      item_snapshot: plan.flight as unknown as Record<string, unknown>,
      source: "amadeus-flight-offer",
    });
  }

  if (plan.hotel) {
    items.push({
      item_type: "hotel",
      item_snapshot: plan.hotel as unknown as Record<string, unknown>,
      source: "amadeus-hotel-offer",
    });
  }

  if (plan.healthcareEstimate) {
    items.push({
      item_type: "healthcare_estimate",
      item_snapshot: plan.healthcareEstimate as unknown as Record<string, unknown>,
      source: "carecation-provider-estimate",
    });
  }

  if (plan.travelRecommendation) {
    items.push({
      item_type: "travel_recommendation",
      item_snapshot: plan.travelRecommendation as unknown as Record<string, unknown>,
      source: "carecation-intake",
    });
  }

  return items;
}

export async function upsertPlanItems(input: {
  supabase: SupabaseClient;
  user: User;
  planId: string;
  plan: ItineraryPlan;
}) {
  const rows = buildPlanItems(input.plan).map((item) => ({
    plan_id: input.planId,
    user_id: input.user.id,
    ...item,
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await input.supabase.from("plan_items").upsert(rows, {
    onConflict: "plan_id,item_type",
  });

  if (error) {
    throw error;
  }
}

export async function createCarePlan(input: {
  supabase: SupabaseClient;
  user: User;
  title: string;
  plan: ItineraryPlan;
}): Promise<CarePlanRecord> {
  const { data, error } = await input.supabase
    .from("care_plans")
    .insert({
      user_id: input.user.id,
      title: input.title,
      plan_snapshot: input.plan,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  await upsertPlanItems({
    supabase: input.supabase,
    user: input.user,
    planId: data.id,
    plan: input.plan,
  });

  return data as CarePlanRecord;
}

export async function updateCarePlan(input: {
  supabase: SupabaseClient;
  user: User;
  planId: string;
  title?: string;
  status?: "active" | "archived";
  plan?: ItineraryPlan;
}): Promise<CarePlanRecord> {
  const updatePayload: Record<string, unknown> = {};
  if (input.title) updatePayload.title = input.title;
  if (input.status) updatePayload.status = input.status;
  if (input.plan) updatePayload.plan_snapshot = input.plan;

  const { data, error } = await input.supabase
    .from("care_plans")
    .update(updatePayload)
    .eq("id", input.planId)
    .eq("user_id", input.user.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  if (input.plan) {
    await upsertPlanItems({
      supabase: input.supabase,
      user: input.user,
      planId: input.planId,
      plan: input.plan,
    });
  }

  return data as CarePlanRecord;
}
