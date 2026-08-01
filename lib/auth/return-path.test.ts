import { describe, expect, it } from "vitest";

import { getSafeReturnPath } from "./return-path";

describe("getSafeReturnPath", () => {
  it("preserves internal paths, queries, and fragments", () => {
    expect(getSafeReturnPath("/farms/123?tab=members#team")).toBe(
      "/farms/123?tab=members#team",
    );
  });

  it.each([
    "https://attacker.example",
    "//attacker.example",
    "javascript:alert(1)",
    "farms",
    undefined,
  ])("rejects unsafe return path %s", (value) =>
    expect(getSafeReturnPath(value)).toBe("/farms"),
  );
});
