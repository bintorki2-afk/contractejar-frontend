"use server";

import { getToken, setGuestToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";

type GuestSessionApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: {
    user: { id: number; is_guest: boolean; platform: string | null };
    token: string;
    is_guest: boolean;
  };
};

/**
 * Makes sure the browser holds a backend session before any server-backed
 * contract call. A signed-in customer already has one; otherwise a *guest*
 * token is created (no account, no phone) and stored in the auth cookie — so
 * the wizard, payment and "my requests" all work exactly as for a customer.
 *
 * Guest orders are merged into the customer's account automatically when the
 * same mobile number is verified by OTP later (backend rule).
 */
export async function ensureGuestSession(): Promise<
  { ok: true; created: boolean } | { ok: false; error: string }
> {
  const existing = await getToken();
  if (existing) {
    return { ok: true, created: false };
  }

  const response = await apiRequest<GuestSessionApiResponse>("/auth/guest", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({ platform: "website" }),
  });

  const token = response.data?.data?.token;
  if (!response.ok || !response.data?.success || !token) {
    return {
      ok: false,
      error:
        response.error ||
        response.data?.message ||
        "Failed to start a guest session",
    };
  }

  await setGuestToken(token);

  return { ok: true, created: true };
}
