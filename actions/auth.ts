// Server-only helpers (not server actions): exporting these from a "use server"
// module would make them callable from the browser, and `getToken` would hand
// the httpOnly auth cookie to client JavaScript.
import "server-only";

import { cookies } from "next/headers";

import {
  AUTH_TOKEN_COOKIE,
  AUTH_TOKEN_MAX_AGE,
  GUEST_SESSION_COOKIE,
} from "@/lib/api/constants";

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function setAuthToken(
  token: string,
  rememberMe = false,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: AUTH_TOKEN_MAX_AGE } : {}),
  });
  // A real sign-in replaces any guest session.
  cookieStore.delete(GUEST_SESSION_COOKIE);
}

/**
 * Guest session (no account): the backend token is stored exactly like a
 * customer token so every server-backed call works unchanged, plus a marker
 * cookie so the app can tell a guest from a signed-in customer.
 */
export async function setGuestToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const common = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_TOKEN_MAX_AGE,
  };

  cookieStore.set(AUTH_TOKEN_COOKIE, token, { ...common, httpOnly: true });
  cookieStore.set(GUEST_SESSION_COOKIE, "1", { ...common, httpOnly: false });
}

export async function isGuestSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return (
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE)?.value) &&
    cookieStore.get(GUEST_SESSION_COOKIE)?.value === "1"
  );
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_COOKIE);
  cookieStore.delete(GUEST_SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return Boolean(token);
}
