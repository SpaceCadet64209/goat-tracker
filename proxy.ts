import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/env/client";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Environments without Supabase credentials have no session to refresh, so the
  // request passes through instead of failing every route.
  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createSupabaseMiddlewareClient(request, response);
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-touch-icon.svg).*)",
  ],
};
