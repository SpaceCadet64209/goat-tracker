import { describe, expect, it } from "vitest";

import { getSafeTestEnvironment } from "../helpers/test-environment";

const base = {
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-key",
  SUPABASE_SERVICE_ROLE_KEY: "local-service-key",
  APP_ENV: "test",
} as const;

describe("getSafeTestEnvironment", () => {
  it("allows a local Supabase stack", () =>
    expect(
      getSafeTestEnvironment({
        ...base,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      }),
    ).toMatchObject({ APP_ENV: "test" }));

  it("rejects production configuration", () =>
    expect(() =>
      getSafeTestEnvironment({
        ...base,
        APP_ENV: "production",
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toThrow());

  it("requires an explicit non-production acknowledgement for remote projects", () =>
    expect(() =>
      getSafeTestEnvironment({
        ...base,
        NEXT_PUBLIC_SUPABASE_URL: "https://preview.supabase.co",
      }),
    ).toThrow("SUPABASE_TEST_TARGET=non-production"));
});
