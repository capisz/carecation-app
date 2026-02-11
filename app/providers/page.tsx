"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const PROVIDER_TYPES = [
  "Dental",
  "Cosmetic Surgery",
  "Orthopedic",
  "Bariatric",
  "Hair Transplant",
  "Ophthalmology",
  "Cardiology",
  "Other",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Arabic",
  "Mandarin",
  "Japanese",
];

const CONSULTATION_TYPES = [
  "In-person",
  "Video",
  "Hybrid",
];

const COUNTRIES = [
  "Mexico",
  "Costa Rica",
  "Turkey",
  "Spain",
  "Portugal",
  "Thailand",
  "Colombia",
  "Poland",
  "Hungary",
  "India",
  "Other",
];

const ACCREDITATION_OPTIONS = [
  "JCI (Joint Commission International)",
  "ISO 9001",
  "AAAHC",
  "National Board Certification",
  "Other",
  "None",
];

export default function ProvidersPage() {
  usePageReady();
  const { toast } = useToast();

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    clinicName: "",
    providerType: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    country: "",
    city: "",
    specialties: "",
    accreditations: [] as string[],
    languages: [] as string[],
    consultationTypes: [] as string[],
    priceRange: "",
    bookingMethod: "portal",
    bookingLink: "",
    consentTerms: false,
  });

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCheckboxArray = (key: string, value: string) => {
    setForm((prev) => {
      const arr = prev[key as keyof typeof form] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const canSubmit = () => {
    return (
      form.clinicName &&
      form.providerType &&
      form.contactName &&
      form.email &&
      form.phone &&
      form.country &&
      form.city &&
      form.specialties &&
      form.accreditations.length > 0 &&
      form.languages.length > 0 &&
      form.consultationTypes.length > 0 &&
      form.priceRange &&
      (form.bookingMethod === "portal" || form.bookingLink) &&
      form.consentTerms
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      timestamp: new Date().toISOString(),
    };
    console.log("Provider intake payload:", payload);
    toast({
      title: "Application submitted!",
      description: "Thank you for joining Carecation. We'll review your information and be in touch soon.",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Application submitted!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you, {form.contactName}. We have received your provider application and will review your information. Our team will get back to you within 2-3 business days.
          </p>
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8 lg:py-12">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl mb-2">
          Partner with Carecation
        </h1>
        <p className="text-muted-foreground mb-8">
          Join our network of accredited healthcare providers and reach patients worldwide.
        </p>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clinic Information */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-lg font-semibold text-foreground">Clinic Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic/Practice Name *</Label>
                  <Input
                    id="clinicName"
                    required
                    value={form.clinicName}
                    onChange={(e) => update("clinicName", e.target.value)}
                    placeholder="Enter your clinic or practice name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerType">Primary Provider Type *</Label>
                  <Select value={form.providerType} onValueChange={(v) => update("providerType", v)}>
                    <SelectTrigger id="providerType">
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    required
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-lg font-semibold text-foreground">Location</h2>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={form.country} onValueChange={(v) => update("country", v)}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="City name"
                  />
                </div>
              </div>

              {/* Services & Specialties */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-lg font-semibold text-foreground">Services & Specialties</h2>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties/Services Offered *</Label>
                  <Textarea
                    id="specialties"
                    required
                    rows={3}
                    value={form.specialties}
                    onChange={(e) => update("specialties", e.target.value)}
                    placeholder="e.g., Dental implants, veneers, root canal treatment, cosmetic dentistry..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Accreditations *</Label>
                  <div className="space-y-2">
                    {ACCREDITATION_OPTIONS.map((acc) => (
                      <div key={acc} className="flex items-center space-x-2">
                        <Checkbox
                          id={`acc-${acc}`}
                          checked={form.accreditations.includes(acc)}
                          onCheckedChange={() => toggleCheckboxArray("accreditations", acc)}
                        />
                        <Label htmlFor={`acc-${acc}`} className="font-normal cursor-pointer">
                          {acc}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Languages Spoken *</Label>
                  <div className="space-y-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={form.languages.includes(lang)}
                          onCheckedChange={() => toggleCheckboxArray("languages", lang)}
                        />
                        <Label htmlFor={`lang-${lang}`} className="font-normal cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation & Booking */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-lg font-semibold text-foreground">Consultation & Booking</h2>

                <div className="space-y-3">
                  <Label>Consultation Types Available *</Label>
                  <div className="space-y-2">
                    {CONSULTATION_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`consultation-${type}`}
                          checked={form.consultationTypes.includes(type)}
                          onCheckedChange={() => toggleCheckboxArray("consultationTypes", type)}
                        />
                        <Label htmlFor={`consultation-${type}`} className="font-normal cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceRange">Typical Price Range (USD) *</Label>
                  <Input
                    id="priceRange"
                    required
                    value={form.priceRange}
                    onChange={(e) => update("priceRange", e.target.value)}
                    placeholder="e.g., $500 - $2,000"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Booking Method *</Label>
                  <RadioGroup value={form.bookingMethod} onValueChange={(v) => update("bookingMethod", v)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="portal" id="booking-portal" />
                      <Label htmlFor="booking-portal" className="font-normal cursor-pointer">
                        Use Carecation booking portal
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="custom" id="booking-custom" />
                      <Label htmlFor="booking-custom" className="font-normal cursor-pointer">
                        Provide custom booking link
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {form.bookingMethod === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="bookingLink">Booking Link *</Label>
                    <Input
                      id="bookingLink"
                      type="url"
                      value={form.bookingLink}
                      onChange={(e) => update("bookingLink", e.target.value)}
                      placeholder="https://your-booking-system.com"
                    />
                  </div>
                )}
              </div>

              {/* Terms & Consent */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consent"
                    checked={form.consentTerms}
                    onCheckedChange={(checked) => update("consentTerms", checked)}
                  />
                  <div>
                    <Label htmlFor="consent" className="font-normal cursor-pointer">
                      I agree to Carecation's terms and conditions and consent to be contacted about this application *
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      By checking this, you confirm that all information provided is accurate and you authorize Carecation to review your application.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit()}>
                <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                Submit Provider Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AppShell>
  );
}
