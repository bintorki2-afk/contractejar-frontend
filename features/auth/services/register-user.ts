"use server";

import { setAuthToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";
import type { LoginApiResponse } from "@/features/auth/types/auth-user";

type RegisterUserPayload = {
  fullName: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterUserPayload) {
  const name = payload.fullName.trim().replace(/\s+/g, " ");
  const firstSpace = name.indexOf(" ");
  const fname = firstSpace === -1 ? name : name.slice(0, firstSpace);
  const lname = firstSpace === -1 ? undefined : name.slice(firstSpace + 1);

  const response = await apiRequest<LoginApiResponse>("/auth/web/register", {
    method: "POST",
    body: JSON.stringify({
      fname,
      ...(lname ? { lname } : {}),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      password_confirmation: payload.password,
    }),
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false,
      error: response.error || response.data?.message || "Something went wrong",
    } as const;
  }

  // The backend returns a token on register too, so sign the customer in right
  // away; the UI still nudges them to confirm their email (a link was emailed).
  const { user, token } = response.data.data;
  await setAuthToken(token, true);

  return {
    ok: true,
    message: response.data.message,
    user,
  } as const;
}
