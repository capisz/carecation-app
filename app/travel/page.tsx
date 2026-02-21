"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { useLoading } from "@/components/loading-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { upsertTravelSelections, type PlannedFlight } from "@/lib/itinerary-plan";
import { findTravelLocation, type TravelLocationProfile } from "@/lib/travel-locations";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Plane,
  Search,
} from "lucide-react";

type FlightSegment = {
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  departureIata: string;
  departureAt: string;
  arrivalIata: string;
  arrivalAt: string;
  duration?: string;
};

type FlightItinerary = {
  leg: "outbound" | "return";
  duration: string;
  stops: number;
  segments: FlightSegment[];
};

type FlightResult = {
  id: string;
  totalPrice: number;
  currency: string;
  bookableSeats: number | null;
  lastTicketingDate: string | null;
  itineraries: FlightItinerary[];
};

type LocationResult = {
  id: string;
  iataCode: string;
  cityCode: string;
  name: string;
  cityName: string | null;
  countryCode: string | null;
  subType: string | null;
};

type SearchResponse<T> = {
  results: T[];
  count: number;
  error?: string;
};

type LocationResponse = {
  results: LocationResult[];
  count: number;
  error?: string;
};

type CurrencyConversionResponse = {
  originalAmount: number;
  originalCurrency: string;
  normalizedCurrency: string;
  usdAmount: number;
  rateToUsd: number;
  rateDate: string | null;
};

type TravelSearchForm = {
  originQuery: string;
  destinationQuery: string;
  departDate: string;
  returnDate: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
};

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeCurrencyCode(currency: string): string {
  const code = currency.trim().toUpperCase();
  if (code === "BHT") {
    return "THB";
  }
  return code;
}

function formatPrice(value: number, currency: string): string {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${normalizedCurrency} ${value.toFixed(2)}`;
  }
}

function formatAirportOption(option: LocationResult): string {
  const city = option.cityName ?? option.cityCode;
  const country = option.countryCode ? `, ${option.countryCode}` : "";
  return `${option.iataCode} - ${option.name} (${city}${country})`;
}

function fallbackOptionsFromProfile(
  profile: TravelLocationProfile | null,
): LocationResult[] {
  if (!profile) {
    return [];
  }

  return profile.airports.map((airport) => ({
    id: `${profile.country}-${airport.iata}`,
    iataCode: airport.iata,
    cityCode: airport.cityCode,
    name: airport.name,
    cityName: airport.city,
    countryCode: null,
    subType: "AIRPORT",
  }));
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed with status ${response.status}`);
  }

  return data as T;
}

async function convertPriceToUsd(
  amount: number,
  currency: string,
): Promise<CurrencyConversionResponse> {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  if (normalizedCurrency === "USD") {
    return {
      originalAmount: amount,
      originalCurrency: "USD",
      normalizedCurrency: "USD",
      usdAmount: amount,
      rateToUsd: 1,
      rateDate: null,
    };
  }

  return postJson<CurrencyConversionResponse>("/api/currency/convert", {
    amount,
    currency: normalizedCurrency,
  });
}

