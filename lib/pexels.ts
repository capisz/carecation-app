import "server-only";

import type { NormalizedHotelResult } from "@/lib/amadeus";
import { TRAVEL_LOCATION_PROFILES } from "@/lib/travel-locations";

const PEXELS_BASE_URL = "https://api.pexels.com/v1";
const DEFAULT_PER_PAGE = 40;

type PexelsPhoto = {
  id: number;
  url: string;
  alt?: string;
  photographer: string;
  photographer_url: string;
  src: {
    large?: string;
    large2x?: string;
    landscape?: string;
    medium?: string;
  };
};

type PexelsSearchResponse = {
  photos?: PexelsPhoto[];
};

function getPexelsApiKey(): string | null {
  const value = process.env.PEXELS_API_KEY?.trim();
  return value || null;
}

function getCityLabel(cityCode: string): string {
  const normalizedCityCode = cityCode.trim().toUpperCase();

  for (const profile of TRAVEL_LOCATION_PROFILES) {
    if (profile.recommendedCityCode === normalizedCityCode) {
      return profile.recommendedCity;
    }

    const matchingAirport = profile.airports.find(
      (airport) =>
        airport.cityCode === normalizedCityCode || airport.iata === normalizedCityCode,
    );
    if (matchingAirport) {
      return matchingAirport.city;
    }
  }

  return normalizedCityCode;
}

function buildHotelImageQuery(cityCode: string): string {
  const cityLabel = getCityLabel(cityCode);
  return `${cityLabel} hotel exterior lobby`;
}

async function fetchPexelsPhotos(query: string): Promise<PexelsPhoto[]> {
  const apiKey = getPexelsApiKey();
  if (!apiKey) {
    return [];
  }

  const url = new URL(`${PEXELS_BASE_URL}/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", String(DEFAULT_PER_PAGE));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as PexelsSearchResponse;
  return data.photos ?? [];
}

function normalizePexelsPhoto(photo: PexelsPhoto) {
  const imageUrl =
    photo.src.landscape ??
    photo.src.large2x ??
    photo.src.large ??
    photo.src.medium;

  if (!imageUrl) {
    return null;
  }

  return {
    imageUrl,
    imageAlt: photo.alt || "Representative hotel image",
    imageSource: "Pexels representative image",
    imageSourceUrl: photo.url,
    imagePhotographer: photo.photographer,
    imagePhotographerUrl: photo.photographer_url,
    imageIsRepresentative: true,
  };
}

export async function addRepresentativeHotelImages(
  hotels: NormalizedHotelResult[],
  cityCode: string,
): Promise<NormalizedHotelResult[]> {
  if (hotels.length === 0) {
    return hotels;
  }

  try {
    const photos = await fetchPexelsPhotos(buildHotelImageQuery(cityCode));
    if (photos.length === 0) {
      return hotels;
    }

    const usedPhotoIds = new Set<number>();

    return hotels.map((hotel) => {
      const photo = photos.find((candidate) => {
        if (usedPhotoIds.has(candidate.id)) {
          return false;
        }
        return Boolean(normalizePexelsPhoto(candidate)?.imageUrl);
      }) ??
        null;

      if (!photo) {
        return hotel;
      }

      const normalizedPhoto = normalizePexelsPhoto(photo);
      if (!normalizedPhoto) {
        return hotel;
      }

      usedPhotoIds.add(photo.id);

      return {
        ...hotel,
        ...normalizedPhoto,
        imageAlt: `Representative hotel-style image for ${hotel.name}`,
      };
    });
  } catch {
    return hotels;
  }
}
