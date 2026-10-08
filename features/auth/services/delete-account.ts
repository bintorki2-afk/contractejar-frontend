"use server";

import { clearAuthToken } from "@/actions/auth";
import { apiRequest } from "@/lib/api/api-request";

type DeleteAccountApiResponse = {
  success: boolean;
  message?: string;
};

/**
 * Customer account deletion (`POST /account/delete` with `confirm: true`):
 * the API anonymises the personal data and soft-deletes the account; contracts
 * and invoices stay for accounting. The session cookie is dropped on success.
 */
export async function deleteAccount(): Promise<
  { ok: true; message: string | null } | { ok: false; error: string; status: number }
> {
  const response = await apiRequest<DeleteAccountApiResponse>("/account/delete", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({ confirm: true }),
  });

  if (!response.ok || !response.data?.success) {
    return {
      ok: false,
      status: response.status,
      error: response.error || response.data?.message || "تعذّر حذف الحساب الآن.",
    };
  }

  await clearAuthToken();
  return { ok: true, message: response.data.message ?? null };
}
