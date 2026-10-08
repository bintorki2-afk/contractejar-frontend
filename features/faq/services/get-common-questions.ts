"use server";

import { apiRequest } from "@/lib/api/api-request";
import type {
  CommonQuestion,
  CommonQuestionsApiResponse,
} from "@/features/faq/types/common-question";

export async function getCommonQuestions(): Promise<CommonQuestion[]> {
  const response = await apiRequest<CommonQuestionsApiResponse>(
    "/common-questions",
    {
      method: "GET",
      // Shared by every visitor: re-fetched at most every 5 minutes. With
      // no-store each page view hit the API from the website server's IP and
      // ~30 views/minute tripped the API limit (60/min/IP) → empty FAQ.
      next: { revalidate: 300 },
    },
  );

  if (!response.ok || !response.data?.success) {
    throw new Error(
      response.error || response.data?.message || "Failed to fetch common questions",
    );
  }

  return response.data.data.map((item, index) => ({
    id: `faq-${index}`,
    question: item.title,
    answer: item.answer,
  }));
}
