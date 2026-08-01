import { describe, expect, it } from "vitest";

import { passwordUpdateSchema, signInSchema, signUpSchema } from "./schemas";

describe("authentication schemas", () => {
  it("requires a valid email and sufficiently long password", () => {
    expect(
      signInSchema.safeParse({ email: "not-an-email", password: "short" })
        .success,
    ).toBe(false);
  });

  it("requires matching passwords for sign-up and password updates", () => {
    expect(
      signUpSchema.safeParse({
        email: "goat@example.com",
        password: "sufficient-password",
        confirmPassword: "different-password",
      }).success,
    ).toBe(false);
    expect(
      passwordUpdateSchema.safeParse({
        password: "sufficient-password",
        confirmPassword: "different-password",
      }).success,
    ).toBe(false);
  });

  it("normalizes an unsafe redirect to the farm entry", () => {
    const result = signInSchema.parse({
      email: "goat@example.com",
      password: "sufficient-password",
      next: "https://attacker.example",
    });
    expect(result.next).toBe("/farms");
  });
});
