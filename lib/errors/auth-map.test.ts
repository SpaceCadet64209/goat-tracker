import { describe, expect, it } from "vitest";

import { mapErrorToActionFailure } from "./map";

describe("safe authentication error mapping", () => {
  it("does not expose a provider error message", () => {
    const result = mapErrorToActionFailure({
      name: "AuthApiError",
      message: "User does not exist",
      status: 401,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "AUTHENTICATION_REQUIRED",
    });
    expect(result.message).not.toContain("does not exist");
  });
});
