export type PlannedFlight = {
  id: string;
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
