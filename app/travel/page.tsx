"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plane, Hotel, Calendar, DollarSign, MapPin, Clock } from "lucide-react";

const PLACEHOLDER_OPTIONS = [
  {
    id: "1",
    type: "Flight + Hotel",
    destination: "Bangkok, Thailand",
    duration: "7 days",
    price: "$1,240",
    includes: ["Round-trip flights", "4-star hotel", "Airport transfers"],
  },
  {
    id: "2",
    type: "Hotel Package",
    destination: "Istanbul, Turkey",
    duration: "5 days",
    price: "$680",
    includes: ["Luxury hotel", "Breakfast included", "City tours"],
  },
  {
    id: "3",
    type: "Complete Itinerary",
    destination: "Cancun, Mexico",
    duration: "10 days",
    price: "$2,100",
    includes: ["Flights", "All-inclusive resort", "Medical coordination", "Recovery suite"],
  },
  {
    id: "4",
    type: "Flight Only",
    destination: "Prague, Czech Republic",
    duration: "Round-trip",
    price: "$540",
    includes: ["Economy flights", "1 checked bag", "Flexible dates"],
  },
  {
    id: "5",
    type: "Hotel Package",
    destination: "Seoul, South Korea",
    duration: "6 days",
    price: "$890",
    includes: ["Boutique hotel", "Private transportation", "Medical liaison"],
  },
  {
    id: "6",
    type: "Complete Itinerary",
    destination: "Barcelona, Spain",
    duration: "8 days",
    price: "$1,750",
    includes: ["Flights", "Hotel near clinic", "Recovery assistance", "Tourist activities"],
  },
];

export default function TravelPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
            Browse Travel Options
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Find flights, accommodations, and complete care packages
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search destinations, travel dates, or packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search travel options"
              />
            </div>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              Dates
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              All Types
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              <Plane className="h-3 w-3 mr-1" aria-hidden="true" />
              Flights Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              <Hotel className="h-3 w-3 mr-1" aria-hidden="true" />
              Hotels Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Complete Packages
            </Badge>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Travel options">
          {PLACEHOLDER_OPTIONS.map((option) => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow" role="listitem">
              <CardContent className="p-5">
                <div className="mb-3">
                  <Badge variant="secondary" className="mb-2">
                    {option.type}
                  </Badge>
                  <h3 className="font-semibold text-foreground text-lg mb-1">
                    {option.destination}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      <span>{option.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <DollarSign className="h-4 w-4" aria-hidden="true" />
                      <span>{option.price}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Includes:
                  </p>
                  <ul className="text-sm text-foreground space-y-1">
                    {option.includes.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" className="w-full">
                  View Package
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder state message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Coming soon:</span> Real-time pricing, instant booking, and customizable itineraries
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
