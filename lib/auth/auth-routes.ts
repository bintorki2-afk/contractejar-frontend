export const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/properties",
  "/requests",
  "/notifications",
  "/profile",
  "/account",
] as const;

export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

// Reject backslashes and control characters (incl. tab/newline): "/\evil.com"
// or "/\t/evil.com" would become a protocol-relative (off-site) redirect.
// Normal path characters like "-" (e.g. /create-contract) remain allowed.
const UNSAFE_CALLBACK_CHARS = /[\x00-\x1f\\]/;

export function getSafeCallbackUrl(callbackUrl: string | null): string {
  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//") ||
    UNSAFE_CALLBACK_CHARS.test(callbackUrl)
  ) {
    return "/";
  }

  return callbackUrl;
}
