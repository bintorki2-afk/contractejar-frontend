"use server";

import { clearAuthToken } from "@/actions/auth";

/**
 * Drops a session the API no longer accepts (expired / revoked token). Server
 * Components cannot delete cookies, so pages that detect a 401 while rendering
 * call this from the client before sending the customer to /login (otherwise
 * the stale cookie makes the middleware bounce /login back to the home page).
 */
export async function clearExpiredSession(): Promise<void> {
  await clearAuthToken();
}
