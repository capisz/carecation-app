"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  PROCEDURE_CATEGORIES,
  INTAKE_DESTINATIONS,
  TRAVEL_MONTHS,
  BUDGET_RANGES,
} from "@/lib/data/providers-repo";
import { upsertTravelRecommendation } from "@/lib/itinerary-plan";
import { findTravelLocation } from "@/lib/travel-locations";

const STEPS = ["Procedure", "Destinations", "Budget", "Travel"];

type IntakeForm = {
  procedure: string;
  preferredDestinations: string[];
  month: string;
  budgetLabel: string;
};

function buildTravelSummary(form: IntakeForm): {
  destination: string;
  cityCode: string;
  airportCodes: string[];
  summary: string;
} {
  const profile =
    findTravelLocation(form.preferredDestinations[0]) ??
    findTravelLocation("Thailand");
  const destination = profile?.recommendedCity ?? "Bangkok";
  const cityCode = profile?.recommendedCityCode ?? "BKK";
  const airportCodes = (profile?.airports ?? []).map((airport) => airport.iata).slice(0, 3);
  const budget = form.budgetLabel || "flexible budget";
  const procedure = form.procedure || "care";
  const month = form.month || "your preferred month";
  const selectedDestinationsText =
    form.preferredDestinations.length > 0
      ? ` Preferred locations: ${form.preferredDestinations.join(", ")}.`
      : "";

  const airportText =
    airportCodes.length > 0 ? ` Typical airports: ${airportCodes.join(", ")}.` : "";

  return {
    destination,
    cityCode,
    airportCodes,
    summary: `Recommended start: ${destination} (${cityCode}). Based on ${procedure} in ${month} with ${budget}, begin by comparing flights first, then add a hotel and care estimate to your itinerary.${selectedDestinationsText}${airportText}`,
  };
}

export default function IntakePage() {
  usePageReady();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<IntakeForm>({
    procedure: "",
    preferredDestinations: [],
    month: "",
    budgetLabel: "",
  });

  const recommendation = useMemo(() => buildTravelSummary(form), [form]);

  const update = (key: keyof IntakeForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return Boolean(form.procedure);
      case 1:
        return form.preferredDestinations.length > 0 && Boolean(form.month);
      case 2:
        return Boolean(form.budgetLabel);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const toggleDestination = (destination: string) => {
    setForm((prev) => {
      const exists = prev.preferredDestinations.includes(destination);
      return {
        ...prev,
        preferredDestinations: exists
          ? prev.preferredDestinations.filter((value) => value !== destination)
          : [...prev.preferredDestinations, destination],
      };
    });
  };

  const openBrowseTravelWithRecommendation = () => {
    const rec = buildTravelSummary(form);
    upsertTravelRecommendation({
      procedure: form.procedure,
      country: form.preferredDestinations[0] ?? "Any",
      month: form.month,
      budgetLabel: form.budgetLabel,
      recommendedDestination: rec.destination,
      recommendedCityCode: rec.cityCode,
      recommendedAirportCodes: rec.airportCodes,
      preferredDestinations: form.preferredDestinations,
      summary: rec.summary,
      createdAt: new Date().toISOString(),
    });

    const params = new URLSearchParams({
      destination: rec.destination,
      destinationCityCode: rec.cityCode,
      destinationAirports: rec.airportCodes.join(","),
      country: form.preferredDestinations[0] || "Any",
      preferredDestinations: form.preferredDestinations.join(","),
      month: form.month,
      procedure: form.procedure,
      budgetLabel: form.budgetLabel,
    });
    router.push(`/travel?${params.toString()}`);
  };

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  return (
    <AppShell>
      <div ref={contentRef} className="mx-auto max-w-2xl px-4 py-12 lg:py-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground">Plan your carecation</h1>
          <p className="mt-2 text-muted-foreground">
            Follow the flow: care preferences, destination, budget, then travel.
          </p>
        </div>

        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  What procedure are you looking for?
                </Label>
                <RadioGroup
                  value={form.procedure}
                  onValueChange={(value) => update("procedure", value)}
                >
                  {PROCEDURE_CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={cat} id={cat} />
                        <Label htmlFor={cat} className="cursor-pointer flex-1">
                          <span className="font-medium">{cat}</span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Preferred destinations (select multiple)
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {INTAKE_DESTINATIONS.map((destination) => {
                      const checked = form.preferredDestinations.includes(destination);
                      return (
                        <label
                          key={destination}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleDestination(destination)}
                          />
                          <span className="text-sm text-foreground">{destination}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected:{" "}
                    {form.preferredDestinations.length > 0
                      ? form.preferredDestinations.join(", ")
                      : "none"}
                  </p>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">When do you want to travel?</Label>
                  <Select value={form.month} onValueChange={(value) => update("month", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_MONTHS.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">What is your budget range?</Label>
                <RadioGroup
                  value={form.budgetLabel}
                  onValueChange={(value) => update("budgetLabel", value)}
                >
                  {BUDGET_RANGES.map((budget) => (
                    <div
                      key={budget.label}
                      className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={budget.label} id={budget.label} />
                        <Label htmlFor={budget.label} className="cursor-pointer flex-1 font-medium">
                          {budget.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
                  <h2 className="text-base font-semibold text-foreground">Travel recommendation</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {recommendation.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-background px-2 py-1">
                      City code: {recommendation.cityCode}
                    </span>
                    {recommendation.airportCodes.length > 0 && (
                      <span className="rounded-md bg-background px-2 py-1">
                        Airports: {recommendation.airportCodes.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click Next to continue to Browse Travel.
                </p>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t pt-6">
              <Button
                variant="outline"
                onClick={() => goToStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => goToStep(Math.min(STEPS.length - 1, step + 1))}
                  disabled={!canNext()}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={openBrowseTravelWithRecommendation} disabled={!canNext()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
