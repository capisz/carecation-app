import { NextResponse } from "next/server";
import {
  convertAmountToUsd,
  isCurrencyConversionError,
} from "@/lib/currency";
import { jsonError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type CurrencyConvertBody = {
  amount?: number;
  currency?: string;
};

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `currency:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.ok) {
    return jsonError("Too many conversion requests. Try again shortly.", 429);
  }

  try {
    const body = (await request.json()) as CurrencyConvertBody;
    const amount = Number(body.amount);
    const currency = (body.currency ?? "").trim();

    if (!Number.isFinite(amount) || amount < 0) {
      return jsonError("amount must be a non-negative number.", 400);
    }

    if (!currency) {
      return jsonError("currency is required.", 400);
    }

    const conversion = await convertAmountToUsd({
      amount,
      currency,
    });

    return NextResponse.json(conversion);
  } catch (error) {
    if (isCurrencyConversionError(error)) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return jsonError(error.message, status, error.details);
    }

    return jsonError("Failed to convert currency.", 500);
  }
}
