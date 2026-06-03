import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  const body: {
    error: string;
    status: number;
    details?: unknown;
  } = {
    error: message,
    status,
  };

  if (details !== undefined && process.env.NODE_ENV !== "production") {
    body.details = details;
  }

  return NextResponse.json(
    body,
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
