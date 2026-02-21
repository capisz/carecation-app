"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { ItineraryTimeline, generateItinerary } from "@/components/itinerary-timeline";
import { getProviderById } from "@/lib/data/providers-repo";
import { findTravelLocation, TRAVEL_LOCATION_PROFILES } from "@/lib/travel-locations";
import {
  readItineraryPlan,
  type ItineraryPlan,
} from "@/lib/itinerary-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  FileText,
  MapPin,
  Plane,
  Printer,
  Star,
  Stethoscope,
} from "lucide-react";

const AFFILIATE_LINKS = {
  booking: "https://booking.tpo.mx/X2Is8xcm",
  expedia: "https://expedia.tpo.mx/q6zv6zUE",
  compensair: "https://compensair.tpo.mx/5TC1mHFW",
  trip: "https://trip.tpo.mx/1FRVRTyj",
} as const;

type AffiliateBookingOption = {
  key: "booking" | "expedia" | "trip" | "compensair";
  label: string;
  href: string;
  description: string;
};

function inferDestinationCountry(plan: ItineraryPlan): string | null {
  const codeCandidates = [
    plan.hotel?.cityCode,
    plan.flight?.destinationIata,
    plan.travelRecommendation?.recommendedCityCode,
  ]
    .map((value) => value?.trim().toUpperCase())
    .filter(Boolean) as string[];

  for (const code of codeCandidates) {
    const matchedProfile = TRAVEL_LOCATION_PROFILES.find((profile) => {
      if (profile.recommendedCityCode.toUpperCase() === code) {
        return true;
      }
      return profile.airports.some((airport) => {
        return (
          airport.iata.toUpperCase() === code ||
          airport.cityCode.toUpperCase() === code
        );
      });
    });
    if (matchedProfile) {
      return matchedProfile.country;
    }
  }

  const textCandidates = [
    plan.travelRecommendation?.recommendedDestination,
    plan.travelRecommendation?.country,
  ].filter(Boolean) as string[];

  for (const text of textCandidates) {
    const matchedProfile = findTravelLocation(text);
    if (matchedProfile) {
      return matchedProfile.country;
    }
  }

  return null;
}

