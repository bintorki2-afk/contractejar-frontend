"use server";

import type {
  LessorChangeApiResponse,
  LessorChangeOrder,
} from "@/features/lessor-change/types/lessor-change";
import { apiFormDataRequest } from "@/lib/api/api-request";

/**
 * `POST /lessor-change` (multipart) — sent with the session token exactly like
 * the contract wizard (guest token or the verified customer token).
 */
export async function submitLessorChange(
  formData: FormData,
): Promise<
  { ok: true; order: LessorChangeOrder } | { ok: false; error: string }
> {
  const response = await apiFormDataRequest<LessorChangeApiResponse>(
    "/lessor-change",
    formData,
    "POST",
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false,
      error:
        response.error ||
        response.data?.message ||
        "Failed to submit the lessor change request",
    };
  }

  return { ok: true, order: response.data.data };
}
