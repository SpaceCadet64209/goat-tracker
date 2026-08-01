import { describe, expect, it } from "vitest";

import { clientEnvironmentSchema, serverEnvironmentSchema } from "./schemas";

const validClientEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "local-publishable-key",
};

describe("environment schemas", () => {
  it("accepts separate valid client and server environments", () => {
    expect(clientEnvironmentSchema.parse(validClientEnvironment)).toEqual(
      validClientEnvironment,
    );

    expect(
      serverEnvironmentSchema.parse({
        ...validClientEnvironment,
        SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
        APP_URL: "http://localhost:3000",
        APP_ENV: "test",
      }),
    ).toMatchObject({ APP_ENV: "test" });
  });

  it("rejects invalid or incomplete configuration", () => {
    expect(() => clientEnvironmentSchema.parse({})).toThrow();
    expect(() =>
      serverEnvironmentSchema.parse({
        ...validClientEnvironment,
        SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
        APP_URL: "not-a-url",
        APP_ENV: "production",
      }),
    ).toThrow();
  });
});