function useAirportLookup(keyword: string) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await postJson<LocationResponse>("/api/locations/search", {
          keyword: trimmed,
        });
        if (!cancelled) {
          setResults(response.results);
        }
      } catch (lookupError) {
        if (!cancelled) {
          setResults([]);
          setError(
            lookupError instanceof Error
              ? lookupError.message
              : "Could not load nearby airports.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  return { results, isLoading, error };
}

function toPlannedFlight(
  flight: FlightResult,
  conversion: CurrencyConversionResponse,
): PlannedFlight | undefined {
  const outbound =
    flight.itineraries.find((itinerary) => itinerary.leg === "outbound") ??
    flight.itineraries[0];
  const inbound = flight.itineraries.find((itinerary) => itinerary.leg === "return");

  const outboundSegments = outbound?.segments ?? [];
  const inboundSegments = inbound?.segments ?? [];
  if (outboundSegments.length === 0) {
    return undefined;
  }

  const outboundFirst = outboundSegments[0];
  const outboundLast = outboundSegments[outboundSegments.length - 1];
  const inboundFirst = inboundSegments[0];
  const inboundLast = inboundSegments[inboundSegments.length - 1];

  return {
    id: flight.id,
    totalPrice: conversion.usdAmount,
    currency: "USD",
    originalTotalPrice: conversion.originalAmount,
    originalCurrency: conversion.normalizedCurrency,
    conversionRateToUsd: conversion.rateToUsd,
    conversionDate: conversion.rateDate,
    originIata: outboundFirst.departureIata,
    destinationIata: outboundLast.arrivalIata,
    outboundDepartAt: outboundFirst.departureAt,
    outboundArrivalAt: outboundLast.arrivalAt,
    returnDepartAt: inboundFirst?.departureAt,
    returnArrivalAt: inboundLast?.arrivalAt,
  };
}

export default function TravelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { withLoading } = useLoading();

  const recommendedDestination = searchParams.get("destination") ?? "";
  const recommendedCityCode = searchParams.get("destinationCityCode") ?? "";
  const recommendedAirportsRaw = searchParams.get("destinationAirports") ?? "";
  const recommendedCountry = searchParams.get("country") ?? "";
  const preferredDestinationsRaw = searchParams.get("preferredDestinations") ?? "";
  const recommendedMonth = searchParams.get("month") ?? "";
  const recommendedProcedure = searchParams.get("procedure") ?? "";
  const recommendedBudget = searchParams.get("budgetLabel") ?? "";

  const preferredDestinations = useMemo(() => {
    return preferredDestinationsRaw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }, [preferredDestinationsRaw]);

  const preferredProfiles = useMemo(() => {
    const seen = new Set<string>();
    const profiles: TravelLocationProfile[] = [];

    for (const destination of preferredDestinations) {
      const profile = findTravelLocation(destination);
      if (!profile) continue;
      if (seen.has(profile.country)) continue;
      seen.add(profile.country);
      profiles.push(profile);
    }

    return profiles;
  }, [preferredDestinations]);

  const [form, setForm] = useState<TravelSearchForm>({
    originQuery: "New York",
    destinationQuery: recommendedDestination || "Bangkok",
    departDate: dateOffset(30),
    returnDate: dateOffset(37),
    checkInDate: dateOffset(30),
    checkOutDate: dateOffset(37),
    adults: 1,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [visibleFlightsCount, setVisibleFlightsCount] = useState(6);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [isContinuingToHotels, setIsContinuingToHotels] = useState(false);
  const [originIata, setOriginIata] = useState("");
  const [destinationIata, setDestinationIata] = useState("");
  const [usdByFlightId, setUsdByFlightId] = useState<Record<string, number>>({});
  const [conversionErrorByFlightId, setConversionErrorByFlightId] = useState<
    Record<string, string>
  >({});

  const originLookup = useAirportLookup(form.originQuery);
  const destinationLookup = useAirportLookup(form.destinationQuery);

  const originProfile = useMemo(
    () => findTravelLocation(form.originQuery),
    [form.originQuery],
  );
  const destinationProfile = useMemo(
    () =>
      findTravelLocation(form.destinationQuery) ||
      findTravelLocation(recommendedCountry) ||
      findTravelLocation(recommendedDestination) ||
      preferredProfiles[0] ||
      null,
    [
      form.destinationQuery,
      recommendedCountry,
      recommendedDestination,
      preferredProfiles,
    ],
  );

  const originOptions = useMemo(() => {
    if (originLookup.results.length > 0) {
      return originLookup.results;
    }
    return fallbackOptionsFromProfile(originProfile);
  }, [originLookup.results, originProfile]);

  const destinationOptions = useMemo(() => {
    if (destinationLookup.results.length > 0) {
      return destinationLookup.results;
    }

    const fallbackFromProfile = fallbackOptionsFromProfile(destinationProfile);
    if (fallbackFromProfile.length > 0) {
      return fallbackFromProfile;
    }

    if (recommendedAirportsRaw) {
      const fallbackCodes = recommendedAirportsRaw
        .split(",")
        .map((code) => code.trim().toUpperCase())
        .filter((code) => /^[A-Z]{3}$/.test(code));
      return fallbackCodes.map((code) => ({
        id: `recommended-${code}`,
        iataCode: code,
        cityCode: recommendedCityCode || code,
        name: `${code} Airport`,
        cityName: recommendedDestination || null,
        countryCode: null,
        subType: "AIRPORT",
      }));
    }

    return [];
  }, [
    destinationLookup.results,
    destinationProfile,
    recommendedAirportsRaw,
    recommendedCityCode,
    recommendedDestination,
  ]);

  useEffect(() => {
    if (!recommendedDestination) return;
    setForm((prev) => ({ ...prev, destinationQuery: recommendedDestination }));
  }, [recommendedDestination]);

  useEffect(() => {
    setOriginIata((current) => {
      if (originOptions.some((option) => option.iataCode === current)) {
        return current;
      }
      return originOptions[0]?.iataCode ?? "";
    });
  }, [originOptions]);

  useEffect(() => {
    setDestinationIata((current) => {
      if (destinationOptions.some((option) => option.iataCode === current)) {
        return current;
      }
      return destinationOptions[0]?.iataCode ?? "";
    });
  }, [destinationOptions]);

  const selectedOrigin = useMemo(
    () => originOptions.find((option) => option.iataCode === originIata) ?? null,
    [originOptions, originIata],
  );
  const selectedDestination = useMemo(
    () => destinationOptions.find((option) => option.iataCode === destinationIata) ?? null,
    [destinationOptions, destinationIata],
  );
  const selectedFlight = useMemo(
    () => flights.find((flight) => flight.id === selectedFlightId) ?? null,
    [flights, selectedFlightId],
  );

  const visibleFlights = useMemo(
    () => flights.slice(0, visibleFlightsCount),
    [flights, visibleFlightsCount],
  );

  useEffect(() => {
    let cancelled = false;

    if (flights.length === 0) {
      setUsdByFlightId({});
      setConversionErrorByFlightId({});
      return;
    }

    const run = async () => {
      const nextUsdById: Record<string, number> = {};
      const nextErrors: Record<string, string> = {};

      await Promise.all(
        flights.map(async (flight) => {
          const normalizedCurrency = normalizeCurrencyCode(flight.currency);
          if (normalizedCurrency === "USD") {
            nextUsdById[flight.id] = flight.totalPrice;
            return;
          }

          try {
            const conversion = await convertPriceToUsd(flight.totalPrice, flight.currency);
            nextUsdById[flight.id] = conversion.usdAmount;
          } catch (conversionError) {
            nextErrors[flight.id] =
              conversionError instanceof Error
                ? conversionError.message
                : "USD conversion unavailable";
          }
        }),
      );

      if (cancelled) return;
      setUsdByFlightId(nextUsdById);
      setConversionErrorByFlightId(nextErrors);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [flights]);

  const hotelsHref = useMemo(() => {
    if (!selectedDestination) {
      return null;
    }
    const params = new URLSearchParams({
      cityCode: selectedDestination.cityCode,
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      adults: String(form.adults),
      destinationLabel: selectedDestination.cityName ?? form.destinationQuery,
      procedure: recommendedProcedure,
      preferredDestinations: preferredDestinations.join(","),
      budgetLabel: recommendedBudget,
    });
    return `/travel/hotels?${params.toString()}`;
  }, [
    selectedDestination,
    form.checkInDate,
    form.checkOutDate,
    form.adults,
    form.destinationQuery,
    recommendedProcedure,
    preferredDestinations,
    recommendedBudget,
  ]);

  const update = <K extends keyof TravelSearchForm>(
    key: K,
    value: TravelSearchForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSearched(true);
    setError(null);

    if (!selectedOrigin || !selectedDestination) {
      setError("Choose an origin and destination airport from the dropdowns.");
      setFlights([]);
      return;
    }

    if (form.returnDate && form.returnDate < form.departDate) {
      setError("Return date must be on or after the departure date.");
      return;
    }

    if (form.checkOutDate < form.checkInDate) {
      setError("Hotel check-out must be on or after check-in.");
      return;
    }

    setIsSearching(true);

    try {
      const flightsResponse = await withLoading(() =>
        postJson<SearchResponse<FlightResult>>("/api/flights/search", {
          origin: selectedOrigin.iataCode,
          destination: selectedDestination.iataCode,
          departDate: form.departDate,
          returnDate: form.returnDate || undefined,
          adults: form.adults,
        }),
      );

      setFlights(flightsResponse.results);
      setSelectedFlightId(flightsResponse.results[0]?.id ?? null);
      setVisibleFlightsCount(6);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to fetch flights.";
      setError(message);
      setFlights([]);
      setSelectedFlightId(null);
    } finally {
      setIsSearching(false);
    }
  };

  const persistSelectedFlight = async (): Promise<boolean> => {
    if (!selectedFlight) {
      toast({
        title: "No flight selected",
        description: "Select a flight to continue.",
      });
      return false;
    }

    try {
      const conversion = await withLoading(() =>
        convertPriceToUsd(selectedFlight.totalPrice, selectedFlight.currency),
      );

      const plannedFlight = toPlannedFlight(selectedFlight, conversion);
      if (!plannedFlight) {
        throw new Error("Selected flight is missing required itinerary details.");
      }

      upsertTravelSelections({ flight: plannedFlight });
      return true;
    } catch (conversionError) {
      toast({
        title: "Unable to add flight",
        description:
          conversionError instanceof Error
            ? conversionError.message
            : "Could not convert selected flight price to USD.",
      });
      return false;
    }
  };

  const handleContinueToHotels = async () => {
    if (!hotelsHref) {
      return;
    }

    setIsContinuingToHotels(true);
    try {
      const saved = await persistSelectedFlight();
      if (!saved) {
        return;
      }
      router.push(hotelsHref);
    } finally {
      setIsContinuingToHotels(false);
    }
  };

  const canSearch = Boolean(selectedOrigin && selectedDestination) && !isSearching;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-8 space-y-2 sm:space-y-3">
          <h1 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Browse Travel
          </h1>
          <p className="text-lg text-muted-foreground">
            Search flights by city name, then choose a hotel on the next step.
          </p>
        </div>

        {recommendedDestination && (
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Recommended destination:{" "}
                <span className="font-medium text-foreground">{recommendedDestination}</span>
                {recommendedCityCode ? ` (${recommendedCityCode})` : ""}
                {recommendedMonth ? ` • ${recommendedMonth}` : ""}
                {recommendedBudget ? ` • ${recommendedBudget}` : ""}
              </p>
              {recommendedAirportsRaw && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Suggested airports: {recommendedAirportsRaw}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {preferredProfiles.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Preferred locations from your care plan:
              </p>
              <div className="flex flex-wrap gap-2">
                {preferredProfiles.map((profile) => (
                  <Button
                    key={profile.country}
                    type="button"
                    variant={
                      form.destinationQuery.toLowerCase() ===
                      profile.recommendedCity.toLowerCase()
                        ? "default"
                        : "outline"
                    }
                    onClick={() => update("destinationQuery", profile.recommendedCity)}
                  >
                    {profile.recommendedCity} ({profile.recommendedCityCode})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="originQuery">Origin location</Label>
                  <Input
                    id="originQuery"
                    value={form.originQuery}
                    onChange={(event) => update("originQuery", event.target.value)}
                    placeholder="New York"
                    required
                  />
                  <Label htmlFor="originAirport" className="text-xs text-muted-foreground">
                    Choose an airport near your origin
                  </Label>
                  <select
                    id="originAirport"
                    value={originIata}
                    onChange={(event) => setOriginIata(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={originOptions.length === 0}
                  >
                    {originOptions.length === 0 ? (
                      <option value="">
                        {originLookup.isLoading
                          ? "Loading nearby airports..."
                          : "Type at least 2 characters"}
                      </option>
                    ) : (
                      originOptions.map((option) => (
                        <option key={option.id} value={option.iataCode}>
                          {formatAirportOption(option)}
                        </option>
                      ))
                    )}
                  </select>
                  {originLookup.error && (
                    <p className="text-xs text-destructive">{originLookup.error}</p>
                  )}
                  {originProfile && (
                    <p className="text-xs text-muted-foreground">
                      Origin guide: {originProfile.recommendedCity} (
                      {originProfile.recommendedCityCode}) • Airports:{" "}
                      {originProfile.airports
                        .map((airport) => airport.iata)
                        .slice(0, 4)
                        .join(", ")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationQuery">Destination location</Label>
                  <Input
                    id="destinationQuery"
                    value={form.destinationQuery}
                    onChange={(event) => update("destinationQuery", event.target.value)}
                    placeholder="Bangkok"
                    required
                  />
                  <Label
                    htmlFor="destinationAirport"
                    className="text-xs text-muted-foreground"
                  >
                    Choose an airport near your destination
                  </Label>
                  <select
                    id="destinationAirport"
                    value={destinationIata}
                    onChange={(event) => setDestinationIata(event.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={destinationOptions.length === 0}
                  >
                    {destinationOptions.length === 0 ? (
                      <option value="">
                        {destinationLookup.isLoading
                          ? "Loading nearby airports..."
                          : "Type at least 2 characters"}
                      </option>
                    ) : (
                      destinationOptions.map((option) => (
                        <option key={option.id} value={option.iataCode}>
                          {formatAirportOption(option)}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Hotel search city code:{" "}
                    <span className="font-medium text-foreground">
                      {selectedDestination?.cityCode ?? "—"}
                    </span>
                  </p>
                  {destinationProfile && (
                    <p className="text-xs text-muted-foreground">
                      Destination guide: {destinationProfile.recommendedCity} (
                      {destinationProfile.recommendedCityCode}) • Airports:{" "}
                      {destinationProfile.airports
                        .map((airport) => airport.iata)
                        .slice(0, 4)
                        .join(", ")}
                    </p>
                  )}
                  {destinationLookup.error && (
                    <p className="text-xs text-destructive">{destinationLookup.error}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="departDate">Depart date</Label>
                  <Input
                    id="departDate"
                    type="date"
                    value={form.departDate}
                    onChange={(event) => update("departDate", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return date (optional)</Label>
                  <Input
                    id="returnDate"
                    type="date"
                    value={form.returnDate}
                    onChange={(event) => update("returnDate", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkInDate">Hotel check-in</Label>
                  <Input
                    id="checkInDate"
                    type="date"
                    value={form.checkInDate}
                    onChange={(event) => update("checkInDate", event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOutDate">Hotel check-out</Label>
                  <Input
                    id="checkOutDate"
                    type="date"
                    value={form.checkOutDate}
                    onChange={(event) => update("checkOutDate", event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults</Label>
                  <Input
                    id="adults"
                    type="number"
                    min={1}
                    max={9}
                    value={form.adults}
                    onChange={(event) => {
                      const parsedValue = Number(event.target.value);
                      update(
                        "adults",
                        Number.isFinite(parsedValue)
                          ? Math.min(9, Math.max(1, parsedValue))
                          : 1,
                      );
                    }}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" className="w-full sm:w-auto" disabled={!canSearch}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching flights...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search flights
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Initial load shows 6 flights. Use Load more for additional options.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-8 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section aria-labelledby="flight-results-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="flight-results-heading" className="text-2xl font-semibold text-foreground">
              Flight results
            </h2>
            <Badge variant="secondary">{flights.length} found</Badge>
          </div>

          {isSearching && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading flight offers...
            </div>
          )}

          {!isSearching && hasSearched && flights.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              No flight offers found for this search.
            </div>
          )}

          {!isSearching && flights.length > 0 && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleFlights.map((flight) => {
                  const outbound =
                    flight.itineraries.find((itinerary) => itinerary.leg === "outbound") ??
                    flight.itineraries[0];
                  const inbound = flight.itineraries.find(
                    (itinerary) => itinerary.leg === "return",
                  );

                  const outboundSegments = outbound?.segments ?? [];
                  const inboundSegments = inbound?.segments ?? [];
                  const outboundFirst = outboundSegments[0];
                  const outboundLast = outboundSegments[outboundSegments.length - 1];
                  const inboundFirst = inboundSegments[0];
                  const inboundLast = inboundSegments[inboundSegments.length - 1];
                  const isSelected = selectedFlightId === flight.id;
                  const normalizedCurrency = normalizeCurrencyCode(flight.currency);
                  const usdValue = usdByFlightId[flight.id];
                  const conversionError = conversionErrorByFlightId[flight.id];
                  const hasUsdValue =
                    typeof usdValue === "number" || normalizedCurrency === "USD";
                  const displayedUsdValue =
                    typeof usdValue === "number" ? usdValue : flight.totalPrice;
                  const usdPrimaryText = hasUsdValue
                    ? formatPrice(displayedUsdValue, "USD")
                    : conversionError
                      ? "USD conversion unavailable"
                      : "Converting...";

                  return (
                    <Card
                      key={flight.id}
                      className={cn(
                        "shadow-sm transition-all hover:shadow-lg",
                        isSelected && "border-primary ring-1 ring-primary/50",
                      )}
                    >
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Total in USD
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                              {usdPrimaryText}
                            </p>
                            {normalizedCurrency !== "USD" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Original: {formatPrice(flight.totalPrice, flight.currency)}
                                {conversionError ? " • USD conversion unavailable" : ""}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            <Plane className="mr-1 h-3.5 w-3.5" />
                            {flight.itineraries.length > 1 ? "Round-trip" : "One-way"}
                          </Badge>
                        </div>

                        {outboundFirst && outboundLast && (
                          <div className="mb-4 rounded-md border border-border bg-background p-3">
                            <p className="mb-1 text-sm font-medium text-foreground">
                              Outbound: {outboundFirst.departureIata} → {outboundLast.arrivalIata}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(outboundFirst.departureAt)} -{" "}
                              {formatDateTime(outboundLast.arrivalAt)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {outbound.duration} • {outbound.stops} stop
                              {outbound.stops === 1 ? "" : "s"}
                            </p>
                            {outboundSegments.length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {outboundSegments
                                  .map(
                                    (segment) =>
                                      `${segment.carrierCode} ${segment.flightNumber} (${segment.departureIata}-${segment.arrivalIata})`,
                                  )
                                  .join(" • ")}
                              </p>
                            )}
                          </div>
                        )}

                        {inboundFirst && inboundLast && (
                          <div className="mb-4 rounded-md border border-border bg-background p-3">
                            <p className="mb-1 text-sm font-medium text-foreground">
                              Return: {inboundFirst.departureIata} → {inboundLast.arrivalIata}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(inboundFirst.departureAt)} -{" "}
                              {formatDateTime(inboundLast.arrivalAt)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {inbound?.duration ?? "—"} • {inbound?.stops ?? 0} stop
                              {(inbound?.stops ?? 0) === 1 ? "" : "s"}
                            </p>
                            {inboundSegments.length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {inboundSegments
                                  .map(
                                    (segment) =>
                                      `${segment.carrierCode} ${segment.flightNumber} (${segment.departureIata}-${segment.arrivalIata})`,
                                  )
                                  .join(" • ")}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {flight.bookableSeats !== null && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                              <Calendar className="h-3 w-3" />
                              {flight.bookableSeats} seat(s) left
                            </span>
                          )}
                          {flight.lastTicketingDate && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
                              <Clock className="h-3 w-3" />
                              Ticket by {flight.lastTicketingDate}
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSelectedFlightId(flight.id)}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Flight selected
                            </>
                          ) : (
                            "Select flight"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {flights.length > visibleFlightsCount && (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVisibleFlightsCount((count) => count + 6)}
                  >
                    Load more flights
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {hasSearched && (
          <Card className="mt-8 border-primary/20">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Continue your plan</h3>
                <p className="text-sm text-muted-foreground">
                  Your selected flight will be added automatically when you continue.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:w-auto">
                <Button asChild>
                  <Link href="/itinerary">View itinerary</Link>
                </Button>

                <Button
                  type="button"
                  onClick={handleContinueToHotels}
                  disabled={!hotelsHref || !selectedFlight || isContinuingToHotels}
                >
                  {isContinuingToHotels ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving flight...
                    </>
                  ) : (
                    "Choose hotels"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </AppShell>
  );
}
