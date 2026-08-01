import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** A liveness probe only; it deliberately does not test or expose dependencies. */
export function GET() {
  return NextResponse.json(
    { status: "ok" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
