"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ItineraryTimeline, generateItinerary } from "@/components/itinerary-timeline";
import { getProviderById } from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, MapPin, Star, CalendarDays, FileText } from "lucide-react";

function ItineraryContent() {
  usePageReady();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const provider = providerId ? getProviderById(providerId) : null;

  if (!provider) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">No provider selected</h1>
        <p className="text-muted-foreground mb-6">
          Please select a provider first to generate your itinerary.
        </p>
        <Button asChild>
          <Link href="/results">Browse providers</Link>
        </Button>
      </div>
    );
  }

  const itinerary = generateItinerary(
    provider.name,
    provider.city,
    provider.country,
    provider.recoveryDays,
    provider.procedures
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="no-print">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
          <Link href={`/provider/${provider.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to provider
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Your Carecation Itinerary
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalized {itinerary.length}-day plan for {provider.city},{" "}
            {provider.country}
          </p>
        </div>
        <div className="no-print flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button asChild size="sm">
            <Link href={`/request?providerId=${provider.id}`}>
              <FileText className="h-4 w-4 mr-2" />
              Request quote
            </Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-1">
              <h2 className="font-semibold text-foreground text-lg">{provider.name}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.city}, {provider.country}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="font-medium text-foreground">{provider.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {provider.procedures.slice(0, 3).map((proc) => (
                  <Badge key={proc} variant="secondary" className="text-xs">
                    {proc}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <CalendarDays className="h-4 w-4" />
                {itinerary.length} days
              </div>
              <p className="text-lg font-bold text-primary mt-1">
                From ${provider.priceRangeUSD.min.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ItineraryTimeline days={itinerary} />

      <Card className="mt-8 bg-secondary/50 border-primary/20">
        <CardContent className="p-5 text-center">
          <h3 className="font-semibold text-foreground mb-2">Ready to book?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Request a personalized quote from {provider.name} with your specific
            travel dates and procedure details.
          </p>
          <Button asChild>
            <Link href={`/request?providerId=${provider.id}`}>
              Request a quote
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading itinerary...</div>}>
        <ItineraryContent />
      </Suspense>
    </AppShell>
  );
}
