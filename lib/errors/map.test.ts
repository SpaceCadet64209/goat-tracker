import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  actionSuccess,
  mapErrorToActionFailure,
  PublicActionError,
} from "./index";

describe("Server Action errors", () => {
  it("serializes validation errors without internal details", () => {
    const schema = z.object({
      name: z.string().min(2, "Use at least two characters"),
    });
    const error = schema.safeParse({ name: "" }).error;
    const result = mapErrorToActionFailure(error);

    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: { name: ["Use at least two characters"] },
    });
  });

  it("maps known failures and gives unexpected errors a safe correlation id", () => {
    expect(mapErrorToActionFailure({ code: "23505" }).code).toBe("CONFLICT");
    expect(
      mapErrorToActionFailure(new PublicActionError("NOT_FOUND")).code,
    ).toBe("NOT_FOUND");
    expect(
      mapErrorToActionFailure(new Error("password=not-safe"), "req-42"),
    ).toEqual({
      ok: false,
      code: "UNEXPECTED_ERROR",
      message: "Something went wrong. Please try again.",
      correlationId: "req-42",
    });
    expect(actionSuccess({ id: "farm-1" })).toEqual({
      ok: true,
      data: { id: "farm-1" },
    });
  });
});
