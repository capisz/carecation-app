/**
 * Repository layer for provider data.
 *
 * Currently backed by in-memory mock data. To swap to a real database,
 * replace the function bodies below with DB queries -- the call-sites
 * throughout the app import only from this file so nothing else changes.
 */

import {
  providers as _allProviders,
  getProcedureCategory,
  type Provider,
  type RecoveryComfort,
} from "@/lib/mock/providers";

/* ------------------------------------------------------------------ */
/*  Filter / sort types                                                */
/* ------------------------------------------------------------------ */

export type SortKey = "rating" | "price-asc" | "price-desc" | "reviews";

export interface ProviderFilters {
  procedure?: string;
  country?: string;
  language?: string;
  budgetMin?: number;
  budgetMax?: number;
  recoveryComfort?: RecoveryComfort;
  sort?: SortKey;
}

/* ------------------------------------------------------------------ */
/*  Read operations                                                    */
/* ------------------------------------------------------------------ */

/**
 * Return providers matching the supplied filters, sorted by the
 * requested key (defaults to rating descending).
 */
export function getProviders(filters: ProviderFilters = {}): Provider[] {
  let results = [..._allProviders];

  // -- procedure category filter
  if (filters.procedure && filters.procedure !== "Any") {
    const category = filters.procedure;
    results = results.filter((p) =>
      p.procedures.some((proc) => getProcedureCategory(proc) === category),
    );
  }

  // -- country filter
  if (filters.country && filters.country !== "Any") {
    results = results.filter((p) => p.country === filters.country);
  }

  // -- language filter
  if (filters.language && filters.language !== "Any") {
    results = results.filter((p) => p.languages.includes(filters.language!));
  }

  // -- budget overlap filter
  if (filters.budgetMin !== undefined && filters.budgetMax !== undefined) {
    results = results.filter(
      (p) =>
        p.priceRangeUSD.min <= filters.budgetMax! &&
        p.priceRangeUSD.max >= filters.budgetMin!,
    );
  }

  // -- recovery comfort cap
  if (filters.recoveryComfort) {
    const maxDays =
      filters.recoveryComfort === "low"
        ? 3
        : filters.recoveryComfort === "medium"
          ? 7
          : 14;
    results = results.filter((p) => p.recoveryDays <= maxDays);
  }

  // -- sorting
  const sort = filters.sort ?? "rating";
  switch (sort) {
    case "price-asc":
      results.sort((a, b) => a.priceRangeUSD.min - b.priceRangeUSD.min);
      break;
    case "price-desc":
      results.sort((a, b) => b.priceRangeUSD.max - a.priceRangeUSD.max);
      break;
    case "reviews":
      results.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case "rating":
    default:
      results.sort((a, b) => b.rating - a.rating);
      break;
  }

  return results;
}

/**
 * Return a single provider by ID, or `undefined` if not found.
 */
export function getProviderById(id: string): Provider | undefined {
  return _allProviders.find((p) => p.id === id);
}

/**
 * Return every provider (unfiltered, unsorted).
 * Used by the admin page as its starting dataset.
 */
export function getAllProviders(): Provider[] {
  return [..._allProviders];
}

/* ------------------------------------------------------------------ */
/*  Re-exports (so consumers can import everything from one place)     */
/* ------------------------------------------------------------------ */

export type { Provider, RecoveryComfort } from "@/lib/mock/providers";
export {
  PROCEDURE_CATEGORIES,
  COUNTRIES,
  LANGUAGES,
  BUDGET_RANGES,
  RECOVERY_COMFORT,
  TRAVEL_MONTHS,
  TRAVEL_COST_PLACEHOLDER,
  estimateTotalTripCost,
} from "@/lib/mock/providers";
