"use server";

import type { ContractStep6ApiData } from "@/features/create-contract/types/contract-step6-api";
import {
  buildContractStep6Body,
  type ContractStep6Payload,
} from "@/features/create-contract/utils/build-contract-step6-payload";
import { normalizeContractStepFix } from "@/features/create-contract/types/contract-fix-api";
import { apiRequest } from "@/lib/api/api-request";

type ContractStep6ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep6ApiData;
  /** دفعة هـ (E4): وضع التصحيح — الحقول المتغيّرة والطلبات المحلولة. */
  fix?: unknown;
};

export async function submitContractStep6(payload: ContractStep6Payload) {
  const response = await apiRequest<ContractStep6ApiResponse>("/contract/step6", {
    method: "POST",
    body: JSON.stringify(buildContractStep6Body(payload)),
    cache: "no-store",
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error:
        response.error ||
        response.data?.message ||
        "Failed to submit finance data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
    fix: normalizeContractStepFix(response.data.fix),
  };
}
