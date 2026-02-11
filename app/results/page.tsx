"use client";

import { useMemo, useState, useCallback } from "react";
import { usePageReady } from "@/hooks/use-page-ready";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProviderCard } from "@/components/provider-card";
import { ComparisonDrawer } from "@/components/comparison-drawer";
import { FiltersSidebar, type FilterValues } from "@/components/filters-sidebar";
import {
  getProviders,
  getProviderById,
  BUDGET_RANGES,
  type Provider,
  type RecoveryComfort,
  type SortKey,
} from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Scale, Stethoscope, Globe, CalendarDays, Wallet } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const MAX_COMPARE = 3;

function ResultsContent() {
  usePageReady();
  const searchParams = useSearchParams();

  const initialFilters: FilterValues = {
    procedure: searchParams.get("procedure") || "Any",
    country: searchParams.get("country") || "Any",
    language: searchParams.get("language") || "Any",
    budgetLabel:
      BUDGET_RANGES.find(
        (b) =>
          b.min === Number(searchParams.get("budgetMin")) &&
          b.max === Number(searchParams.get("budgetMax"))
      )?.label || "Any",
    sort: "rating",
  };

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const results = useMemo(() => {
    const budget = BUDGET_RANGES.find((b) => b.label === filters.budgetLabel);
    return getProviders({
      procedure: filters.procedure !== "Any" ? filters.procedure : undefined,
      country: filters.country !== "Any" ? filters.country : undefined,
      language: filters.language !== "Any" ? filters.language : undefined,
      budgetMin: budget?.min,
      budgetMax: budget?.max,
      recoveryComfort: searchParams.get("recoveryComfort") as
        | RecoveryComfort
        | undefined,
      sort: (filters.sort as SortKey) ?? "rating",
    });
  }, [filters, searchParams]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE
          ? [...prev, id]
          : prev
    );
  }, []);

  const handleRemoveFromComparison = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const selectedProviders = selectedIds
    .map((id) => getProviderById(id))
    .filter(Boolean) as Provider[];

  /* Derive intake selections from URL params for the summary bar */
  const intakeProcedure = searchParams.get("procedure");
  const intakeCountry = searchParams.get("country");
  const intakeMonth = searchParams.get("month");
  const intakeBudget =
    BUDGET_RANGES.find(
      (b) =>
        b.min === Number(searchParams.get("budgetMin")) &&
        b.max === Number(searchParams.get("budgetMax"))
    )?.label ?? null;

  const hasIntakeParams = intakeProcedure || intakeCountry || intakeMonth || intakeBudget;

  return (
    <>
      {hasIntakeParams && (
        <div
          className="sticky top-16 z-40 border-b bg-secondary/80 backdrop-blur-sm"
          role="region"
          aria-label="Your search criteria"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 lg:px-8">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your criteria
            </span>
            <div className="flex items-center gap-2" role="list" aria-label="Active search filters">
              {intakeProcedure && intakeProcedure !== "Any" && (
                <Badge variant="secondary" className="shrink-0 gap-1.5" role="listitem">
                  <Stethoscope className="h-3 w-3" aria-hidden="true" />
                  {intakeProcedure}
                </Badge>
              )}
              {intakeCountry && intakeCountry !== "Any" && (
                <Badge variant="secondary" className="shrink-0 gap-1.5" role="listitem">
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  {intakeCountry}
                </Badge>
              )}
              {intakeMonth && (
                <Badge variant="secondary" className="shrink-0 gap-1.5" role="listitem">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {intakeMonth}
                </Badge>
              )}
              {intakeBudget && intakeBudget !== "Any" && (
                <Badge variant="secondary" className="shrink-0 gap-1.5" role="listitem">
                  <Wallet className="h-3 w-3" aria-hidden="true" />
                  {intakeBudget}
                </Badge>
              )}
            </div>
            <Link
              href="/intake"
              className="ml-auto shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Edit criteria
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl text-balance">
              Explore providers
            </h1>
            <p className="text-muted-foreground mt-1">
              {results.length} accredited provider{results.length !== 1 ? "s" : ""}{" "}
              matching your criteria
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <Button
                onClick={() => setDrawerOpen(true)}
                variant="outline"
                className="hidden sm:flex items-center gap-2 bg-transparent"
                aria-label={`Compare ${selectedIds.length} selected providers`}
              >
                <Scale className="h-4 w-4" aria-hidden="true" />
                Compare ({selectedIds.length})
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden bg-transparent"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden="true" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="mt-6">
                  <FiltersSidebar filters={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Selection hint */}
        <div className="mb-6 rounded-lg border border-border bg-muted/50 p-3 flex items-center gap-3">
          <Scale className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Select up to {MAX_COMPARE} providers to compare side by side.{" "}
            {selectedIds.length > 0 && (
              <span className="font-medium text-foreground">
                {selectedIds.length} of {MAX_COMPARE} selected.
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-lg border bg-card p-5">
              <FiltersSidebar filters={filters} onChange={setFilters} />
            </div>
          </aside>

          <div className="flex-1">
            {results.length === 0 ? (
              <div className="text-center py-16" role="status">
                <p className="text-lg font-semibold text-foreground">
                  No providers match your current filters
                </p>
                <p className="text-muted-foreground mt-2">
                  Try broadening your filters to see more options.
                </p>
              </div>
            ) : (
              <div
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                role="list"
                aria-label="Provider results"
              >
                {results.map((provider) => (
                  <div key={provider.id} role="listitem">
                    <ProviderCard
                      provider={provider}
                      selectable
                      selected={selectedIds.includes(provider.id)}
                      onToggleSelect={handleToggleSelect}
                      disableSelect={
                        selectedIds.length >= MAX_COMPARE &&
                        !selectedIds.includes(provider.id)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating compare bar on mobile */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
            <Button
              onClick={() => setDrawerOpen(true)}
              className="w-full shadow-lg"
              size="lg"
              aria-label={`Compare ${selectedIds.length} selected providers`}
            >
              <Scale className="h-4 w-4 mr-2" aria-hidden="true" />
              Compare {selectedIds.length} provider{selectedIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        )}

        <ComparisonDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          providers={selectedProviders}
          onRemove={handleRemoveFromComparison}
        />
      </div>
    </>
  );
}

export default function ResultsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="py-20 text-center text-muted-foreground" role="status">
            Loading results...
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </AppShell>
  );
}
