"use server";

import { apiRequest } from "@/lib/api/api-request";

type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type ResetPasswordApiResponse = {
  message: string;
  code: number;
  success: boolean;
};

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await apiRequest<ResetPasswordApiResponse>(
    "/auth/web/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        token: payload.token,
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
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
    message: response.data.message,
  } as const;
}
