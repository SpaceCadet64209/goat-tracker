import { clientEnvironmentSchema, type ClientEnvironment } from "./schemas";

function readClientEnvironment() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getClientEnvironment(): ClientEnvironment {
  return clientEnvironmentSchema.parse(readClientEnvironment());
}

export function isSupabaseConfigured(): boolean {
  return clientEnvironmentSchema.safeParse(readClientEnvironment()).success;
}
