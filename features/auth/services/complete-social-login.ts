"use server";

import { setAuthToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";
import type { AuthUser } from "@/features/auth/types/auth-user";

type MeApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    user: AuthUser;
  };
};

/**
 * Finish a social (Google / Apple) sign-in: the provider callback handed the
 * SPA a Sanctum token, so persist it, then load the current user.
 */
export async function completeSocialLogin(token: string) {
  const clean = token.trim();
  if (!clean) {
    return { ok: false, error: "Missing token" } as const;
  }

  await setAuthToken(clean, true);

  const response = await apiRequest<MeApiResponse>("/auth/web/me", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok || !response.data?.data?.user) {
    return {
      ok: false,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  return { ok: true, user: response.data.data.user } as const;
}
