"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, LANGUAGES, PROCEDURE_CATEGORIES, BUDGET_RANGES } from "@/lib/data/providers-repo";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export interface FilterValues {
  procedure: string;
  country: string;
  language: string;
  budgetLabel: string;
  sort: string;
}

interface FiltersSidebarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function FiltersSidebar({ filters, onChange }: FiltersSidebarProps) {
  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const reset = () => {
    onChange({
      procedure: "Any",
      country: "Any",
      language: "Any",
      budgetLabel: "Any",
      sort: "rating",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Filters</h2>
        <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-muted-foreground">
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Procedure Category</Label>
        <Select value={filters.procedure} onValueChange={(v) => update("procedure", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            {PROCEDURE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Country</Label>
        <Select value={filters.country} onValueChange={(v) => update("country", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Language</Label>
        <Select value={filters.language} onValueChange={(v) => update("language", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Budget Range</Label>
        <Select value={filters.budgetLabel} onValueChange={(v) => update("budgetLabel", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any</SelectItem>
            {BUDGET_RANGES.map((b) => (
              <SelectItem key={b.label} value={b.label}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Sort By</Label>
        <Select value={filters.sort} onValueChange={(v) => update("sort", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rating</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
