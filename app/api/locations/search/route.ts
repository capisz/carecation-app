import { NextResponse } from "next/server";
import {
  isAmadeusApiError,
  searchLocationsByKeyword,
} from "@/lib/amadeus";
import { jsonError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { findTravelLocation } from "@/lib/travel-locations";

type LocationSearchBody = {
  keyword?: string;
};

function localAirportFallback(keyword: string) {
  const profile = findTravelLocation(keyword);
  if (!profile) {
    return [];
  }

  return profile.airports.map((airport) => ({
    id: `${profile.country}-${airport.iata}`,
    iataCode: airport.iata,
    cityCode: airport.cityCode,
    name: airport.name,
    cityName: airport.city,
    countryCode: null,
    subType: "AIRPORT",
  }));
}

export async function POST(request: Request) {
  let keywordForFallback = "";

  const rateLimit = checkRateLimit({
    key: `locations:${getClientIp(request)}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError("Too many location searches. Try again shortly.", 429);
  }

  try {
    const body = (await request.json()) as LocationSearchBody;
    const keyword = (body.keyword ?? "").trim();
    keywordForFallback = keyword;

    if (keyword.length < 2) {
      return jsonError("keyword must be at least 2 characters.", 400);
    }

    const results = await searchLocationsByKeyword(keyword);

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    if (isAmadeusApiError(error)) {
      const fallbackResults = localAirportFallback(keywordForFallback);
      if (fallbackResults.length > 0) {
        return NextResponse.json({
          results: fallbackResults,
          count: fallbackResults.length,
          warning: "Using local airport matches because Amadeus location search failed.",
        });
      }

      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return jsonError(error.message, status, error.details);
    }

    return jsonError("Failed to search locations.", 500);
  }
}
