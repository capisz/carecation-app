import { NextResponse } from "next/server";
import {
  searchHotels,
  type HotelSearchInput,
  type NormalizedHotelResult,
} from "@/lib/amadeus";

const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type HotelSearchBody = {
  cityCode?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
};

function getStayNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(`${checkInDate}T00:00:00Z`).getTime();
  const checkOut = new Date(`${checkOutDate}T00:00:00Z`).getTime();
  if (!Number.isFinite(checkIn) || !Number.isFinite(checkOut)) {
    return 1;
  }
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

function buildFallbackHotels(input: HotelSearchInput): NormalizedHotelResult[] {
  const nights = getStayNights(input.checkInDate, input.checkOutDate);
  const cityCode = input.cityCode.toUpperCase();

  const citySpecificNames: Record<string, string[]> = {
    BKK: [
      "Intercontinental Bangkok",
      "Holiday Inn Bangkok",
      "The St Regis Bangkok",
      "Courtyard by Marriott Bangkok",
      "Silom Urban Suites",
      "Riverside Wellness Hotel",
    ],
    IST: [
      "Istanbul Bosphorus Hotel",
      "Galata Bridge Suites",
      "Istanbul Wellness Residency",
      "Golden Horn City Hotel",
      "Marmara Comfort Stay",
      "Ottoman Medical Travel Hotel",
    ],
    BCN: [
      "Barcelona Med Center Hotel",
      "El Born Boutique Stay",
      "Sagrada Care Suites",
      "Catalonia Plaza Hotel",
      "Mediterranean Recovery Inn",
      "Barcelona Central Grand",
    ],
    CUN: [
      "Cancun Marina Resort",
      "Yucatan City Suites",
      "Caribbean Care Hotel",
      "Riviera Wellness Stay",
      "Lagoon View Hotel",
      "Cancun Centro Residence",
    ],
  };

  const genericNames = [
    `${cityCode} Central Hotel`,
    `${cityCode} Grand Suites`,
    `${cityCode} Waterfront Stay`,
    `${cityCode} Medical Travel Inn`,
    `${cityCode} City Comfort Hotel`,
    `${cityCode} Plaza Residence`,
  ];

  const names = (citySpecificNames[cityCode] ?? genericNames).slice(0, 6);

  return names.map((name, index) => {
    const nightlyBase = 95 + index * 28;
    const occupancyMultiplier = 1 + (input.adults - 1) * 0.2;
    const totalPrice = Math.round(nightlyBase * nights * occupancyMultiplier);

    return {
      id: `fallback-${cityCode}-${index + 1}`,
      hotelId: `FB-${cityCode}-${index + 1}`,
      name,
      cityCode,
      rating: Number((4.2 + (index % 3) * 0.2).toFixed(1)),
      totalPrice,
      currency: "USD",
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      roomDescription: "Estimated room offer from fallback search.",
      boardType: index % 2 === 0 ? "ROOM_ONLY" : "BREAKFAST",
      cancellationPolicy: "Free cancellation up to 48 hours before check-in.",
    };
  });
}

function validateHotelBody(body: HotelSearchBody): {
  ok: true;
  input: HotelSearchInput;
} | {
  ok: false;
  message: string;
} {
  const cityCode = (body.cityCode ?? "").trim().toUpperCase();
  const checkInDate = (body.checkInDate ?? "").trim();
  const checkOutDate = (body.checkOutDate ?? "").trim();
  const adults = Number(body.adults ?? 1);

  if (!IATA_CODE_REGEX.test(cityCode)) {
    return { ok: false, message: "cityCode must be a 3-letter city code." };
  }

  if (!DATE_REGEX.test(checkInDate)) {
    return { ok: false, message: "checkInDate must be in YYYY-MM-DD format." };
  }

  if (!DATE_REGEX.test(checkOutDate)) {
    return { ok: false, message: "checkOutDate must be in YYYY-MM-DD format." };
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    return { ok: false, message: "adults must be an integer between 1 and 9." };
  }

  return {
    ok: true,
    input: {
      cityCode,
      checkInDate,
      checkOutDate,
      adults,
    },
  };
}

export async function POST(request: Request) {
  let validatedInput: HotelSearchInput | null = null;

  try {
    const body = (await request.json()) as HotelSearchBody;
    const validated = validateHotelBody(body);

    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.message },
        { status: 400 },
      );
    }

    validatedInput = validated.input;
    const results = await searchHotels(validatedInput);

    if (results.length === 0) {
      const fallbackResults = buildFallbackHotels(validatedInput);
      return NextResponse.json({
        results: fallbackResults,
        count: fallbackResults.length,
        warning:
          "Live hotel offers were unavailable for the selected dates. Showing estimated options instead.",
      });
    }

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch {
    if (validatedInput) {
      const fallbackResults = buildFallbackHotels(validatedInput);
      return NextResponse.json({
        results: fallbackResults,
        count: fallbackResults.length,
        warning:
          "Live hotel search is temporarily unavailable. Showing estimated options so you can continue planning.",
      });
    }

    return NextResponse.json(
      { error: "Failed to search hotels." },
      { status: 500 },
    );
  }
}
