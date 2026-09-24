"use client";

import React from "react"

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getProviderById } from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { readActivePlanId, upsertHealthcareEstimate } from "@/lib/itinerary-plan";

function RequestContent() {
  usePageReady();
  const searchParams = useSearchParams();
  const providerId = searchParams.get("providerId");
  const provider = providerId ? getProviderById(providerId) : null;
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    travelWindow: "",
    notes: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      providerId: provider?.id,
      providerName: provider?.name,
      planId: readActivePlanId(),
    };

    await fetch("/api/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (provider) {
      upsertHealthcareEstimate({
        providerId: provider.id,
        providerName: provider.name,
        estimateMin: provider.priceRangeUSD.min,
        estimateMax: provider.priceRangeUSD.max,
        currency: "USD",
        requestedAt: new Date().toISOString(),
      });
    }

    toast({
      title: "Quote requested!",
      description: `Your request for ${provider?.name ?? "a provider"} has been submitted and added to your itinerary estimate.`,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="care-page mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-8 grid h-[72px] w-[72px] place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="care-h1 mb-5">
          Request sent.
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg font-semibold leading-relaxed text-muted-foreground">
          {provider ? `${provider.name} will reply within 24–48 hours. The estimate is now in your itinerary.` : `Thank you, ${form.name}. Your request has been submitted.`}
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/itinerary" className="care-pill">View itinerary</Link>
          <Link href="/clinics" className="self-center font-bold text-muted-foreground underline underline-offset-4">Browse more clinics</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="care-page request-page">
      <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
        <Link href={provider ? `/provider/${provider.id}` : "/results"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="care-h1 mb-3">
        Request a quote
      </h1>
      {provider && <p className="mb-10 text-lg font-semibold text-muted-foreground">{provider.name} · {provider.city} · from ${provider.priceRangeUSD.min.toLocaleString()}</p>}

      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="request-fields grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelWindow">When do you want to travel? *</Label>
              <Input
                id="travelWindow"
                required
                value={form.travelWindow}
                onChange={(e) => update("travelWindow", e.target.value)}
                placeholder="March – April 2027"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Additional notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any specific requirements, health conditions, or questions..."
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Send className="h-4 w-4 mr-2" />
              Send request <span className="ml-2">→</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RequestPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
        <RequestContent />
      </Suspense>
      <Toaster />
    </AppShell>
  );
}
