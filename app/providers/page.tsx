"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Building2, User, Mail, Phone, Globe, MapPin, Languages, Stethoscope, Calendar, DollarSign } from "lucide-react";
import { PROCEDURE_CATEGORIES, COUNTRIES, LANGUAGES } from "@/lib/data/providers-repo";

const CONSULTATION_TYPES = ["In-Person", "Video", "Both"] as const;
const PRICE_RANGES = [
  "Under $1,000",
  "$1,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
] as const;

export default function ProvidersPage() {
  usePageReady();
  const router = useRouter();
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
    languages: [] as string[],
    consultationType: "",
    priceRange: "",
    bookingLink: "",
    useCarecationPortal: false,
    accredited: false,
    termsConsent: false,
    additionalInfo: "",
  });

  const update = (key: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleLanguage = (language: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }));
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
      form.languages.length > 0 &&
      form.consultationType &&
      form.priceRange &&
      form.accredited &&
      form.termsConsent
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/providers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("[v0] Provider submission error:", error);
        alert("Failed to submit. Please try again.");
        return;
      }
      
      const result = await response.json();
      console.log("[v0] Provider submission success:", result);
      
      setSubmitted(true);
    } catch (error) {
      console.error("[v0] Provider submission error:", error);
      alert("Failed to submit. Please try again.");
    }
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Thank you for your submission!
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            We have received your provider application for <strong>{form.clinicName}</strong>. 
            Our team will review your information and reach out within 2-3 business days to complete the onboarding process.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button asChild variant="outline">
              <a href="/">Return home</a>
            </Button>
            <Button onClick={() => { setSubmitted(false); setForm({ clinicName: "", providerType: "", contactName: "", email: "", phone: "", website: "", country: "", city: "", specialties: "", languages: [], consultationType: "", priceRange: "", bookingLink: "", useCarecationPortal: false, accredited: false, termsConsent: false, additionalInfo: "" }); }}>
              Submit another provider
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Join Carecation</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Partner with us to reach patients seeking quality healthcare abroad. Complete the form below to begin the onboarding process.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Practice Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Practice Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic/Practice Name *</Label>
                  <Input
                    id="clinicName"
                    required
                    value={form.clinicName}
                    onChange={(e) => update("clinicName", e.target.value)}
                    placeholder="e.g., Bangkok Smile Dental Clinic"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerType">Provider Type *</Label>
                  <Select value={form.providerType} onValueChange={(v) => update("providerType", v)} required>
                    <SelectTrigger id="providerType">
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCEDURE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties/Procedures Offered *</Label>
                  <Textarea
                    id="specialties"
                    required
                    rows={3}
                    value={form.specialties}
                    onChange={(e) => update("specialties", e.target.value)}
                    placeholder="e.g., Dental Implants, Veneers, Crowns, Root Canal"
                  />
                  <p className="text-xs text-muted-foreground">List the procedures and treatments you offer, separated by commas</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person Name *</Label>
                  <Input
                    id="contactName"
                    required
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="contact@clinic.com"
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

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://www.yourpractice.com"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Location</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={form.country} onValueChange={(v) => update("country", v)} required>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
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
                      placeholder="e.g., Bangkok"
                    />
                  </div>
                </div>
              </div>

              {/* Services & Capabilities */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Services & Capabilities</h2>
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken at Practice *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center gap-2">
                        <Checkbox
                          id={`lang-${language}`}
                          checked={form.languages.includes(language)}
                          onCheckedChange={() => toggleLanguage(language)}
                        />
                        <Label htmlFor={`lang-${language}`} className="font-normal cursor-pointer">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationType">Consultation Types *</Label>
                  <Select value={form.consultationType} onValueChange={(v) => update("consultationType", v)} required>
                    <SelectTrigger id="consultationType">
                      <SelectValue placeholder="Select consultation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSULTATION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceRange">Typical Price Range *</Label>
                  <Select value={form.priceRange} onValueChange={(v) => update("priceRange", v)} required>
                    <SelectTrigger id="priceRange">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Estimated range for your most common procedures</p>
                </div>
              </div>

              {/* Booking & Portal */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Booking Preferences</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingLink">Existing Booking Link (optional)</Label>
                  <Input
                    id="bookingLink"
                    type="url"
                    value={form.bookingLink}
                    onChange={(e) => update("bookingLink", e.target.value)}
                    placeholder="https://calendly.com/yourpractice"
                  />
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="useCarecationPortal"
                    checked={form.useCarecationPortal}
                    onCheckedChange={(checked) => update("useCarecationPortal", !!checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="useCarecationPortal" className="font-medium cursor-pointer">
                      Use Carecation booking portal
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      We can provide a booking system integrated with your calendar
                    </p>
                  </div>
                </div>
              </div>

              {/* Accreditation & Terms */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    rows={4}
                    value={form.additionalInfo}
                    onChange={(e) => update("additionalInfo", e.target.value)}
                    placeholder="Tell us about your accreditations, certifications, awards, or anything else that makes your practice stand out..."
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="accredited"
                      checked={form.accredited}
                      onCheckedChange={(checked) => update("accredited", !!checked)}
                      required
                    />
                    <Label htmlFor="accredited" className="font-normal cursor-pointer leading-snug">
                      I confirm that my practice holds valid accreditation/licensing from recognized medical authorities *
                    </Label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="termsConsent"
                      checked={form.termsConsent}
                      onCheckedChange={(checked) => update("termsConsent", !!checked)}
                      required
                    />
                    <Label htmlFor="termsConsent" className="font-normal cursor-pointer leading-snug">
                      I agree to Carecation's provider terms of service and privacy policy *
                    </Label>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!canSubmit()}>
                Submit Provider Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
