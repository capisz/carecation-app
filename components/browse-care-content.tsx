"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { upsertHealthcareEstimate } from "@/lib/itinerary-plan";
import { cn } from "@/lib/utils";
import {
  Search,
  MapPin,
  Star,
  Building2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

type ClinicItem = {
  id: string;
  name: string;
  image: string;
  location: string;
  specialty: string;
  rating: number;
  verified: boolean;
  estimateMinUSD: number;
  estimateMaxUSD: number;
  details: string;
};

const CLINICS: ClinicItem[] = [
  {
    id: "clinic-bangkok-smile",
    name: "Bangkok Smile Dental Center",
    image: "/Clinics/Bangkok-Smile-Dental-Center.jpg",
    location: "Bangkok, Thailand",
    specialty: "Dental",
    rating: 4.8,
    verified: true,
    estimateMinUSD: 1200,
    estimateMaxUSD: 4200,
    details:
      "High-volume dental center for implants, veneers, and restorative treatment with international patient coordinators.",
  },
  {
    id: "clinic-istanbul-aesthetic",
    name: "Istanbul Aesthetic Clinic",
    image: "/Clinics/Istanbul-Aesthetic-Clinic.jpg",
    location: "Istanbul, Turkey",
    specialty: "Cosmetic",
    rating: 4.7,
    verified: true,
    estimateMinUSD: 2800,
    estimateMaxUSD: 9800,
    details:
      "Specialized cosmetic clinic with structured pre-op and post-op planning for international travelers.",
  },
  {
    id: "clinic-mexico-heart",
    name: "Mexico City Heart Institute",
    image: "/Clinics/Mexico-City-Heart-Institute.jpg",
    location: "Mexico City, Mexico",
    specialty: "Cardiology",
    rating: 4.9,
    verified: true,
    estimateMinUSD: 7800,
    estimateMaxUSD: 21000,
    details:
      "Focused cardiac institute with diagnostic and interventional pathways and dedicated care coordination.",
  },
  {
    id: "clinic-prague-ortho",
    name: "Prague Orthopedic Hospital",
    image: "/Clinics/Prague-Orthopedic-Hospital.jpg",
    location: "Prague, Czech Republic",
    specialty: "Orthopedic",
    rating: 4.6,
    verified: true,
    estimateMinUSD: 6500,
    estimateMaxUSD: 18500,
    details:
      "Orthopedic center covering joint and mobility procedures with recovery support planning.",
  },
  {
    id: "clinic-seoul-eye",
    name: "Seoul Eye Surgery Center",
    image: "/Clinics/Seoul-Eye-Surgery-Center.jpg",
    location: "Seoul, South Korea",
    specialty: "Eye Care",
    rating: 4.8,
    verified: true,
    estimateMinUSD: 2200,
    estimateMaxUSD: 7200,
    details:
      "Eye surgery center with advanced diagnostics and focused aftercare instructions.",
  },
  {
    id: "clinic-barcelona-fertility",
    name: "Barcelona Fertility Clinic",
    image: "/Clinics/Barcelona-Fertility-Clinic.jpg",
    location: "Barcelona, Spain",
    specialty: "Fertility",
    rating: 4.7,
    verified: true,
    estimateMinUSD: 5200,
    estimateMaxUSD: 14500,
    details:
      "Fertility care clinic with staged treatment plans and travel-friendly appointment coordination.",
  },
];

function formatUsd(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BrowseCareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClinicId, setExpandedClinicId] = useState<string | null>(null);
  const [bookedClinicId, setBookedClinicId] = useState<string | null>(null);

  const procedureFilter = (searchParams.get("procedure") ?? "").trim();
  const preferredDestinationFilters = (searchParams.get("preferredDestinations") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const filteredClinics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return CLINICS.filter((clinic) => {
      const matchesQuery =
        query.length === 0 ||
        clinic.name.toLowerCase().includes(query) ||
        clinic.location.toLowerCase().includes(query) ||
        clinic.specialty.toLowerCase().includes(query);

      const matchesProcedure =
        !procedureFilter ||
        procedureFilter === "Any" ||
        clinic.specialty.toLowerCase().includes(procedureFilter.toLowerCase());

      const matchesPreferredDestinations =
        preferredDestinationFilters.length === 0 ||
        preferredDestinationFilters.some((destination) =>
          clinic.location.toLowerCase().includes(destination),
        );

      return matchesQuery && matchesProcedure && matchesPreferredDestinations;
    });
  }, [searchQuery, procedureFilter, preferredDestinationFilters]);

  const bookedClinic = useMemo(
    () => CLINICS.find((clinic) => clinic.id === bookedClinicId) ?? null,
    [bookedClinicId],
  );

  const handleBookQuote = (clinic: ClinicItem) => {
    upsertHealthcareEstimate({
      providerId: clinic.id,
      providerName: clinic.name,
      estimateMin: clinic.estimateMinUSD,
      estimateMax: clinic.estimateMaxUSD,
      currency: "USD",
      requestedAt: new Date().toISOString(),
    });
    setBookedClinicId(clinic.id);

    toast({
      title: "Quote booked and added",
      description: `${clinic.name} estimate has been added to your itinerary.`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <div className="mb-8 space-y-2 sm:space-y-3">
        <Button
          type="button"
          className="mb-3"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to hotels
        </Button>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Browse Care
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Select a clinic, review details, then book a quote to add a care estimate to your itinerary.
        </p>
      </div>

      {(procedureFilter || preferredDestinationFilters.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          {procedureFilter && procedureFilter !== "Any" && (
            <Badge variant="secondary">Procedure: {procedureFilter}</Badge>
          )}
          {preferredDestinationFilters.length > 0 && (
            <Badge variant="secondary">
              Preferred destinations: {preferredDestinationFilters.join(", ")}
            </Badge>
          )}
        </div>
      )}

      {bookedClinic && (
        <Card className="mb-6 border-primary/25 bg-primary/10">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Selected clinic: {bookedClinic.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimate added: {formatUsd(bookedClinic.estimateMinUSD)} -{" "}
                {formatUsd(bookedClinic.estimateMaxUSD)}
              </p>
            </div>
            <Button asChild>
              <Link href="/itinerary">View itinerary</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-10 space-y-5 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search clinics, procedures, or locations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 rounded-lg border-border bg-background pl-9"
              aria-label="Search clinics"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 rounded-lg border-border bg-card px-4 text-foreground hover:bg-muted sm:w-auto"
          >
            <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">All Specialties</Badge>
          <Badge variant="outline">Dental</Badge>
          <Badge variant="outline">Cosmetic</Badge>
          <Badge variant="outline">Orthopedic</Badge>
          <Badge variant="outline">Cardiology</Badge>
        </div>
      </div>

      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Clinic results"
      >
        {filteredClinics.map((clinic) => {
          const isExpanded = expandedClinicId === clinic.id;
          const isBooked = bookedClinicId === clinic.id;

          return (
            <Card
              key={clinic.id}
              className={cn(
                "overflow-hidden shadow-sm transition-all hover:shadow-lg",
                isExpanded && "border-primary ring-1 ring-primary/50",
              )}
              role="listitem"
            >
              <CardContent className="p-0">
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={clinic.image}
                    alt={`${clinic.name} clinic`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-foreground">
                        {clinic.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        <span>{clinic.location}</span>
                      </div>
                    </div>
                    {clinic.verified && (
                      <Badge variant="secondary" className="shrink-0">
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <Badge variant="outline">{clinic.specialty}</Badge>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                      <span>{clinic.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Popover
                      open={isExpanded}
                      onOpenChange={(open) =>
                        setExpandedClinicId(open ? clinic.id : null)
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant={isExpanded ? "default" : "outline"}
                          className="w-full"
                        >
                          Details
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="w-[min(24rem,calc(100vw-2rem))]"
                      >
                        <p className="mb-2 text-sm text-muted-foreground">{clinic.details}</p>
                        <p className="mb-3 text-sm font-medium text-foreground">
                          Estimated care: {formatUsd(clinic.estimateMinUSD)} -{" "}
                          {formatUsd(clinic.estimateMaxUSD)}
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => {
                            handleBookQuote(clinic);
                            setExpandedClinicId(null);
                          }}
                          variant={isBooked ? "secondary" : "default"}
                        >
                          {isBooked ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Quote booked
                            </>
                          ) : (
                            "Book quote & add to itinerary"
                          )}
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Toaster />
    </div>
  );
}
