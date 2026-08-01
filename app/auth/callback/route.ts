import { NextResponse, type NextRequest } from "next/server";

import { getSafeReturnPath } from "@/lib/auth/return-path";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function GET(request: NextRequest) {
  const next = getSafeReturnPath(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = createSupabaseMiddlewareClient(request, response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
