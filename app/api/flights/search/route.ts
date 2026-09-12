import { NextResponse } from "next/server";
import {
  isAmadeusApiError,
  searchFlights,
  type FlightSearchInput,
  type FlightItinerary,
  type NormalizedFlightResult,
} from "@/lib/amadeus";
import { jsonError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type FlightSearchBody = {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
};

function airportTime(date: string, hour: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCHours(hour);
  return value.toISOString().slice(0, 19);
}

function addHours(dateTime: string, hours: number): string {
  const value = new Date(`${dateTime}Z`);
  value.setUTCHours(value.getUTCHours() + hours);
  return value.toISOString().slice(0, 19);
}

function buildEstimatedFlights(input: FlightSearchInput): NormalizedFlightResult[] {
  const routeSeed = [...`${input.origin}${input.destination}`].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const airlines = [
    { code: "DL", name: "Delta Air Lines" },
    { code: "UA", name: "United Airlines" },
    { code: "AA", name: "American Airlines" },
  ];

  return airlines.map((airline, index) => {
    const outboundDepartHour = 8 + index * 3;
    const durationHours = 10 + (routeSeed % 5);
    const totalPrice = Math.round((520 + (routeSeed % 180) + index * 85) * input.adults);
    const outboundDepartureAt = airportTime(input.departDate, outboundDepartHour);
    const outbound = {
      leg: "outbound" as const,
      duration: `PT${durationHours}H`,
      stops: 0,
      segments: [{
        carrierCode: airline.code,
        carrierName: airline.name,
        flightNumber: String(100 + (routeSeed % 800) + index),
        departureIata: input.origin,
        departureAt: outboundDepartureAt,
        arrivalIata: input.destination,
        arrivalAt: addHours(outboundDepartureAt, durationHours),
        duration: `PT${durationHours}H`,
      }],
    };
    const itineraries: FlightItinerary[] = [outbound];

    if (input.returnDate) {
      const returnDepartureAt = airportTime(input.returnDate, outboundDepartHour + 1);
      itineraries.push({
        leg: "return" as const,
        duration: `PT${durationHours}H`,
        stops: 0,
        segments: [{
          carrierCode: airline.code,
          carrierName: airline.name,
          flightNumber: String(900 + (routeSeed % 80) + index),
          departureIata: input.destination,
          departureAt: returnDepartureAt,
          arrivalIata: input.origin,
          arrivalAt: addHours(returnDepartureAt, durationHours),
          duration: `PT${durationHours}H`,
        }],
      });
    }

    return {
      id: `estimated-${input.origin}-${input.destination}-${index + 1}`,
      totalPrice,
      currency: "USD",
      bookableSeats: null,
      lastTicketingDate: null,
      itineraries,
    };
  });
}

function validateFlightBody(body: FlightSearchBody): {
  ok: true;
  input: FlightSearchInput;
} | {
  ok: false;
  message: string;
} {
  const origin = (body.origin ?? "").trim().toUpperCase();
  const destination = (body.destination ?? "").trim().toUpperCase();
  const departDate = (body.departDate ?? "").trim();
  const returnDate = (body.returnDate ?? "").trim();
  const adults = Number(body.adults ?? 1);

  if (!IATA_CODE_REGEX.test(origin)) {
    return { ok: false, message: "origin must be a 3-letter IATA code." };
  }

  if (!IATA_CODE_REGEX.test(destination)) {
    return { ok: false, message: "destination must be a 3-letter IATA code." };
  }

  if (!DATE_REGEX.test(departDate)) {
    return { ok: false, message: "departDate must be in YYYY-MM-DD format." };
  }

  if (returnDate && !DATE_REGEX.test(returnDate)) {
    return { ok: false, message: "returnDate must be in YYYY-MM-DD format." };
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    return { ok: false, message: "adults must be an integer between 1 and 9." };
  }

  return {
    ok: true,
    input: {
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      adults,
    },
  };
}

export async function POST(request: Request) {
  let validatedInput: FlightSearchInput | null = null;
  const rateLimit = checkRateLimit({
    key: `flights:${getClientIp(request)}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError("Too many flight searches. Try again shortly.", 429);
  }

  try {
    const body = (await request.json()) as FlightSearchBody;
    const validated = validateFlightBody(body);

    if (!validated.ok) {
      return jsonError(validated.message, 400);
    }

    validatedInput = validated.input;
    const results = await searchFlights(validatedInput);

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    if (validatedInput) {
      const fallbackResults = buildEstimatedFlights(validatedInput);
      return NextResponse.json({
        results: fallbackResults,
        count: fallbackResults.length,
        warning:
          "Live flight offers are temporarily unavailable. Showing estimated options so you can continue planning.",
      });
    }

    if (isAmadeusApiError(error)) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return jsonError(error.message, status, error.details);
    }

    return jsonError("Failed to search flights.", 500);
  }
}
