import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getClientEnvironment } from "@/lib/env/client";

import type { Database } from "./database.types";

/**
 * Creates a request-scoped client that carries the signed-in user's JWT.
 * Use this for all ordinary server reads and writes so RLS remains effective.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const environment = getClientEnvironment();

  return createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot mutate cookies. The request proxy refreshes
            // cookies before rendering, so this is safe to ignore here.
          }
        },
      },
    },
  );
}
