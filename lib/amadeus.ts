import "server-only";

const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

type TokenCache = {
  accessToken: string;
  expiresAtMs: number;
};

let tokenCache: TokenCache | null = null;

export class AmadeusApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "AmadeusApiError";
    this.status = status;
    this.details = details;
  }
}

export function isAmadeusApiError(error: unknown): error is AmadeusApiError {
  return error instanceof AmadeusApiError;
}

export type FlightSearchInput = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
};

export type FlightSegment = {
  carrierCode: string;
  carrierName: string;
  flightNumber: string;
  departureIata: string;
  departureAt: string;
  arrivalIata: string;
  arrivalAt: string;
  duration?: string;
};

export type FlightItinerary = {
  leg: "outbound" | "return";
  duration: string;
  stops: number;
  segments: FlightSegment[];
};

export type NormalizedFlightResult = {
  id: string;
  totalPrice: number;
  currency: string;
  bookableSeats: number | null;
  lastTicketingDate: string | null;
  itineraries: FlightItinerary[];
};

export type HotelSearchInput = {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
};

export type NormalizedHotelResult = {
  id: string;
  hotelId: string;
  name: string;
  cityCode: string;
  rating: number | null;
  totalPrice: number;
  currency: string;
  checkInDate: string;
  checkOutDate: string;
  roomDescription: string | null;
  boardType: string | null;
  cancellationPolicy: string | null;
};

export type NormalizedLocationResult = {
  id: string;
  iataCode: string;
  cityCode: string;
  name: string;
  cityName: string | null;
  countryCode: string | null;
  subType: string | null;
};

type AmadeusFlightOfferResponse = {
  data: Array<{
    id: string;
    numberOfBookableSeats?: number;
    lastTicketingDate?: string;
    price: {
      currency: string;
      total: string;
      grandTotal?: string;
    };
    itineraries: Array<{
      duration: string;
      segments: Array<{
        carrierCode: string;
        number: string;
        departure: {
          iataCode: string;
          at: string;
        };
        arrival: {
          iataCode: string;
          at: string;
        };
        duration?: string;
      }>;
    }>;
  }>;
  dictionaries?: {
    carriers?: Record<string, string>;
  };
};

type AmadeusHotelsByCityResponse = {
  data: Array<{
    hotelId: string;
  }>;
};

type AmadeusHotelOffersResponse = {
  data: Array<{
    hotel: {
      hotelId: string;
      name?: string;
      cityCode?: string;
      rating?: string;
    };
    offers?: Array<{
      id: string;
      checkInDate: string;
      checkOutDate: string;
      boardType?: string;
      room?: {
        description?: {
          text?: string;
        };
        typeEstimated?: {
          category?: string;
          bedType?: string;
          beds?: number;
        };
      };
      price: {
        total: string;
        currency: string;
      };
      policies?: {
        cancellation?: {
          description?: {
            text?: string;
          };
        };
      };
    }>;
  }>;
};

type AmadeusLocationSearchResponse = {
  data: Array<{
    id?: string;
    iataCode?: string;
    name?: string;
    detailedName?: string;
    subType?: string;
    address?: {
      cityCode?: string;
      cityName?: string;
      countryCode?: string;
    };
  }>;
};

function getRequiredEnv(name: "AMADEUS_CLIENT_ID" | "AMADEUS_CLIENT_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new AmadeusApiError(
      `Missing required environment variable: ${name}`,
      500,
      { name },
    );
  }
  return value;
}

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function getAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && tokenCache && tokenCache.expiresAtMs > Date.now()) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: getRequiredEnv("AMADEUS_CLIENT_ID"),
    client_secret: getRequiredEnv("AMADEUS_CLIENT_SECRET"),
  });

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AmadeusApiError(
      "Failed to obtain Amadeus access token",
      response.status,
      await safeJson(response),
    );
  }

  const tokenPayload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    accessToken: tokenPayload.access_token,
    expiresAtMs: Date.now() + Math.max(30, tokenPayload.expires_in - 30) * 1000,
  };

  return tokenPayload.access_token;
}

