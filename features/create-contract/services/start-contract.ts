"use server";

import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import { apiRequest } from "@/lib/api/api-request";

export type StartContractPayload =
  | {
      contract_type: PropertyContractType;
      is_real: false;
    }
  | {
      contract_type: PropertyContractType;
      is_real: true;
      real_id: number;
      unit_ids: number[];
      instrument_type?: string;
    };

type StartContractApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data: {
    contract_id: number;
    uuid: string;
    real_id?: number | null;
    real_units_id?: number | null;
    units_count?: number;
    unit_ids?: number[];
  };
};

export async function startContract(
  payload: StartContractPayload,
  /** Local draft id: a retry after a lost response returns the same contract (24 h). */
  idempotencyKey?: string,
) {
  const response = await apiRequest<StartContractApiResponse>("/contract/start", {
    method: "POST",
    cache: "no-store",
    headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    body: JSON.stringify({
      ...payload,
      app_or_web: "web",
      ...(idempotencyKey ? { client_reference: idempotencyKey } : {}),
    }),
  });

  if (!response.ok || !response.data?.success || !response.data.data) {
    return {
      ok: false as const,
      status: response.status,
      error: response.error || response.data?.message || "Failed to start contract",
    };
  }

  const data = response.data.data;

  return {
    ok: true as const,
    contractId: data.contract_id,
    uuid: data.uuid,
    realId: data.real_id ?? null,
    realUnitsId: data.real_units_id ?? null,
    unitsCount: data.units_count ?? data.unit_ids?.length ?? 0,
    unitIds: data.unit_ids ?? [],
    message: response.data.message,
  };
}
