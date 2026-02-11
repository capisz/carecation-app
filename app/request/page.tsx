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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      providerId: provider?.id,
      providerName: provider?.name,
    };
    console.log("Quote request payload:", payload);
    toast({
      title: "Quote requested!",
      description: `Your request for ${provider?.name ?? "a provider"} has been submitted.`,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Quote request submitted!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you, {form.name}. We have received your quote request
          {provider ? ` for ${provider.name}` : ""}. Our team will get
          back to you within 24-48 hours.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/results">Browse more providers</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8 lg:py-12">
      <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
        <Link href={provider ? `/provider/${provider.id}` : "/results"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </Button>

      <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
        Request a Quote
      </h1>
      <p className="text-muted-foreground mb-8">
        Fill in your details and we will connect you with the provider for a
        personalized quote.
      </p>

      {provider && (
        <Card className="mb-8">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{provider.name}</p>
              <p className="text-sm text-muted-foreground">
                {provider.city}, {provider.country}
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 shrink-0">
              From ${provider.priceRangeUSD.min.toLocaleString()}
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Label htmlFor="email">Email address *</Label>
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
              <Label htmlFor="travelWindow">Preferred travel window *</Label>
              <Input
                id="travelWindow"
                required
                value={form.travelWindow}
                onChange={(e) => update("travelWindow", e.target.value)}
                placeholder="e.g., March 2026 - April 2026"
              />
            </div>

            <div className="space-y-2">
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
              Submit quote request
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