function addAffiliateParams(baseUrl: string, params: URLSearchParams): string {
  try {
    const url = new URL(baseUrl);
    for (const [key, value] of params.entries()) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    const query = params.toString();
    if (!query) {
      return baseUrl;
    }
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}`;
  }
}

function buildAffiliateBookingOptions(input: {
  plan: ItineraryPlan;
  destinationCountry: string | null;
  totalMin: number;
  totalMax: number;
}): AffiliateBookingOption[] {
  const params = new URLSearchParams();
  params.set("source", "carecation-itinerary");
  params.set("currency", "USD");
  params.set("totalMinUsd", String(Math.round(input.totalMin)));
  params.set("totalMaxUsd", String(Math.round(input.totalMax)));

  if (input.destinationCountry) {
    params.set("destinationCountry", input.destinationCountry);
  }

  if (input.plan.flight) {
    params.set("flightOrigin", input.plan.flight.originIata);
    params.set("flightDestination", input.plan.flight.destinationIata);
    params.set("flightDepartAt", input.plan.flight.outboundDepartAt);
    if (input.plan.flight.returnDepartAt) {
      params.set("flightReturnAt", input.plan.flight.returnDepartAt);
    }
    params.set("flightPriceUsd", String(Math.round(input.plan.flight.totalPrice)));
  }

  if (input.plan.hotel) {
    params.set("hotelName", input.plan.hotel.name);
    params.set("hotelCityCode", input.plan.hotel.cityCode);
    params.set("hotelCheckInDate", input.plan.hotel.checkInDate);
    params.set("hotelCheckOutDate", input.plan.hotel.checkOutDate);
    params.set("hotelPriceUsd", String(Math.round(input.plan.hotel.totalPrice)));
  }

  if (input.plan.healthcareEstimate) {
    params.set("clinic", input.plan.healthcareEstimate.providerName);
    params.set(
      "healthcareEstimateMinUsd",
      String(Math.round(input.plan.healthcareEstimate.estimateMin)),
    );
    params.set(
      "healthcareEstimateMaxUsd",
      String(Math.round(input.plan.healthcareEstimate.estimateMax)),
    );
  }

  return [
    {
      key: "expedia",
      label: "Book with Expedia",
      href: addAffiliateParams(AFFILIATE_LINKS.expedia, params),
      description: "Flight + hotel booking partner.",
    },
    {
      key: "booking",
      label: "Book with Booking.com",
      href: addAffiliateParams(AFFILIATE_LINKS.booking, params),
      description: "Hotel-focused booking partner.",
    },
    {
      key: "trip",
      label: "Book with Trip.com",
      href: addAffiliateParams(AFFILIATE_LINKS.trip, params),
      description: "Global flight and hotel booking partner.",
    },
    {
      key: "compensair",
      label: "Book with Compensair",
      href: addAffiliateParams(AFFILIATE_LINKS.compensair, params),
      description: "Alternative partner option for itinerary booking.",
    },
  ];
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedUsd(value: number): string {
  const absolute = formatUsd(Math.abs(value));
  if (value > 0) {
    return `+${absolute}`;
  }
  if (value < 0) {
    return `-${absolute}`;
  }
  return absolute;
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

function ItineraryContent() {
  usePageReady();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const provider = providerId ? getProviderById(providerId) : null;

  const [plan, setPlan] = useState<ItineraryPlan>({});

  useEffect(() => {
    const syncPlan = () => {
      setPlan(readItineraryPlan());
    };

    syncPlan();
    window.addEventListener("storage", syncPlan);
    window.addEventListener("focus", syncPlan);

    return () => {
      window.removeEventListener("storage", syncPlan);
      window.removeEventListener("focus", syncPlan);
    };
  }, []);

  const itineraryDays = useMemo(() => {
    if (!provider) return [];
    return generateItinerary(
      provider.name,
      provider.city,
      provider.country,
      provider.recoveryDays,
      provider.procedures,
    );
  }, [provider]);

  const flightCost = plan.flight?.totalPrice ?? 0;
  const hotelCost = plan.hotel?.totalPrice ?? 0;
  const healthcareMin =
    plan.healthcareEstimate?.estimateMin ?? provider?.priceRangeUSD.min ?? 0;
  const healthcareMax =
    plan.healthcareEstimate?.estimateMax ?? provider?.priceRangeUSD.max ?? healthcareMin;

  const hasHealthcare = healthcareMax > 0;
  const totalMin = flightCost + hotelCost + healthcareMin;
  const totalMax = flightCost + hotelCost + healthcareMax;

  const domesticComparable = hasHealthcare ? healthcareMax * 1.8 : 0;
  const potentialSavingsLow = domesticComparable - totalMax;
  const potentialSavingsHigh = domesticComparable - totalMin;
  const minSavingsDifference = Math.min(potentialSavingsLow, potentialSavingsHigh);
  const maxSavingsDifference = Math.max(potentialSavingsLow, potentialSavingsHigh);
  const hasPositiveSavings = maxSavingsDifference > 0;

  const hasAnyPlanData = Boolean(
    plan.flight || plan.hotel || hasHealthcare || provider || plan.travelRecommendation,
  );
  const currentYear = new Date().getFullYear();
  const destinationCountry = useMemo(() => inferDestinationCountry(plan), [plan]);
  const hasTravelSelection = Boolean(plan.flight || plan.hotel);
  const affiliateBookingOptions = useMemo(() => {
    if (!hasTravelSelection) {
      return [];
    }
    return buildAffiliateBookingOptions({
      plan,
      destinationCountry,
      totalMin,
      totalMax,
    });
  }, [hasTravelSelection, plan, destinationCountry, totalMin, totalMax]);

  if (!hasAnyPlanData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">No itinerary data yet</h1>
        <p className="mb-6 text-muted-foreground">
          Add flights/hotels from Browse Travel or request a provider quote to build your total itinerary estimate.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/travel">Browse travel</Link>
          </Button>
          <Button asChild>
            <Link href="/results">Browse providers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="itinerary-print mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="no-print">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
          <Link href={provider ? `/provider/${provider.id}` : "/travel"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Your Carecation Itinerary
          </h1>
          <p className="mt-1 text-muted-foreground">
            Combined travel, stay, and healthcare estimate in one place.
          </p>
        </div>
        <div className="no-print flex gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {provider && (
            <Button asChild size="sm">
              <Link href={`/request?providerId=${provider.id}`}>
                <FileText className="mr-2 h-4 w-4" />
                Request quote
              </Link>
            </Button>
          )}
        </div>
      </div>

      {provider && (
        <Card className="no-print mb-8">
          <CardContent className="p-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground">{provider.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {provider.city}, {provider.country}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{provider.rating}</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {itineraryDays.length} days
                </div>
                <p className="mt-1 text-lg font-bold text-primary">
                  From {formatUsd(provider.priceRangeUSD.min)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {plan.travelRecommendation && (
        <Card className="no-print mb-8 border-primary/20">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-foreground">
              Recommended travel direction
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.travelRecommendation.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                Destination: {plan.travelRecommendation.recommendedDestination}
              </Badge>
              {plan.travelRecommendation.recommendedCityCode && (
                <Badge variant="secondary">
                  City code: {plan.travelRecommendation.recommendedCityCode}
                </Badge>
              )}
              <Badge variant="secondary">
                Month: {plan.travelRecommendation.month}
              </Badge>
              <Badge variant="secondary">
                Budget: {plan.travelRecommendation.budgetLabel}
              </Badge>
              {plan.travelRecommendation.preferredDestinations &&
                plan.travelRecommendation.preferredDestinations.length > 0 && (
                  <Badge variant="secondary">
                    Preferred:{" "}
                    {plan.travelRecommendation.preferredDestinations.join(", ")}
                  </Badge>
                )}
              {plan.travelRecommendation.recommendedAirportCodes &&
                plan.travelRecommendation.recommendedAirportCodes.length > 0 && (
                  <Badge variant="secondary">
                    Airports: {plan.travelRecommendation.recommendedAirportCodes.join(", ")}
                  </Badge>
                )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="itinerary-section mb-8">
        <CardContent className="p-5">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Total itinerary estimate
          </h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Plane className="h-4 w-4" />
                Flights
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatUsd(flightCost)}
              </p>
              {plan.flight?.originalCurrency &&
                plan.flight.originalCurrency !== "USD" &&
                typeof plan.flight.originalTotalPrice === "number" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Converted from{" "}
                    {formatPrice(
                      plan.flight.originalTotalPrice,
                      plan.flight.originalCurrency,
                    )}
                  </p>
                )}
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <BedDouble className="h-4 w-4" />
                Hotel
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatUsd(hotelCost)}
              </p>
              {plan.hotel?.originalCurrency &&
                plan.hotel.originalCurrency !== "USD" &&
                typeof plan.hotel.originalTotalPrice === "number" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Converted from{" "}
                    {formatPrice(
                      plan.hotel.originalTotalPrice,
                      plan.hotel.originalCurrency,
                    )}
                  </p>
                )}
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="h-4 w-4" />
                Healthcare
              </div>
              <p className="text-lg font-semibold text-foreground">
                {hasHealthcare
                  ? `${formatUsd(healthcareMin)} - ${formatUsd(healthcareMax)}`
                  : "Not added yet"}
              </p>
              {plan.healthcareEstimate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Estimate from quote request: {plan.healthcareEstimate.providerName}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground">Estimated total</p>
            <p className="text-2xl font-bold text-primary">
              {formatUsd(totalMin)} - {formatUsd(totalMax)}
            </p>
            {hasHealthcare && (
              <div
                className={`mt-3 rounded-md border p-3 ${
                  hasPositiveSavings
                    ? "border-emerald-500/40 bg-emerald-500/15"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                 YOU SAVED ({formatUsd(domesticComparable)})
                </p>
                <p
                  className={`mt-1 text-3xl font-extrabold leading-tight ${
                    hasPositiveSavings
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {formatSignedUsd(minSavingsDifference)} to{" "}
                  {formatSignedUsd(maxSavingsDifference)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasPositiveSavings
                    ? "Potential savings after travel and stay."
                    : "Your projected total may be higher than this U.S. benchmark."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="itinerary-section mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-2 font-semibold text-foreground">Selected flight</h3>
            {plan.flight ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {plan.flight.originIata} → {plan.flight.destinationIata}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Depart: {new Date(plan.flight.outboundDepartAt).toLocaleString()}
                </p>
                {plan.flight.returnDepartAt && (
                  <p className="text-sm text-muted-foreground">
                    Return: {new Date(plan.flight.returnDepartAt).toLocaleString()}
                  </p>
                )}
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatUsd(plan.flight.totalPrice)}
                </p>
                {plan.flight.originalCurrency &&
                  plan.flight.originalCurrency !== "USD" &&
                  typeof plan.flight.originalTotalPrice === "number" && (
                    <p className="text-xs text-muted-foreground">
                      Original:{" "}
                      {formatPrice(
                        plan.flight.originalTotalPrice,
                        plan.flight.originalCurrency,
                      )}
                    </p>
                  )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No flight selected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-2 font-semibold text-foreground">Selected hotel</h3>
            {plan.hotel ? (
              <>
                <p className="text-sm text-muted-foreground">{plan.hotel.name}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.hotel.checkInDate} → {plan.hotel.checkOutDate}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatUsd(plan.hotel.totalPrice)}
                </p>
                {plan.hotel.originalCurrency &&
                  plan.hotel.originalCurrency !== "USD" &&
                  typeof plan.hotel.originalTotalPrice === "number" && (
                    <p className="text-xs text-muted-foreground">
                      Original:{" "}
                      {formatPrice(
                        plan.hotel.originalTotalPrice,
                        plan.hotel.originalCurrency,
                      )}
                    </p>
                  )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No hotel selected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-2 font-semibold text-foreground">Selected clinic</h3>
            {plan.healthcareEstimate ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {plan.healthcareEstimate.providerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested: {new Date(plan.healthcareEstimate.requestedAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatUsd(plan.healthcareEstimate.estimateMin)} -{" "}
                  {formatUsd(plan.healthcareEstimate.estimateMax)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No clinic quote selected yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {hasTravelSelection && (
        <Card className="no-print mb-8 border-primary/20">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-foreground">Book this itinerary</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a partner below to book flights and/or hotels based on your selected plan.
            </p>
            {destinationCountry && (
              <p className="mt-2 text-xs text-muted-foreground">
                Destination context: {destinationCountry}
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {affiliateBookingOptions.map((option) => (
                <Button key={option.key} asChild>
                  <a
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    aria-label={option.label}
                    title={option.description}
                  >
                    {option.label}
                  </a>
                </Button>
              ))}
            </div>

            <p className="mt-3 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Travel partners handle flights and hotels only. Clinic/hospital costs are paid
              directly to the provider at booking or treatment time.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Partner links may generate an affiliate commission for Carecation.
            </p>
          </CardContent>
        </Card>
      )}

      {provider && itineraryDays.length > 0 && (
        <>
          <div className="no-print">
            <ItineraryTimeline days={itineraryDays} />
          </div>

          <Card className="no-print mt-8 border-primary/20 bg-secondary/50">
            <CardContent className="p-5 text-center">
              <h3 className="mb-2 font-semibold text-foreground">Ready to refine costs?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Request a provider quote to update the healthcare estimate in this itinerary.
              </p>
              <Button asChild>
                <Link href={`/request?providerId=${provider.id}`}>Request a quote</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {!provider && (
        <Card className="no-print mt-8">
          <CardContent className="p-5">
            <h3 className="mb-2 font-semibold text-foreground">Add a provider estimate</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              To include healthcare estimates in your itinerary, choose a clinic and submit a quote request.
            </p>
            <Button asChild>
              <Link href="/results">Browse providers</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="print-only mt-3 text-center text-[10px] text-foreground">
        Copyright {currentYear} Carecation. Healthcare meets adventure.
      </p>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            Loading itinerary...
          </div>
        }
      >
        <ItineraryContent />
      </Suspense>
    </AppShell>
  );
}
