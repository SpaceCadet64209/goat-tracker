import { describe, expect, it } from "vitest";

import { getFarmFileExtension, sanitizeFarmFileDisplayName } from "./schemas";

describe("farm file validation helpers", () => {
  it("allows only explicit MIME types", () => {
    expect(getFarmFileExtension("image/jpeg")).toBe("jpg");
    expect(getFarmFileExtension("text/plain")).toBeNull();
  });

  it("does not retain a supplied path as display metadata", () => {
    expect(sanitizeFarmFileDisplayName("../../private\\notes.pdf")).toBe(".. .. private notes.pdf");
  });
});
