"use server";

import type {
  LessorChangeInfo,
  LessorChangeInfoApiResponse,
} from "@/features/lessor-change/types/lessor-change";
import { apiRequest } from "@/lib/api/api-request";

/** `GET /lessor-change/info` — fee, notice and required documents (public). */
export async function getLessorChangeInfo(): Promise<LessorChangeInfo> {
  const response = await apiRequest<LessorChangeInfoApiResponse>(
    "/lessor-change/info",
    { method: "GET", cache: "no-store" },
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    throw new Error(
      response.error || response.data?.message || "Failed to fetch lessor change info",
    );
  }

  return response.data.data;
}
