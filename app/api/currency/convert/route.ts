import { NextResponse } from "next/server";
import {
  convertAmountToUsd,
  isCurrencyConversionError,
} from "@/lib/currency";

type CurrencyConvertBody = {
  amount?: number;
  currency?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CurrencyConvertBody;
    const amount = Number(body.amount);
    const currency = (body.currency ?? "").trim();

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json(
        { error: "amount must be a non-negative number." },
        { status: 400 },
      );
    }

    if (!currency) {
      return NextResponse.json(
        { error: "currency is required." },
        { status: 400 },
      );
    }

    const conversion = await convertAmountToUsd({
      amount,
      currency,
    });

    return NextResponse.json(conversion);
  } catch (error) {
    if (isCurrencyConversionError(error)) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status },
      );
    }

    return NextResponse.json(
      { error: "Failed to convert currency." },
      { status: 500 },
    );
  }
}
