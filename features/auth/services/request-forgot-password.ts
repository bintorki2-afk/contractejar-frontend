"use server";

import { apiRequest } from "@/lib/api/api-request";

type ForgotPasswordPayload = {
  email: string;
};

type ForgotPasswordApiResponse = {
  message: string;
  code: number;
  success: boolean;
};

export async function requestForgotPassword(payload: ForgotPasswordPayload) {
  const response = await apiRequest<ForgotPasswordApiResponse>(
    "/auth/web/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
      }),
      cache: "no-store",
    },
  );

  if (!response.ok || !response.data?.success) {
    return {
      ok: false,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  return {
    ok: true,
    email: payload.email,
    message: response.data.message,
  } as const;
}
