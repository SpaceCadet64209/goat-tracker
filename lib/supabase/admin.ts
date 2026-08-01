import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnvironment } from "@/lib/env/server";

import type { Database } from "./database.types";

/**
 * Policy-bypassing access for narrowly reviewed administrative operations only.
 * Ordinary request handling must use createSupabaseServerClient instead.
 */
export function createSupabaseAdminClient() {
  const environment = getServerEnvironment();

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
