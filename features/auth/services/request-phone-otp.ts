"use server";

import { apiRequest } from "@/lib/api/api-request";
import { getSaudiMobileForApi } from "@/features/auth/utils/normalize-saudi-phone";

type OtpApiResponse = { message: string; code: number; success: boolean };

/**
 * Passwordless sign-in, step 1 — the same endpoint the mobile app uses.
 * The backend creates the account on first use, so there is no separate
 * "register" on the website anymore.
 */
export async function requestPhoneOtp(phone: string) {
  const response = await apiRequest<OtpApiResponse>("/auth/otp/request", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      mobile: getSaudiMobileForApi(phone),
      platform: "website",
    }),
  });

  if (!response.ok || response.data?.success === false) {
    return {
      ok: false,
      status: response.status,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  return { ok: true, message: response.data?.message } as const;
}
