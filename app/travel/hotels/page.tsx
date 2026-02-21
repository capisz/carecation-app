"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useLoading } from "@/components/loading-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { upsertTravelSelections, type PlannedHotel } from "@/lib/itinerary-plan";
import { cn } from "@/lib/utils";
import { AlertCircle, BedDouble, CheckCircle2, DollarSign, Loader2 } from "lucide-react";

type HotelResult = {
  id: string;
  hotelId: string;
  name: string;
  cityCode: string;
  rating: number | null;
  totalPrice: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  roomDescription: string | null;
  boardType: string | null;
  cancellationPolicy: string | null;
};

type SearchResponse<T> = {
  results: T[];
  count: number;
  error?: string;
  warning?: string;
};

type CurrencyConversionResponse = {
  originalAmount: number;
  originalCurrency: string;
  normalizedCurrency: string;
  usdAmount: number;
  rateToUsd: number;
  rateDate: string | null;
};

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

function getHotelImageCandidates(hotelName: string): string[] {
  const trimmed = hotelName.trim();
  const normalizedName = trimmed
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return [
    `/hotels/${encodeURIComponent(trimmed)}.jpg`,
    `/hotels/${normalizedName}.jpg`,
    "/placeholder.svg",
  ];
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

function toPlannedHotel(
  hotel: HotelResult,
  conversion: CurrencyConversionResponse,
): PlannedHotel {
  return {
    id: hotel.id,
    hotelId: hotel.hotelId,
    name: hotel.name,
    cityCode: hotel.cityCode,
    totalPrice: conversion.usdAmount,
    currency: "USD",
    originalTotalPrice: conversion.originalAmount,
    originalCurrency: conversion.normalizedCurrency,
    conversionRateToUsd: conversion.rateToUsd,
    conversionDate: conversion.rateDate,
    checkInDate: hotel.checkInDate,
    checkOutDate: hotel.checkOutDate,
  };
}

function HotelsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { withLoading } = useLoading();
  const { toast } = useToast();

  const cityCode = (searchParams.get("cityCode") ?? "").trim().toUpperCase();
  const checkInDate = (searchParams.get("checkInDate") ?? "").trim();
  const checkOutDate = (searchParams.get("checkOutDate") ?? "").trim();
  const adultsValue = Number(searchParams.get("adults") ?? 1);
  const adults = Number.isFinite(adultsValue)
    ? Math.min(9, Math.max(1, adultsValue))
    : 1;
  const destinationLabel =
    searchParams.get("destinationLabel")?.trim() || cityCode || "your destination";
  const preferredDestinations = (searchParams.get("preferredDestinations") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const procedure = searchParams.get("procedure") ?? "";
  const budgetLabel = searchParams.get("budgetLabel") ?? "";

  const browseCareHref = useMemo(() => {
    const params = new URLSearchParams();
    if (procedure) params.set("procedure", procedure);
    if (budgetLabel) params.set("budgetLabel", budgetLabel);
    if (preferredDestinations.length > 0) {
      params.set("preferredDestinations", preferredDestinations.join(","));
    }
    return params.toString().length > 0 ? `/results?${params.toString()}` : "/results";
  }, [procedure, budgetLabel, preferredDestinations]);

  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isContinuingToCare, setIsContinuingToCare] = useState(false);
  const [imageAttemptById, setImageAttemptById] = useState<Record<string, number>>({});
  const [visibleHotelsCount, setVisibleHotelsCount] = useState(6);
  const [usdByHotelId, setUsdByHotelId] = useState<Record<string, number>>({});
  const [conversionErrorByHotelId, setConversionErrorByHotelId] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (!cityCode || !checkInDate || !checkOutDate) {
      setError("Missing hotel search inputs. Return to Browse Travel and search again.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoadingHotels(true);
      setError(null);
      setWarning(null);
      try {
        const hotelsResponse = await withLoading(() =>
          postJson<SearchResponse<HotelResult>>("/api/hotels/search", {
            cityCode,
            checkInDate,
            checkOutDate,
            adults,
          }),
        );
        if (cancelled) return;
        setHotels(hotelsResponse.results);
        setSelectedHotelId(hotelsResponse.results[0]?.id ?? null);
        setVisibleHotelsCount(6);
        setWarning(hotelsResponse.warning ?? null);
      } catch (searchError) {
        if (cancelled) return;
        setHotels([]);
        setSelectedHotelId(null);
        setWarning(null);
        setError(
          searchError instanceof Error
            ? searchError.message
            : "Failed to fetch hotel offers.",
        );
      } finally {
        if (!cancelled) {
          setIsLoadingHotels(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [withLoading, cityCode, checkInDate, checkOutDate, adults]);

  const selectedHotel = useMemo(
    () => hotels.find((hotel) => hotel.id === selectedHotelId) ?? null,
    [hotels, selectedHotelId],
  );

  const visibleHotels = useMemo(
    () => hotels.slice(0, visibleHotelsCount),
    [hotels, visibleHotelsCount],
  );

  useEffect(() => {
    let cancelled = false;

    if (hotels.length === 0) {
      setUsdByHotelId({});
      setConversionErrorByHotelId({});
      return;
    }

    const run = async () => {
      const nextUsdById: Record<string, number> = {};
      const nextErrors: Record<string, string> = {};

      await Promise.all(
        hotels.map(async (hotel) => {
          const normalizedCurrency = normalizeCurrencyCode(hotel.currency);
          if (normalizedCurrency === "USD") {
            nextUsdById[hotel.id] = hotel.totalPrice;
            return;
          }

          try {
            const conversion = await convertPriceToUsd(hotel.totalPrice, hotel.currency);
            nextUsdById[hotel.id] = conversion.usdAmount;
          } catch (conversionError) {
            nextErrors[hotel.id] =
              conversionError instanceof Error
                ? conversionError.message
                : "USD conversion unavailable";
          }
        }),
      );

      if (cancelled) return;
      setUsdByHotelId(nextUsdById);
      setConversionErrorByHotelId(nextErrors);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [hotels]);

  const persistSelectedHotel = async (): Promise<boolean> => {
    if (!selectedHotel) {
      toast({
        title: "No hotel selected",
        description: "Select a hotel to continue.",
      });
      return false;
    }

    try {
      const conversion = await withLoading(() =>
        convertPriceToUsd(selectedHotel.totalPrice, selectedHotel.currency),
      );
      const plannedHotel = toPlannedHotel(selectedHotel, conversion);
      upsertTravelSelections({ hotel: plannedHotel });
      return true;
    } catch (conversionError) {
      toast({
        title: "Unable to add hotel",
        description:
          conversionError instanceof Error
            ? conversionError.message
            : "Could not convert selected hotel price to USD.",
      });
      return false;
    }
  };

  const handleContinueToCare = async () => {
    setIsContinuingToCare(true);
    try {
      const saved = await persistSelectedHotel();
      if (!saved) {
        return;
      }
      router.push(browseCareHref);
    } finally {
      setIsContinuingToCare(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Browse Hotels</h1>
          <p className="text-muted-foreground">
            Hotel options for <span className="font-medium text-foreground">{destinationLabel}</span>
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">City code: {cityCode || "—"}</Badge>
          <Badge variant="secondary">
            {checkInDate || "—"} → {checkOutDate || "—"}
          </Badge>
          <Badge variant="secondary">{adults} adult(s)</Badge>
          {procedure && <Badge variant="secondary">Procedure: {procedure}</Badge>}
          {preferredDestinations.length > 0 && (
            <Badge variant="secondary">
              Preferred: {preferredDestinations.join(", ")}
            </Badge>
          )}
        </div>

        {error && (
          <div className="mb-8 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {warning && (
          <div className="mb-8 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{warning}</p>
          </div>
        )}

        {isLoadingHotels && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading hotel offers...
          </div>
        )}

        {!isLoadingHotels && hotels.length === 0 && !error && (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            No hotel offers found for this search.
          </div>
        )}

        {!isLoadingHotels && hotels.length > 0 && (
          <>
            <div className="mb-8 grid gap-4 lg:grid-cols-2">
              {visibleHotels.map((hotel) => {
                const isSelected = selectedHotelId === hotel.id;
                const imageCandidates = getHotelImageCandidates(hotel.name);
                const imageAttempt = imageAttemptById[hotel.id] ?? 0;
                const imageSrc =
                  imageCandidates[Math.min(imageAttempt, imageCandidates.length - 1)];
                const normalizedCurrency = normalizeCurrencyCode(hotel.currency);
                const usdValue = usdByHotelId[hotel.id];
                const conversionError = conversionErrorByHotelId[hotel.id];
                const hasUsdValue =
                  typeof usdValue === "number" || normalizedCurrency === "USD";
                const displayedUsdValue =
                  typeof usdValue === "number" ? usdValue : hotel.totalPrice;
                const usdPrimaryText = hasUsdValue
                  ? formatPrice(displayedUsdValue, "USD")
                  : conversionError
                    ? "USD conversion unavailable"
                    : "Converting...";

                return (
                  <Card
                    key={hotel.id}
                    className={cn(
                      "overflow-hidden shadow-sm transition-all hover:shadow-lg",
                      isSelected && "border-primary ring-1 ring-primary/50",
                    )}
                  >
                    <CardContent className="p-0">
                      {/* Borderless top image area for /public/hotels/<Hotel-Name>.jpg */}
                      <div className="relative h-44 w-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc}
                          alt={hotel.name}
                          className="h-full w-full object-cover"
                          onError={() =>
                            setImageAttemptById((prev) => ({
                              ...prev,
                              [hotel.id]: (prev[hotel.id] ?? 0) + 1,
                            }))
                          }
                        />
                      </div>

                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{hotel.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {hotel.cityCode}
                              {hotel.rating !== null ? ` • ${hotel.rating}/5` : ""}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            <BedDouble className="mr-1 h-3.5 w-3.5" />
                            {hotel.hotelId}
                          </Badge>
                        </div>

                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Total in USD
                        </p>
                        <p className="mb-2 text-2xl font-semibold text-foreground">
                          {usdPrimaryText}
                        </p>
                        {normalizedCurrency !== "USD" && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            Original: {formatPrice(hotel.totalPrice, hotel.currency)}
                            {conversionError ? " • USD conversion unavailable" : ""}
                          </p>
                        )}

                        <p className="mb-2 text-sm text-muted-foreground">
                          {hotel.checkInDate} → {hotel.checkOutDate}
                        </p>

                        {hotel.roomDescription && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            Room: {hotel.roomDescription}
                          </p>
                        )}

                        {hotel.boardType && (
                          <p className="mb-2 text-sm text-muted-foreground">
                            Board: {hotel.boardType}
                          </p>
                        )}

                        {hotel.cancellationPolicy && (
                          <div className="mb-3 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
                            {hotel.cancellationPolicy}
                          </div>
                        )}

                        <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Displayed in USD
                          {normalizedCurrency !== "USD"
                            ? ` • Source: ${normalizedCurrency}`
                            : ""}
                        </div>

                        <Button
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSelectedHotelId(hotel.id)}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Hotel selected
                            </>
                          ) : (
                            "Select hotel"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {hotels.length > visibleHotelsCount && (
              <div className="mb-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVisibleHotelsCount((count) => count + 6)}
                >
                  Load more hotels
                </Button>
              </div>
            )}
          </>
        )}

        <Card className="border-primary/20">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Finalize your stay</h2>
              <p className="text-sm text-muted-foreground">
                Your selected hotel will be added automatically when you continue.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:w-auto">
              <Button asChild>
                <Link href="/itinerary">View itinerary</Link>
              </Button>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button asChild variant="outline">
                  <Link href="/travel">Back to flights</Link>
                </Button>
                <Button
                  type="button"
                  onClick={handleContinueToCare}
                  disabled={!selectedHotel || isContinuingToCare}
                >
                  {isContinuingToCare ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving hotel...
                    </>
                  ) : (
                    "Next: Select care clinic"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AppShell>
  );
}

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground lg:px-8 lg:py-12">
            Loading hotel options...
          </div>
        </AppShell>
      }
    >
      <HotelsPageContent />
    </Suspense>
  );
}
