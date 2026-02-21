import "server-only";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const OPEN_ER_API_BASE_URL = "https://open.er-api.com/v6/latest";
const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;
const RATE_CACHE_TTL_MS = 30 * 60 * 1000;

type RateCacheEntry = {
  rateToUsd: number;
  rateDate: string | null;
  fetchedAtMs: number;
};

const rateCache = new Map<string, RateCacheEntry>();

export class CurrencyConversionError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "CurrencyConversionError";
    this.status = status;
    this.details = details;
  }
}

export function isCurrencyConversionError(
  error: unknown,
): error is CurrencyConversionError {
  return error instanceof CurrencyConversionError;
}

export function normalizeCurrencyCode(currency: string): string {
  const code = currency.trim().toUpperCase();

  // Handle common typo for Thai Baht.
  if (code === "BHT") {
    return "THB";
  }

  return code;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function getRateToUsd(fromCurrency: string): Promise<{
  rateToUsd: number;
  rateDate: string | null;
}> {
  if (fromCurrency === "USD") {
    return {
      rateToUsd: 1,
      rateDate: null,
    };
  }

  const now = Date.now();
  const cached = rateCache.get(fromCurrency);
  if (cached && cached.fetchedAtMs + RATE_CACHE_TTL_MS > now) {
    return {
      rateToUsd: cached.rateToUsd,
      rateDate: cached.rateDate,
    };
  }

  const url = new URL(`${FRANKFURTER_BASE_URL}/latest`);
  url.searchParams.set("from", fromCurrency);
  url.searchParams.set("to", "USD");

  let rateToUsd: number | null = null;
  let rateDate: string | null = null;
  let lastErrorDetails: unknown = null;

  // Primary source.
  try {
    const response = await fetch(url.toString(), {
      cache: "no-store",
    });
    if (!response.ok) {
      lastErrorDetails = await safeJson(response);
    } else {
      const payload = (await response.json()) as {
        date?: string;
        rates?: Record<string, number>;
      };
      const parsedRate = Number(payload.rates?.USD);
      if (Number.isFinite(parsedRate) && parsedRate > 0) {
        rateToUsd = parsedRate;
        rateDate = payload.date ?? null;
      } else {
        lastErrorDetails = payload;
      }
    }
  } catch (error) {
    lastErrorDetails = String(error);
  }

  // Fallback source for broader currency support.
  if (rateToUsd === null) {
    const fallbackResponse = await fetch(
      `${OPEN_ER_API_BASE_URL}/${encodeURIComponent(fromCurrency)}`,
      { cache: "no-store" },
    );

    if (!fallbackResponse.ok) {
      throw new CurrencyConversionError(
        "Failed to fetch currency conversion rate.",
        fallbackResponse.status,
        {
          primaryError: lastErrorDetails,
          fallbackError: await safeJson(fallbackResponse),
        },
      );
    }

    const fallbackPayload = (await fallbackResponse.json()) as {
      result?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
      "error-type"?: string;
    };

    const parsedFallbackRate = Number(fallbackPayload.rates?.USD);
    if (!Number.isFinite(parsedFallbackRate) || parsedFallbackRate <= 0) {
      throw new CurrencyConversionError(
        "Invalid conversion rate returned by providers.",
        502,
        {
          primaryError: lastErrorDetails,
          fallbackError: fallbackPayload,
        },
      );
    }

    rateToUsd = parsedFallbackRate;
    rateDate = fallbackPayload.time_last_update_utc ?? null;
  }

  if (rateToUsd === null) {
    throw new CurrencyConversionError(
      "Currency conversion rate is unavailable.",
      502,
      { primaryError: lastErrorDetails },
    );
  }

  rateCache.set(fromCurrency, {
    rateToUsd,
    rateDate,
    fetchedAtMs: now,
  });

  return {
    rateToUsd,
    rateDate,
  };
}

export async function convertAmountToUsd(input: {
  amount: number;
  currency: string;
}): Promise<{
  originalAmount: number;
  originalCurrency: string;
  normalizedCurrency: string;
  usdAmount: number;
  rateToUsd: number;
  rateDate: string | null;
}> {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new CurrencyConversionError(
      "amount must be a non-negative number.",
      400,
      { amount: input.amount },
    );
  }

  const normalizedCurrency = normalizeCurrencyCode(input.currency);
  if (!CURRENCY_CODE_REGEX.test(normalizedCurrency)) {
    throw new CurrencyConversionError(
      "currency must be a 3-letter code (for example USD, EUR, THB).",
      400,
      { currency: input.currency },
    );
  }

  const { rateToUsd, rateDate } = await getRateToUsd(normalizedCurrency);
  const usdAmount = Number((input.amount * rateToUsd).toFixed(2));

  return {
    originalAmount: input.amount,
    originalCurrency: input.currency.trim().toUpperCase(),
    normalizedCurrency,
    usdAmount,
    rateToUsd,
    rateDate,
  };
}
