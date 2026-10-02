"use server";

import { setAuthToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";
import type { LoginApiResponse } from "@/features/auth/types/auth-user";

type LoginUserPayload = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export async function loginUser(payload: LoginUserPayload) {
  const response = await apiRequest<LoginApiResponse>("/auth/web/login", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    }),
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  const { user, token } = response.data.data;

  await setAuthToken(token, payload.rememberMe);

  return {
    ok: true,
    message: response.data.message,
    user,
  } as const;
}
