"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { usePageReady } from "@/hooks/use-page-ready";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { getProviderById, estimateTotalTripCost, TRAVEL_COST_PLACEHOLDER } from "@/lib/data/providers-repo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Star,
  MapPin,
  Languages,
  ShieldCheck,
  Clock,
  CalendarDays,
  CheckCircle2,
  ArrowLeft,
  User,
  DollarSign,
  Info,
} from "lucide-react";

const mockReviews = [
  {
    name: "Sarah M.",
    rating: 5,
    date: "2 months ago",
    text: "The entire experience felt well-coordinated and professional. The care team was attentive, the facility was modern, and I felt genuinely supported throughout my recovery.",
  },
  {
    name: "James K.",
    rating: 4,
    date: "3 months ago",
    text: "Very organized from consultation to aftercare. The package covered everything I needed, and the treatment coordinator answered all my questions thoroughly before I traveled.",
  },
  {
    name: "Maria L.",
    rating: 5,
    date: "5 months ago",
    text: "I was understandably nervous about receiving care abroad, but the clinic made every step feel clear and manageable. The follow-up care was just as thorough as the procedure itself.",
  },
];

export default function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  usePageReady();
  const { id } = use(params);
  const [showActions, setShowActions] = useState(false);
  useEffect(() => { const onScroll = () => setShowActions(window.scrollY > 420); onScroll(); window.addEventListener("scroll", onScroll, {passive:true}); return () => window.removeEventListener("scroll", onScroll); }, []);
  const provider = getProviderById(id);

  if (!provider) {
    notFound();
  }

  const tripCost = estimateTotalTripCost(provider);
  const stayDays = provider.recoveryDays + 4;
  const procedureText = provider.procedures.join(" ").toLowerCase();
  const providerImage = procedureText.includes("fertility") ? "/Clinics/Barcelona-Fertility-Clinic.jpg" : procedureText.includes("eye") ? "/Clinics/Seoul-Eye-Surgery-Center.jpg" : procedureText.includes("orthop") ? "/Clinics/Prague-Orthopedic-Hospital.jpg" : procedureText.includes("cardio") || procedureText.includes("heart") ? "/Clinics/Mexico-City-Heart-Institute.jpg" : procedureText.includes("cosmetic") || procedureText.includes("aesthetic") ? "/Clinics/Istanbul-Aesthetic-Clinic.jpg" : "/Clinics/Bangkok-Smile-Dental-Center.jpg";

  return (
    <AppShell>
      <div className="care-page mx-auto max-w-6xl">
        <Button variant="ghost" asChild className="mb-6 text-muted-foreground">
          <Link href="/clinics">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Clinics
          </Link>
        </Button>

        <div className="provider-layout flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="care-h1 text-4xl sm:text-5xl">
                  {provider.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">
                      {provider.city}, {provider.country}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1"
                    aria-label={`Rated ${provider.rating} out of 5 with ${provider.reviewCount} reviews`}
                  >
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">
                      {provider.rating}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                {/* Accreditation badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {provider.accreditation.map((acc) => (
                    <Badge
                      key={acc}
                      className="bg-primary/10 text-primary border-0 hover:bg-primary/20"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" aria-hidden="true" />
                      {acc}
                    </Badge>
                  ))}
                </div>
                {/* Languages */}
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm">
                    {provider.languages.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mb-12 aspect-[1.8] overflow-hidden rounded-[28px] shadow-[0_30px_60px_-30px_rgba(30,45,15,.45)]"><Image src={providerImage} alt={`${provider.name} facility`} fill priority sizes="(max-width: 1024px) 100vw, 900px" className="object-cover"/></div>
            <div className="space-y-14">
              <section id="overview" className="mt-6 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {provider.description}
                </p>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Available procedures
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {provider.procedures.map((proc) => (
                      <Badge key={proc} variant="secondary">
                        {proc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3"
                  role="note"
                >
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Accreditation and procedure details are reported by the
                    provider. We recommend verifying credentials independently
                    and consulting your personal physician before making any
                    decisions.
                  </p>
                </div>
              </section>

              <section id="cost" className="mt-6 space-y-6 border-t border-border pt-10">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Procedure cost range
                  </h3>
                  <p className="text-2xl font-bold text-foreground">
                    ${provider.priceRangeUSD.min.toLocaleString()} -{" "}
                    ${provider.priceRangeUSD.max.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The final cost depends on the specific procedure, complexity,
                    and your individual needs. This is the provider{"'"}s quoted
                    range.
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      Estimated total trip cost
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="How is the estimated trip cost calculated?"
                          >
                            <Info className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px]">
                          <p className="text-xs">
                            This estimate combines the procedure cost with
                            placeholder travel expenses: ~${TRAVEL_COST_PLACEHOLDER.flights} for flights,
                            ~${TRAVEL_COST_PLACEHOLDER.lodgingPerNight}/night lodging, and ~${TRAVEL_COST_PLACEHOLDER.meals}/day
                            for meals over a {stayDays}-day stay. Your actual
                            costs will vary based on your departure city, travel
                            dates, and accommodation choices.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${tripCost.min.toLocaleString()} -{" "}
                    ${tripCost.max.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Approximate total including procedure, flights, lodging, and
                    meals for a {stayDays}-day stay.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    What{"'"}s included
                  </h3>
                  <ul className="space-y-2">
                    {provider.packageIncludes.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section id="reviews" className="mt-6 space-y-4 border-t border-border pt-10">
                {mockReviews.map((review, i) => (
                  <div key={i} className="grid gap-4 border-b border-border py-6 sm:grid-cols-[1fr_180px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {review.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                        <div
                          className="ml-auto flex items-center gap-0.5"
                          aria-label={`${review.rating} out of 5 stars`}
                        >
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star
                              key={j}
                              className="h-3.5 w-3.5 fill-accent text-accent"
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.text}
                      </p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Reviews shown are for demonstration purposes. In a live
                  application, reviews would be verified and sourced from real
                  patients.
                </p>
              </section>

              <section id="logistics" className="mt-6 space-y-6 border-t border-border pt-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Typical recovery period
                        </p>
                        <p className="font-semibold text-foreground">
                          {provider.recoveryDays} day{provider.recoveryDays !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Suggested total stay
                        </p>
                        <p className="font-semibold text-foreground">
                          {provider.recoveryDays + 4} -{" "}
                          {provider.recoveryDays + 6} days
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Accommodation guidance
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We suggest staying within 15 minutes of{" "}
                    {provider.name} in {provider.city}. The surrounding area
                    typically offers a range of accommodations, from
                    budget-friendly options to upscale hotels, with convenient
                    access to pharmacies, restaurants, and local amenities.
                  </p>
                </div>

                <div
                  className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-3"
                  role="note"
                >
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Travel and logistics information is provided as a general
                    guide. We encourage you to research visa requirements,
                    travel insurance, and any health advisories for your
                    destination.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0" aria-label="Pricing and actions">
            <div className="sticky top-24 space-y-3">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Procedure cost from
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      ${provider.priceRangeUSD.min.toLocaleString()}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <p className="text-xs text-muted-foreground">
                        Est. total trip cost
                      </p>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      ${tripCost.min.toLocaleString()} -{" "}
                      ${tripCost.max.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Incl. flights, lodging & meals
                    </p>
                  </div>
                  <Separator />
                  <Button asChild className="w-full">
                    <Link href={`/itinerary?providerId=${provider.id}`}>
                      Build itinerary
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    <Link href={`/request?providerId=${provider.id}`}>
                      Request a quote
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
        {showActions && <div className="provider-action-bar" role="region" aria-label="Provider actions"><div><span className="text-sm font-bold">Est. trip</span><strong>${tripCost.min.toLocaleString()} – ${tripCost.max.toLocaleString()}</strong></div><Link href={`/request?providerId=${provider.id}`} className="provider-action-secondary">Request a quote</Link><Link href={`/itinerary?providerId=${provider.id}`} className="provider-action-primary">Build itinerary</Link></div>}
      </div>
    </AppShell>
  );
}
