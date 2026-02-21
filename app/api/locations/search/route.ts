import { NextResponse } from "next/server";
import {
  isAmadeusApiError,
  searchLocationsByKeyword,
} from "@/lib/amadeus";

type LocationSearchBody = {
  keyword?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LocationSearchBody;
    const keyword = (body.keyword ?? "").trim();

    if (keyword.length < 2) {
      return NextResponse.json(
        { error: "keyword must be at least 2 characters." },
        { status: 400 },
      );
    }

    const results = await searchLocationsByKeyword(keyword);

    return NextResponse.json({
      results,
      count: results.length,
    });
  } catch (error) {
    if (isAmadeusApiError(error)) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status },
      );
    }

    return NextResponse.json(
      { error: "Failed to search locations." },
      { status: 500 },
    );
  }
}
