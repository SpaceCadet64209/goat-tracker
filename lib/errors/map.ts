import { ZodError } from "zod";

import {
  actionFailure,
  type ActionFailure,
  type FieldErrors,
  type PublicErrorCode,
  PublicActionError,
} from "./contracts";

type ErrorLike = {
  code?: unknown;
  name?: unknown;
  status?: unknown;
};

const databaseConstraintCodes = new Set(["22P02", "23503", "23514"]);

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === "object" && error !== null;
}

function zodFieldErrors(error: ZodError): FieldErrors {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.length === 0 ? "form" : issue.path.join(".");
    (errors[field] ??= []).push(issue.message);
  }

  return errors;
}

/** Maps known server failures to the stable public action contract. */
export function mapErrorToActionFailure(
  error: unknown,
  correlationId?: string,
): ActionFailure {
  if (error instanceof ZodError) {
    return actionFailure("VALIDATION_ERROR", {
      fieldErrors: zodFieldErrors(error),
    });
  }

  if (error instanceof PublicActionError) {
    return actionFailure(error.code);
  }

  if (isErrorLike(error)) {
    const code = typeof error.code === "string" ? error.code : undefined;
    const name = typeof error.name === "string" ? error.name : undefined;
    const status = typeof error.status === "number" ? error.status : undefined;

    if (code === "23505") return actionFailure("CONFLICT");
    if (databaseConstraintCodes.has(code ?? "")) {
      return actionFailure("DATABASE_CONSTRAINT");
    }
    if (code === "PGRST116") return actionFailure("NOT_FOUND");
    if (code === "42501" || status === 403) {
      return actionFailure("AUTHORIZATION_DENIED");
    }
    if (status === 429 || code === "429") return actionFailure("RATE_LIMITED");
    if (
      status === 401 ||
      name === "AuthApiError" ||
      name === "AuthSessionMissingError"
    ) {
      return actionFailure("AUTHENTICATION_REQUIRED");
    }
  }

  return actionFailure(
    "UNEXPECTED_ERROR",
    correlationId ? { correlationId } : {},
  );
}

/** Narrow helper for callers that need a compile-time stable code. */
export function isPublicErrorCode(value: string): value is PublicErrorCode {
  return [
    "VALIDATION_ERROR",
    "AUTHENTICATION_REQUIRED",
    "AUTHORIZATION_DENIED",
    "NOT_FOUND",
    "CONFLICT",
    "RATE_LIMITED",
    "DATABASE_CONSTRAINT",
    "UNEXPECTED_ERROR",
  ].includes(value);
}
