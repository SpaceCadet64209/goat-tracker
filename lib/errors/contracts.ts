/** Stable, user-safe failure categories returned by Server Actions. */
export const publicErrorCodes = [
  "VALIDATION_ERROR",
  "AUTHENTICATION_REQUIRED",
  "AUTHORIZATION_DENIED",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
  "DATABASE_CONSTRAINT",
  "UNEXPECTED_ERROR",
] as const;

export type PublicErrorCode = (typeof publicErrorCodes)[number];

export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export type ActionSuccess<T> = {
  readonly ok: true;
  readonly data: T;
};

export type ActionFailure = {
  readonly ok: false;
  readonly code: PublicErrorCode;
  readonly message: string;
  readonly fieldErrors?: FieldErrors;
  readonly correlationId?: string;
};

export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export const publicErrorMessages: Readonly<Record<PublicErrorCode, string>> = {
  VALIDATION_ERROR: "Please correct the highlighted fields and try again.",
  AUTHENTICATION_REQUIRED: "Please sign in and try again.",
  AUTHORIZATION_DENIED: "You do not have permission to perform this action.",
  NOT_FOUND: "We could not find what you requested.",
  CONFLICT:
    "This action conflicts with the current data. Refresh and try again.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  DATABASE_CONSTRAINT:
    "This action cannot be completed with the supplied data.",
  UNEXPECTED_ERROR: "Something went wrong. Please try again.",
};

export function actionSuccess<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function actionFailure(
  code: PublicErrorCode,
  options: Omit<ActionFailure, "ok" | "code" | "message"> & {
    message?: string;
  } = {},
): ActionFailure {
  const { message = publicErrorMessages[code], ...details } = options;
  return { ok: false, code, message, ...details };
}

/**
 * Throw this only for expected errors whose category is safe to expose.
 * The message is intentionally selected from the public taxonomy.
 */
export class PublicActionError extends Error {
  constructor(
    public readonly code: Exclude<
      PublicErrorCode,
      "VALIDATION_ERROR" | "UNEXPECTED_ERROR"
    >,
  ) {
    super(publicErrorMessages[code]);
    this.name = "PublicActionError";
  }
}
