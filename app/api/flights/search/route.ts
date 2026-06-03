import { NextResponse } from "next/server";
import {
  isAmadeusApiError,
  searchFlights,
  type FlightSearchInput,
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

    const results = await searchFlights(validated.input);

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    if (isAmadeusApiError(error)) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return jsonError(error.message, status, error.details);
    }

    return jsonError("Failed to search flights.", 500);
  }
}
