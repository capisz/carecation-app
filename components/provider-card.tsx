import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, MapPin, Languages, ShieldCheck, DollarSign } from "lucide-react";
import { type Provider, estimateTotalTripCost } from "@/lib/data/providers-repo";

interface ProviderCardProps {
  provider: Provider;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  disableSelect?: boolean;
}

export function ProviderCard({
  provider,
  selectable,
  selected,
  onToggleSelect,
  disableSelect,
}: ProviderCardProps) {
  const tripCost = estimateTotalTripCost(provider);

  return (
    <Card
      className={`overflow-hidden transition-shadow hover:shadow-lg group relative ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Comparison checkbox */}
      {selectable && (
        <div className="absolute top-3 right-3 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Checkbox
                    id={`compare-${provider.id}`}
                    checked={selected}
                    disabled={disableSelect && !selected}
                    onCheckedChange={() => onToggleSelect?.(provider.id)}
                    aria-label={`Add ${provider.name} to comparison`}
                    className="h-5 w-5 border-2 bg-card"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{selected ? "Remove from comparison" : disableSelect ? "Maximum 3 selected" : "Add to comparison"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="h-40 bg-secondary flex items-center justify-center">
        <ShieldCheck className="h-12 w-12 text-primary/30" aria-hidden="true" />
      </div>

      <CardContent className="p-5">
        {/* Name & rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground leading-tight text-balance">
            {provider.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0" aria-label={`Rated ${provider.rating} out of 5 with ${provider.reviewCount} reviews`}>
            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{provider.rating}</span>
            <span className="text-xs text-muted-foreground">({provider.reviewCount})</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {provider.city}, {provider.country}
          </span>
        </div>

        {/* Accreditation badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {provider.accreditation.map((acc) => (
            <Badge
              key={acc}
              className="bg-primary/10 text-primary border-0 hover:bg-primary/20 text-xs"
            >
              <ShieldCheck className="h-3 w-3 mr-0.5" aria-hidden="true" />
              {acc}
            </Badge>
          ))}
        </div>

        {/* Procedures */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {provider.procedures.slice(0, 3).map((proc) => (
            <Badge key={proc} variant="secondary" className="text-xs">
              {proc}
            </Badge>
          ))}
          {provider.procedures.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{provider.procedures.length - 3}
            </Badge>
          )}
        </div>

        {/* Languages */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{provider.languages.join(", ")}</span>
        </div>

        {/* Pricing */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Procedure cost</span>
            <span className="text-sm font-semibold text-foreground">
              ${provider.priceRangeUSD.min.toLocaleString()}{" "}
              <span className="font-normal text-muted-foreground">
                - ${provider.priceRangeUSD.max.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 cursor-help underline decoration-dotted underline-offset-2">
                    <DollarSign className="h-3 w-3" aria-hidden="true" />
                    Est. total trip cost
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px]">
                  <p className="text-xs">Includes estimated flights ($800), lodging ($90/night), and meals ($40/day) for a {provider.recoveryDays + 4}-day stay. Actual costs will vary.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm font-bold text-primary">
              ${tripCost.min.toLocaleString()}{" "}
              <span className="font-normal text-muted-foreground">
                - ${tripCost.max.toLocaleString()}
              </span>
            </span>
          </div>
          <Button asChild size="sm" className="w-full">
            <Link href={`/provider/${provider.id}`}>View details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
