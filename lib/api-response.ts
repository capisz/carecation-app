import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      details,
      status,
    },
    { status },
  );
}

export function logApiEvent(input: {
  route: string;
  status: number;
  message: string;
  details?: unknown;
}) {
  console.info("[Carecation API]", {
    timestamp: new Date().toISOString(),
    ...input,
  });
}
