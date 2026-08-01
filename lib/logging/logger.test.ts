import { describe, expect, it } from "vitest";

import {
  correlationIdFromHeaders,
  createServerLogger,
  redactLogValue,
} from "./index";

describe("server logging", () => {
  it("uses a valid inbound correlation id and replaces malformed values", () => {
    expect(
      correlationIdFromHeaders(new Headers({ "x-request-id": "request-42" })),
    ).toBe("request-42");
    expect(
      correlationIdFromHeaders(new Headers({ "x-request-id": "bad value" })),
    ).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("redacts secrets, cookies, signed URLs, and raw personal payloads", () => {
    const value = redactLogValue({
      cookie: "session=value",
      payload: { email: "person@example.com" },
      file: "https://example.test/object?X-Amz-Signature=secret",
      safeId: "farm-1",
    });

    expect(value).toEqual({
      cookie: "[REDACTED]",
      payload: "[REDACTED]",
      file: "[REDACTED]",
      safeId: "farm-1",
    });
  });

  it("writes safe structured audit entries", () => {
    const entries: unknown[] = [];
    const logger = createServerLogger({
      environment: "test",
      now: () => new Date("2026-07-31T10:00:00.000Z"),
      write: (entry) => entries.push(entry),
    });

    logger.audit({
      operation: "admin.delete-user",
      outcome: "denied",
      correlationId: "request-42",
      actorId: "user-1",
    });

    expect(entries).toEqual([
      {
        timestamp: "2026-07-31T10:00:00.000Z",
        level: "info",
        environment: "test",
        operation: "admin.delete-user",
        correlationId: "request-42",
        event: "privileged_operation",
        context: { outcome: "denied", actorId: "user-1" },
      },
    ]);
  });
});
