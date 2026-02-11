"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { Stepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  PROCEDURE_CATEGORIES,
  COUNTRIES,
  TRAVEL_MONTHS,
  BUDGET_RANGES,
  LANGUAGES,
  RECOVERY_COMFORT,
} from "@/lib/data/providers-repo";

const STEPS = ["Procedure", "Destination", "Budget", "Preferences"];

export default function IntakePage() {
  usePageReady();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    procedure: "",
    country: "",
    month: "",
    budgetLabel: "",
    language: "",
    recoveryComfort: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!form.procedure;
      case 1: return !!form.country && !!form.month;
      case 2: return !!form.budgetLabel;
      case 3: return !!form.language && !!form.recoveryComfort;
      default: return false;
    }
  };

  const handleSubmit = () => {
    const budget = BUDGET_RANGES.find((b) => b.label === form.budgetLabel);
    const params = new URLSearchParams({
      procedure: form.procedure,
      country: form.country,
      month: form.month,
      budgetMin: String(budget?.min ?? 0),
      budgetMax: String(budget?.max ?? 100000),
      language: form.language,
      recoveryComfort: form.recoveryComfort,
    });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-12 lg:py-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground">Plan your carecation</h1>
          <p className="mt-2 text-muted-foreground">
            Answer a few questions and we will match you with the best providers.
          </p>
        </div>

        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">What type of care are you looking for?</Label>
                <RadioGroup value={form.procedure} onValueChange={(v) => update("procedure", v)}>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Dental" id="Dental" />
                    <Label htmlFor="Dental" className="cursor-pointer flex-1">
                      <span className="font-medium">Dental</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Implants, veneers, crowns, whitening, and general dentistry
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Cosmetic Surgery" id="Cosmetic" />
                    <Label htmlFor="Cosmetic" className="cursor-pointer flex-1">
                      <span className="font-medium">Cosmetic Surgery</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Rhinoplasty, facelift, liposuction, hair transplant, and more
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Orthopedic" id="Orthopedic" />
                    <Label htmlFor="Orthopedic" className="cursor-pointer flex-1">
                      <span className="font-medium">Orthopedic</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Joint replacement, spine surgery, sports medicine
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Bariatric" id="Bariatric" />
                    <Label htmlFor="Bariatric" className="cursor-pointer flex-1">
                      <span className="font-medium">Bariatric</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Weight loss surgery, gastric bypass, sleeve gastrectomy
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Ophthalmology" id="Ophthalmology" />
                    <Label htmlFor="Ophthalmology" className="cursor-pointer flex-1">
                      <span className="font-medium">Ophthalmology</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        LASIK, cataract surgery, eye care treatments
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Cardiology" id="Cardiology" />
                    <Label htmlFor="Cardiology" className="cursor-pointer flex-1">
                      <span className="font-medium">Cardiology</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Heart procedures, cardiovascular treatments
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="Other" id="Other" />
                    <Label htmlFor="Other" className="cursor-pointer flex-1">
                      <span className="font-medium">Other</span>
                      <span className="block text-sm text-muted-foreground mt-0.5">
                        Other medical or healthcare procedures
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Preferred destination</Label>
                  <Select value={form.country} onValueChange={(v) => update("country", v)}>
                    <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">No preference</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">When do you want to travel?</Label>
                  <Select value={form.month} onValueChange={(v) => update("month", v)}>
                    <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                    <SelectContent>
                      {TRAVEL_MONTHS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">What is your budget range?</Label>
                <RadioGroup value={form.budgetLabel} onValueChange={(v) => update("budgetLabel", v)}>
                  {BUDGET_RANGES.map((b) => (
                    <div key={b.label} className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={b.label} id={b.label} />
                      <Label htmlFor={b.label} className="cursor-pointer flex-1 font-medium">
                        {b.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Preferred language</Label>
                  <Select value={form.language} onValueChange={(v) => update("language", v)}>
                    <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">No preference</SelectItem>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Recovery comfort level</Label>
                  <p className="text-sm text-muted-foreground">
                    This affects how many recovery days we factor into your itinerary.
                  </p>
                  <RadioGroup value={form.recoveryComfort} onValueChange={(v) => update("recoveryComfort", v)}>
                    {RECOVERY_COMFORT.map((level) => (
                      <div key={level} className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="cursor-pointer flex-1">
                          <span className="font-medium capitalize">{level}</span>
                          <span className="block text-sm text-muted-foreground mt-0.5">
                            {level === "low"
                              ? "Minimal recovery time needed (1-3 days)"
                              : level === "medium"
                                ? "Moderate recovery with some rest days (4-7 days)"
                                : "Extended recovery with full comfort (7+ days)"}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canNext()}>
                  Find providers
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
