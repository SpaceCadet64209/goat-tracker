import { z } from "zod";

const testEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_ENV: z.enum(["local", "preview", "staging", "test"]),
  SUPABASE_TEST_TARGET: z.literal("non-production").optional(),
});

export type TestEnvironment = z.infer<typeof testEnvironmentSchema>;

function isLocalSupabase(url: URL): boolean {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

/** Reject unknown and production-like targets before tests can mutate data. */
export function getSafeTestEnvironment(
  source: Record<string, string | undefined> = process.env,
): TestEnvironment {
  const environment = testEnvironmentSchema.parse(source);
  const url = new URL(environment.NEXT_PUBLIC_SUPABASE_URL);
  if (isLocalSupabase(url)) return environment;
  if (environment.SUPABASE_TEST_TARGET !== "non-production") {
    throw new Error(
      "Refusing to run tests against a non-local Supabase URL without SUPABASE_TEST_TARGET=non-production.",
    );
  }
  return environment;
}
