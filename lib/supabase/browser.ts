import { createBrowserClient } from "@supabase/ssr";

import { getClientEnvironment } from "@/lib/env/client";

import type { Database } from "./database.types";

/** A browser-only client using the publishable key and the user's session. */
export function createSupabaseBrowserClient() {
  const environment = getClientEnvironment();

  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
