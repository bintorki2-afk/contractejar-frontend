"use server";

import { setAuthToken } from "@/actions/auth";
import type { LoginApiResponse } from "@/features/auth/types/auth-user";
import { getSaudiMobileForApi } from "@/features/auth/utils/normalize-saudi-phone";
import { apiRequest } from "@/lib/api/api-request";

/**
 * Passwordless sign-in, step 2. On success the customer token replaces any
 * guest session cookie, and the backend has already merged the guest's orders
 * (same mobile) into this account.
 */
export async function verifyPhoneOtp(payload: { phone: string; code: string }) {
  const response = await apiRequest<LoginApiResponse>("/auth/otp/verify", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      mobile: getSaudiMobileForApi(payload.phone),
      verification_code: payload.code,
    }),
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  const { user, token } = response.data.data;
  await setAuthToken(token, true);

  return { ok: true, message: response.data.message, user } as const;
}
