import { NextResponse } from "next/server";

// Deliberately independent of Supabase: Railway uses this to verify that the
// Next.js process has started, even while an external service is unavailable.
export function GET() {
  return NextResponse.json({ status: "ok" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