async function amadeusGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  retryOnUnauthorized = true,
): Promise<T> {
  const accessToken = await getAccessToken();
  const url = new URL(`${AMADEUS_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 && retryOnUnauthorized) {
    tokenCache = null;
    return amadeusGet<T>(path, params, false);
  }

  if (!response.ok) {
    throw new AmadeusApiError(
      `Amadeus request failed for ${path}`,
      response.status,
      await safeJson(response),
    );
  }

  return (await response.json()) as T;
}

export async function searchFlights(
  input: FlightSearchInput,
): Promise<NormalizedFlightResult[]> {
  const response = await amadeusGet<AmadeusFlightOfferResponse>(
    "/v2/shopping/flight-offers",
    {
      originLocationCode: input.origin,
      destinationLocationCode: input.destination,
      departureDate: input.departDate,
      returnDate: input.returnDate,
      adults: input.adults,
      max: 20,
    },
  );

  const carriers = response.dictionaries?.carriers ?? {};

  return response.data.map((offer) => {
    const itineraries: FlightItinerary[] = offer.itineraries.map(
      (itinerary, itineraryIndex) => ({
        leg: itineraryIndex === 0 ? "outbound" : "return",
        duration: itinerary.duration,
        stops: Math.max(0, itinerary.segments.length - 1),
        segments: itinerary.segments.map((segment) => ({
          carrierCode: segment.carrierCode,
          carrierName: carriers[segment.carrierCode] ?? segment.carrierCode,
          flightNumber: segment.number,
          departureIata: segment.departure.iataCode,
          departureAt: segment.departure.at,
          arrivalIata: segment.arrival.iataCode,
          arrivalAt: segment.arrival.at,
          duration: segment.duration,
        })),
      }),
    );

    return {
      id: offer.id,
      totalPrice: Number(offer.price.grandTotal ?? offer.price.total),
      currency: offer.price.currency,
      bookableSeats: offer.numberOfBookableSeats ?? null,
      lastTicketingDate: offer.lastTicketingDate ?? null,
      itineraries,
    };
  });
}

export async function searchHotels(
  input: HotelSearchInput,
): Promise<NormalizedHotelResult[]> {
  const hotelsByCity = await amadeusGet<AmadeusHotelsByCityResponse>(
    "/v1/reference-data/locations/hotels/by-city",
    {
      cityCode: input.cityCode,
      radius: 25,
      radiusUnit: "KM",
      hotelSource: "ALL",
    },
  );

  const hotelIds = hotelsByCity.data
    .map((hotel) => hotel.hotelId)
    .filter(Boolean)
    .slice(0, 10);

  if (hotelIds.length === 0) {
    return [];
  }

  const hotelOffers = await amadeusGet<AmadeusHotelOffersResponse>(
    "/v3/shopping/hotel-offers",
    {
      hotelIds: hotelIds.join(","),
      adults: input.adults,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      roomQuantity: 1,
      bestRateOnly: "true",
    },
  );

  return hotelOffers.data.flatMap((entry) => {
    const firstOffer = entry.offers?.[0];
    if (!firstOffer) {
      return [];
    }

    const typeEstimated = firstOffer.room?.typeEstimated;
    const estimatedTextParts = [
      typeEstimated?.category,
      typeEstimated?.bedType,
      typeof typeEstimated?.beds === "number" ? `${typeEstimated.beds} bed(s)` : null,
    ].filter(Boolean);

    return [
      {
        id: firstOffer.id,
        hotelId: entry.hotel.hotelId,
        name: entry.hotel.name ?? "Unnamed hotel",
        cityCode: entry.hotel.cityCode ?? input.cityCode,
        rating: entry.hotel.rating ? Number(entry.hotel.rating) : null,
        totalPrice: Number(firstOffer.price.total),
        currency: firstOffer.price.currency,
        checkInDate: firstOffer.checkInDate,
        checkOutDate: firstOffer.checkOutDate,
        roomDescription:
          firstOffer.room?.description?.text ??
          (estimatedTextParts.length > 0 ? estimatedTextParts.join(" • ") : null),
        boardType: firstOffer.boardType ?? null,
        cancellationPolicy:
          firstOffer.policies?.cancellation?.description?.text ?? null,
      },
    ];
  });
}

export async function searchLocationsByKeyword(
  keyword: string,
): Promise<NormalizedLocationResult[]> {
  const response = await amadeusGet<AmadeusLocationSearchResponse>(
    "/v1/reference-data/locations",
    {
      keyword,
      subType: "AIRPORT",
      "page[limit]": 12,
      view: "LIGHT",
      sort: "analytics.travelers.score",
    },
  );

  const unique = new Set<string>();
  const normalized: NormalizedLocationResult[] = [];

  for (const location of response.data) {
    const iataCode = location.iataCode?.toUpperCase();
    if (!iataCode) continue;
    if (unique.has(iataCode)) continue;
    unique.add(iataCode);

    normalized.push({
      id: location.id ?? iataCode,
      iataCode,
      cityCode: location.address?.cityCode?.toUpperCase() ?? iataCode,
      name: location.name ?? location.detailedName ?? iataCode,
      cityName: location.address?.cityName ?? null,
      countryCode: location.address?.countryCode ?? null,
      subType: location.subType ?? null,
    });
  }

  return normalized;
}
