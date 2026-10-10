"use server";

import type { ContractStep2ApiData } from "@/features/create-contract/types/contract-step2-api";
import {
  appendContractStep2Fields,
  type SubmitContractStep2Payload,
} from "@/features/create-contract/utils/build-contract-step2-form-data";
import { normalizeContractStepFix } from "@/features/create-contract/types/contract-fix-api";
import { apiFormDataRequest } from "@/lib/api/api-request";

type ContractStep2ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractStep2ApiData;
  /** دفعة هـ (E4): وضع التصحيح — الحقول المتغيّرة والطلبات المحلولة. */
  fix?: unknown;
};

export async function submitContractStep2(payload: SubmitContractStep2Payload) {
  const formData = new FormData();
  appendContractStep2Fields(formData, payload);

  const response = await apiFormDataRequest<ContractStep2ApiResponse>(
    "/contract/step2",
    formData,
  );

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error: response.error || response.data?.message || "Failed to submit address data",
    };
  }

  return {
    ok: true as const,
    data: response.data.data,
    message: response.data.message,
    fix: normalizeContractStepFix(response.data.fix),
  };
}
