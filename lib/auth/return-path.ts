/**
 * Accepts only an internal, same-origin URL path. Authentication redirects never
 * trust an arbitrary URL from the query string or a form submission.
 */
export function getSafeReturnPath(value: unknown, fallback = "/farms"): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://goattrack.invalid");
    return url.origin === "https://goattrack.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
