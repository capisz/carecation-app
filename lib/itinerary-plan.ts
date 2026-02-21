"use client";

export type PlannedFlight = {
  id: string;
  // Stored in USD for itinerary totals.
  totalPrice: number;
  currency: string;
  originalTotalPrice?: number;
  originalCurrency?: string;
  conversionRateToUsd?: number;
  conversionDate?: string | null;
  originIata: string;
  destinationIata: string;
  outboundDepartAt: string;
  outboundArrivalAt: string;
  returnDepartAt?: string;
  returnArrivalAt?: string;
};

export type PlannedHotel = {
  id: string;
  hotelId: string;
  name: string;
  cityCode: string;
  // Stored in USD for itinerary totals.
  totalPrice: number;
  currency: string;
  originalTotalPrice?: number;
  originalCurrency?: string;
  conversionRateToUsd?: number;
  conversionDate?: string | null;
  checkInDate: string;
  checkOutDate: string;
};

export type HealthcareEstimate = {
  providerId: string;
  providerName: string;
  estimateMin: number;
  estimateMax: number;
  currency: string;
  requestedAt: string;
};

export type TravelRecommendation = {
  procedure: string;
  country: string;
  month: string;
  budgetLabel: string;
  recommendedDestination: string;
  recommendedCityCode?: string;
  recommendedAirportCodes?: string[];
  preferredDestinations?: string[];
  summary: string;
  createdAt: string;
};

export type ItineraryPlan = {
  flight?: PlannedFlight;
  hotel?: PlannedHotel;
  healthcareEstimate?: HealthcareEstimate;
  travelRecommendation?: TravelRecommendation;
  updatedAt?: string;
};

const STORAGE_KEY = "carecation-itinerary-plan-v1";
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
  window.dispatchEvent(new Event(ITINERARY_PLAN_UPDATED_EVENT));
}
