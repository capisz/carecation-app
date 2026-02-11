"use client";

import React from "react"

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  Languages,
  Clock,
  DollarSign,
  Star,
  X,
} from "lucide-react";
import { type Provider, estimateTotalTripCost } from "@/lib/data/providers-repo";

interface ComparisonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  onRemove: (id: string) => void;
}

function ComparisonRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Array.isArray(children) ? (children as React.ReactNode[]).length : 1}, 1fr)` }}>
        {children}
      </div>
    </div>
  );
}

export function ComparisonDrawer({
  open,
  onOpenChange,
  providers,
  onRemove,
}: ComparisonDrawerProps) {
  if (providers.length === 0) return null;

  const costs = providers.map((p) => estimateTotalTripCost(p));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Compare providers</SheetTitle>
          <SheetDescription>
            Side-by-side comparison of {providers.length} selected provider{providers.length !== 1 ? "s" : ""}. Estimates are approximate and should be verified directly.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Provider names & remove buttons */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${providers.length}, 1fr)` }}>
            {providers.map((p) => (
              <div key={p.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.city}, {p.country}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => onRemove(p.id)}
                    aria-label={`Remove ${p.name} from comparison`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">
                    {p.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({p.reviewCount} reviews)
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Procedure cost */}
          <ComparisonRow label="Procedure cost" icon={DollarSign}>
            {providers.map((p) => (
              <div key={p.id}>
                <p className="text-lg font-bold text-foreground">
                  ${p.priceRangeUSD.min.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}- ${p.priceRangeUSD.max.toLocaleString()}
                  </span>
                </p>
              </div>
            ))}
          </ComparisonRow>

          <Separator />

          {/* Estimated total trip cost */}
          <ComparisonRow label="Est. total trip cost" icon={DollarSign}>
            {costs.map((c, i) => (
              <div key={providers[i].id}>
                <p className="text-lg font-bold text-primary">
                  ${c.min.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}- ${c.max.toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Incl. est. flights, lodging, meals
                </p>
              </div>
            ))}
          </ComparisonRow>

          <Separator />

          {/* Recovery days */}
          <ComparisonRow label="Recovery period" icon={Clock}>
            {providers.map((p) => (
              <div key={p.id}>
                <p className="text-sm font-semibold text-foreground">
                  {p.recoveryDays} day{p.recoveryDays !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.recoveryDays + 4}-{p.recoveryDays + 6} days total stay suggested
                </p>
              </div>
            ))}
          </ComparisonRow>

          <Separator />

          {/* Accreditations */}
          <ComparisonRow label="Accreditations" icon={ShieldCheck}>
            {providers.map((p) => (
              <div key={p.id} className="flex flex-wrap gap-1.5">
                {p.accreditation.map((acc) => (
                  <Badge
                    key={acc}
                    className="bg-primary/10 text-primary border-0 text-xs"
                  >
                    <ShieldCheck className="h-3 w-3 mr-0.5" aria-hidden="true" />
                    {acc}
                  </Badge>
                ))}
              </div>
            ))}
          </ComparisonRow>

          <Separator />

          {/* Languages */}
          <ComparisonRow label="Languages spoken" icon={Languages}>
            {providers.map((p) => (
              <div key={p.id} className="flex flex-wrap gap-1.5">
                {p.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            ))}
          </ComparisonRow>

          <Separator />

          {/* Actions */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${providers.length}, 1fr)` }}>
            {providers.map((p) => (
              <Button key={p.id} asChild className="w-full">
                <Link href={`/provider/${p.id}`}>View {p.name.split(" ")[0]}</Link>
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
