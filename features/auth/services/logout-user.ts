"use server";

import { clearAuthToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";

type LogoutApiResponse = {
  message: string;
  code: number;
  success: boolean;
};

export async function logoutUser() {
  const response = await apiRequest<LogoutApiResponse>("/auth/web/logout", {
    method: "POST",
    cache: "no-store",
  });

  if (response.ok && response.data?.success) {
    await clearAuthToken();

    return {
      ok: true,
      message: response.data.message,
    } as const;
  }

  if (response.status === 401) {
    await clearAuthToken();

    return {
      ok: true,
      message: response.data?.message,
    } as const;
  }

  return {
    ok: false,
    error: response.error || response.data?.message || "Something went wrong",
  } as const;
}
