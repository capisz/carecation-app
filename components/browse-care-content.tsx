"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { upsertHealthcareEstimate } from "@/lib/itinerary-plan";
import { cn } from "@/lib/utils";
import {
  Search,
  Star,
  X,
  ArrowRight,
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
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClinicId, setExpandedClinicId] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState("All");
  const [bookedClinicId, setBookedClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<ClinicItem[]>(CLINICS);
  const [toastClinic, setToastClinic] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const procedureFilter = (searchParams.get("procedure") ?? "").trim();
  const preferredDestinationFilters = (searchParams.get("preferredDestinations") ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  useEffect(() => {
    fetch("/api/providers")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.providers) && data.providers.length > 0) {
          setClinics(data.providers);
        }
      })
      .catch(() => null);
  }, []);

  const filteredClinics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return clinics.filter((clinic) => {
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

      const matchesSpecialty = specialty === "All" || clinic.specialty.toLowerCase().includes(specialty.toLowerCase());
      return matchesQuery && matchesProcedure && matchesPreferredDestinations && matchesSpecialty;
    });
  }, [clinics, searchQuery, procedureFilter, preferredDestinationFilters, specialty]);

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
    setToastClinic(clinic.name);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastClinic(null), 4200);
  };

  return (
    <div className="care-page">

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

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4 border-b-[1.5px] border-border transition-colors focus-within:border-primary">
          <Search size={24} className="text-primary" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search clinics, procedures, or locations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-16 flex-1 border-0 bg-transparent px-0 text-xl font-bold shadow-none focus-visible:ring-0 sm:text-2xl"
              aria-label="Search clinics"
            />
          <span className="shrink-0 text-sm font-bold text-muted-foreground">{filteredClinics.length} verified</span>
        </div>
        <div className="mb-12 flex flex-wrap gap-x-8 gap-y-3" role="tablist" aria-label="Clinic specialties">
          {["All", "Dental", "Cosmetic", "Orthopedic", "Cardiology", "Eye Care", "Fertility"].map((item) => <button key={item} role="tab" aria-selected={specialty===item} onClick={() => setSpecialty(item)} className={`border-b-2 py-2 text-[17px] font-bold transition-colors ${specialty===item?"border-primary text-foreground":"border-transparent text-muted-foreground hover:text-foreground"}`}>{item}</button>)}
        </div>
      </div>

      <div
        className="mx-auto grid max-w-7xl grid-cols-1 gap-x-9 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Clinic results"
      >
        {filteredClinics.map((clinic) => {
          const isExpanded = expandedClinicId === clinic.id;
          const isBooked = bookedClinicId === clinic.id;

          return (
            <article
              key={clinic.id}
              className={cn(
                "group cursor-pointer overflow-hidden transition-transform duration-500 hover:-translate-y-1",
                isExpanded && "border-primary ring-1 ring-primary/50",
              )}
              role="listitem"
            >
                <div className="relative h-[300px] overflow-hidden rounded-[22px] shadow-[0_14px_34px_-22px_rgba(30,45,15,.5)]" onClick={() => setExpandedClinicId(clinic.id)} role="button" tabIndex={0} onKeyDown={(e) => {if(e.key==="Enter"||e.key===" "){e.preventDefault();setExpandedClinicId(clinic.id);}}}>
                  <Image
                    src={clinic.image}
                    alt={`${clinic.name} clinic`}
                    fill
                    className="object-cover transition-transform clinic-image-zoom group-hover:scale-105"
                  />
                  {isBooked && <span className="absolute left-4 top-4 rounded-full bg-background px-4 py-2 text-sm font-bold">Added ✓</span>}
                </div>
                <div className="pt-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div><h3 className="text-[21px] font-extrabold leading-tight">{clinic.name}</h3><p className="mt-1 text-sm font-semibold text-muted-foreground">{clinic.location} · {clinic.specialty}</p></div>
                    <div className="shrink-0 text-right"><p className="text-sm font-bold"><Star className="mr-1 inline h-4 w-4 fill-primary text-primary"/>{clinic.rating}</p><p className="mt-1 text-sm font-extrabold text-primary">from {formatUsd(clinic.estimateMinUSD)}</p></div>
                  </div>
                  {clinic.verified && <p className="sr-only">Verified clinic</p>}
                  <button onClick={() => setExpandedClinicId(clinic.id)} className="mt-2 text-sm font-extrabold text-primary hover:underline">View details →</button>
                </div>
            </article>
          );
        })}
      </div>
      {expandedClinicId && (() => { const clinic=clinics.find((item)=>item.id===expandedClinicId); if(!clinic)return null; return <DialogPrimitive.Root open onOpenChange={(open)=>{if(!open)setExpandedClinicId(null);}}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-foreground/35 backdrop-blur-sm"/><DialogPrimitive.Content aria-label={clinic.name} className="fixed inset-y-3 right-3 z-[81] w-[min(500px,calc(100vw-24px))] overflow-y-auto rounded-[28px] border-0 bg-background p-5 shadow-[0_30px_80px_-20px_rgba(25,35,15,.45)] outline-none animate-care-sheet sm:p-7"><DialogPrimitive.Title className="sr-only">{clinic.name}</DialogPrimitive.Title><button aria-label="Close clinic details" onClick={()=>setExpandedClinicId(null)} className="absolute right-6 top-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-background text-foreground transition-transform hover:rotate-90"><X/></button><div className="relative h-[300px] overflow-hidden rounded-[22px]"><Image src={clinic.image} alt={`${clinic.name} clinic`} fill sizes="500px" className="object-cover"/></div><h2 className="mt-7 text-3xl font-extrabold tracking-tight">{clinic.name}</h2><p className="mt-2 font-semibold text-muted-foreground">{clinic.location} · {clinic.specialty} · ★ {clinic.rating}</p><p className="mt-6 text-base leading-relaxed">{clinic.details}</p><p className="mt-8 text-sm font-extrabold text-muted-foreground">Estimated care</p><p className="text-3xl font-extrabold">{formatUsd(clinic.estimateMinUSD)} – {formatUsd(clinic.estimateMaxUSD)}</p><button onClick={()=>{handleBookQuote(clinic);window.setTimeout(()=>setExpandedClinicId(null),650);}} className="care-pill mt-7 w-full">{bookedClinicId===clinic.id?"Added to itinerary ✓":"Add to itinerary"}</button><Link href={`/provider/${clinic.id}`} className="mt-5 inline-block font-bold text-primary underline underline-offset-4">Full profile</Link></DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;})()}
      {toastClinic && <div className="care-action-bar" role="status"><span>{toastClinic} added</span><Link href="/itinerary">View itinerary <ArrowRight size={15}/></Link></div>}
    </div>
  );
}
