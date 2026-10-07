import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_TOKEN_COOKIE, GUEST_SESSION_COOKIE } from "@/lib/api/constants";
import { isGuestOnlyRoute, isProtectedRoute } from "@/lib/auth/auth-routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_TOKEN_COOKIE)?.value);
  // A guest session (wizard without an account) may read its own orders, but
  // it is not a signed-in customer: login/register stay reachable.
  const isGuest = request.cookies.get(GUEST_SESSION_COOKIE)?.value === "1";

  // Account pages require a signed-in customer — send guests to login and
  // remember where they were headed.
  if (isProtectedRoute(pathname) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages are for guests — a signed-in customer is sent home instead.
  if (isGuestOnlyRoute(pathname) && hasSession && !isGuest) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
