"use client";

export type {
  HealthcareEstimate,
  ItineraryPlan,
  PlannedFlight,
  PlannedHotel,
  TravelRecommendation,
} from "@/lib/itinerary-types";

import type {
  HealthcareEstimate,
  ItineraryPlan,
  PlannedFlight,
  PlannedHotel,
  TravelRecommendation,
} from "@/lib/itinerary-types";

const STORAGE_KEY = "carecation-itinerary-plan-v1";
const ACTIVE_PLAN_ID_KEY = "carecation-active-plan-id-v1";
export const ITINERARY_PLAN_UPDATED_EVENT = "carecation-itinerary-plan-updated";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function readItineraryPlan(): ItineraryPlan {
  if (!hasWindow()) {
    return {};
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ItineraryPlan;
  } catch {
    return {};
  }
}

export function writeItineraryPlan(plan: ItineraryPlan): void {
  if (!hasWindow()) {
    return;
  }

  const withUpdatedAt: ItineraryPlan = {
    ...plan,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withUpdatedAt));
  window.dispatchEvent(new Event(ITINERARY_PLAN_UPDATED_EVENT));
  void syncItineraryPlanToServer(withUpdatedAt);
}

export function upsertTravelSelections(input: {
  flight?: PlannedFlight;
  hotel?: PlannedHotel;
}): ItineraryPlan {
  const current = readItineraryPlan();
  const next: ItineraryPlan = {
    ...current,
    flight: input.flight ?? current.flight,
    hotel: input.hotel ?? current.hotel,
  };
  writeItineraryPlan(next);
  return next;
}

export function upsertHealthcareEstimate(
  estimate: HealthcareEstimate,
): ItineraryPlan {
  const current = readItineraryPlan();
  const next: ItineraryPlan = {
    ...current,
    healthcareEstimate: estimate,
  };
  writeItineraryPlan(next);
  return next;
}

export function upsertTravelRecommendation(
  recommendation: TravelRecommendation,
): ItineraryPlan {
  const current = readItineraryPlan();
  const next: ItineraryPlan = {
    ...current,
    travelRecommendation: recommendation,
  };
  writeItineraryPlan(next);
  return next;
}

export function clearItineraryPlan(): void {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ACTIVE_PLAN_ID_KEY);
  window.dispatchEvent(new Event(ITINERARY_PLAN_UPDATED_EVENT));
}

export function readActivePlanId(): string | null {
  if (!hasWindow()) {
    return null;
  }
  return window.localStorage.getItem(ACTIVE_PLAN_ID_KEY);
}

export function writeActivePlanId(planId: string | null): void {
  if (!hasWindow()) {
    return;
  }
  if (planId) {
    window.localStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
  } else {
    window.localStorage.removeItem(ACTIVE_PLAN_ID_KEY);
  }
}

export async function syncItineraryPlanToServer(plan = readItineraryPlan()): Promise<{
  ok: boolean;
  planId?: string;
}> {
  if (!hasWindow()) {
    return { ok: false };
  }

  const planId = readActivePlanId();
  const hasPlanData = Boolean(
    plan.flight || plan.hotel || plan.healthcareEstimate || plan.travelRecommendation,
  );
  if (!hasPlanData) {
    return { ok: false };
  }

  try {
    const response = await fetch(planId ? `/api/plans/${planId}` : "/api/plans/active", {
      method: planId ? "PATCH" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan,
        title: buildPlanTitle(plan),
      }),
    });

    if (response.status === 401 || response.status === 404) {
      return { ok: false };
    }

    if (!response.ok) {
      return { ok: false };
    }

    const data = (await response.json()) as { plan?: { id?: string }; id?: string };
    const nextPlanId = data.plan?.id ?? data.id;
    if (nextPlanId) {
      writeActivePlanId(nextPlanId);
    }

    return { ok: true, planId: nextPlanId };
  } catch {
    return { ok: false };
  }
}

export function loadItineraryPlan(plan: ItineraryPlan, planId?: string): void {
  if (planId) {
    writeActivePlanId(planId);
  }
  writeItineraryPlan(plan);
}

export function buildPlanTitle(plan: ItineraryPlan): string {
  const destination =
    plan.travelRecommendation?.recommendedDestination ??
    plan.hotel?.cityCode ??
    plan.flight?.destinationIata;
  const procedure =
    plan.travelRecommendation?.procedure ??
    plan.healthcareEstimate?.providerName;

  if (destination && procedure) {
    return `${destination} ${procedure} plan`;
  }
  if (destination) {
    return `${destination} carecation plan`;
  }
  if (procedure) {
    return `${procedure} carecation plan`;
  }
  return "Carecation plan";
}
