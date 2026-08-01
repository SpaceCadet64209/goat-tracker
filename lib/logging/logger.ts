import { randomUUID } from "node:crypto";

export type LogLevel = "info" | "warn" | "error";
export type AuditOutcome = "succeeded" | "denied" | "failed";

export type SafeLogContext = Readonly<Record<string, unknown>>;

export type LogEntry = {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly environment: string;
  readonly operation: string;
  readonly correlationId: string;
  readonly event?: string;
  readonly context?: SafeLogContext;
};

export type AuditEvent = {
  readonly operation: string;
  readonly outcome: AuditOutcome;
  readonly correlationId: string;
  readonly actorId?: string;
  readonly farmId?: string;
  readonly targetId?: string;
};

type LoggerDependencies = {
  readonly write?: (entry: LogEntry) => void;
  readonly now?: () => Date;
  readonly environment?: string;
};

const sensitiveKey =
  /(?:authorization|cookie|password|secret|token|api[_-]?key|service[_-]?role|signed[_-]?url|payload|email|phone|address)/i;
const signedUrlValue =
  /(?:x-amz-signature|x-amz-credential|signature=|token=|access_token=)/i;
const correlationIdPattern = /^[A-Za-z0-9._-]{1,128}$/;

/** Removes credentials and raw personal/form payloads before a log leaves the process. */
export function redactLogValue(value: unknown, key?: string): unknown {
  if (key && sensitiveKey.test(key)) return "[REDACTED]";
  if (typeof value === "string") {
    return signedUrlValue.test(value) ? "[REDACTED]" : value;
  }
  if (Array.isArray(value)) return value.map((item) => redactLogValue(item));
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null) {
    const redacted: Record<string, unknown> = {};
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      redacted[nestedKey] = redactLogValue(nestedValue, nestedKey);
    }
    return redacted;
  }
  return value;
}

export function correlationIdFromHeaders(headers?: Headers): string {
  const supplied = headers?.get("x-request-id");
  return supplied && correlationIdPattern.test(supplied)
    ? supplied
    : randomUUID();
}

function defaultWrite(entry: LogEntry): void {
  const line = JSON.stringify(entry);
  if (entry.level === "error") console.error(line);
  else if (entry.level === "warn") console.warn(line);
  else console.info(line);
}

export function createServerLogger(dependencies: LoggerDependencies = {}) {
  const write = dependencies.write ?? defaultWrite;
  const now = dependencies.now ?? (() => new Date());
  const environment =
    dependencies.environment ?? process.env.NODE_ENV ?? "development";

  function log(
    level: LogLevel,
    operation: string,
    correlationId: string,
    context?: SafeLogContext,
    event?: string,
  ): void {
    write({
      timestamp: now().toISOString(),
      level,
      environment,
      operation,
      correlationId,
      ...(event ? { event } : {}),
      ...(context
        ? { context: redactLogValue(context) as SafeLogContext }
        : {}),
    });
  }

  return {
    info: (
      operation: string,
      correlationId: string,
      context?: SafeLogContext,
    ) => log("info", operation, correlationId, context),
    warn: (
      operation: string,
      correlationId: string,
      context?: SafeLogContext,
    ) => log("warn", operation, correlationId, context),
    error: (
      operation: string,
      correlationId: string,
      context?: SafeLogContext,
    ) => log("error", operation, correlationId, context),
    audit: (event: AuditEvent) => {
      const { operation, outcome, correlationId, ...identifiers } = event;
      log(
        "info",
        operation,
        correlationId,
        { outcome, ...identifiers },
        "privileged_operation",
      );
    },
  };
}

export const serverLogger = createServerLogger();
