"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Building2, Globe } from "lucide-react";

const PLACEHOLDER_CLINICS = [
  {
    id: "1",
    name: "Bangkok Smile Dental Center",
    location: "Bangkok, Thailand",
    specialty: "Dental",
    rating: 4.8,
    verified: true,
  },
  {
    id: "2",
    name: "Istanbul Aesthetic Clinic",
    location: "Istanbul, Turkey",
    specialty: "Cosmetic",
    rating: 4.7,
    verified: true,
  },
  {
    id: "3",
    name: "Mexico City Heart Institute",
    location: "Mexico City, Mexico",
    specialty: "Cardiology",
    rating: 4.9,
    verified: true,
  },
  {
    id: "4",
    name: "Prague Orthopedic Hospital",
    location: "Prague, Czech Republic",
    specialty: "Orthopedic",
    rating: 4.6,
    verified: true,
  },
  {
    id: "5",
    name: "Seoul Eye Surgery Center",
    location: "Seoul, South Korea",
    specialty: "Eye Care",
    rating: 4.8,
    verified: true,
  },
  {
    id: "6",
    name: "Barcelona Fertility Clinic",
    location: "Barcelona, Spain",
    specialty: "Fertility",
    rating: 4.7,
    verified: true,
  },
];

export default function ClinicsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Browse Clinics & Providers
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Discover accredited medical facilities worldwide
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search clinics, procedures, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
                aria-label="Search clinics"
              />
            </div>
            <Button>
              <Building2 className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              All Specialties
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Dental
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Cosmetic
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Orthopedic
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Cardiology
            </Badge>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Clinic results">
          {PLACEHOLDER_CLINICS.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow" role="listitem">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">
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

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{clinic.specialty}</Badge>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
                    <span>{clinic.rating}</span>
                  </div>
                </div>

                <Button className="w-full">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder state message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <Globe className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Coming soon:</span> Advanced filtering, clinic reviews, and booking integration
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
