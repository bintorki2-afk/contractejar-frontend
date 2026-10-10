"use server";

import type {
  UncompletedContractApiResponse,
  UncompletedContractData,
} from "@/features/create-contract/types/uncompleted-contract";
import type { PendingDataRequest } from "@/features/requests/types/payment-state";
import { normalizePendingDataRequests } from "@/features/requests/utils/normalize-payment-state";
import { apiRequest } from "@/lib/api/api-request";

type ContractShowResponse = {
  message?: string;
  code?: number;
  success?: boolean;
  data?: Record<string, unknown>;
};

export type LoadContractForFixResult =
  | {
      ok: true;
      data: UncompletedContractData;
      request: PendingDataRequest;
      pendingRequests: PendingDataRequest[];
      contractType: "housing" | "commercial";
      /** `true` when only a partial prefill was possible (see issues-for-backend W-1). */
      partial: boolean;
    }
  | { ok: false; status: number; error: string; needsLogin: boolean; alreadyResolved?: boolean };

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Minimal `UncompletedContractData` from the customer contract resource, used
 * when `/contract/uncompleted-contract` refuses a paid order: the deed type,
 * existing image URLs and the ID numbers are enough for the wizard to show
 * the step prefilled with what the server has; the customer re-enters only
 * the requested fields.
 */
function buildPartialUncompletedData(contract: Record<string, unknown>, contractId: number, uuid: string): UncompletedContractData {
  const instrumentType = asText(contract.instrument_type) ?? asText(contract.type) ?? "electronic";
  const contractType = asText(contract.contract_type) ?? "housing";
  const lat = contract.latitude == null ? null : String(contract.latitude);
  const lng = contract.longitude == null ? null : String(contract.longitude);
  const addressUrl = asText(contract.address_url);
  const imageAddress = asText(contract.image_address);

  return {
    step: 7,
    contract_id: contractId,
    uuid,
    step1: {
      id: contractId,
      contract_id: contractId,
      uuid,
      contract_type: contractType,
      contract_type_trans: "",
      real_id: null,
      real_units_id: null,
      instrument_type: instrumentType,
      instrument_type_trans: "",
      image_instrument: asText(contract.image_instrument),
      image_instrument_from_the_front: asText(contract.image_instrument_from_the_front),
      image_instrument_from_the_back: asText(contract.image_instrument_from_the_back),
      Image_inheritance_certificate: asText(contract.Image_inheritance_certificate),
      copy_power_of_attorney_from_heirs_to_agent: asText(contract.copy_power_of_attorney_from_heirs_to_agent),
      copy_of_the_endowment_registration_certificate: asText(contract.copy_of_the_endowment_registration_certificate),
      copy_of_the_trusteeship_deed: asText(contract.copy_of_the_trusteeship_deed),
      is_multiple_trusteeship_deed_copy: null,
      copy_of_guardians_power_of_attorney_for_agent: asText(contract.copy_of_guardians_power_of_attorney_for_agent),
      latitude: lat,
      longitude: lng,
      lat,
      lng,
      address_url: addressUrl,
      step: 7,
    },
    step2: {
      id: contractId,
      uuid,
      contract_type: contractType,
      instrument_type: instrumentType,
      image_instrument: asText(contract.image_instrument),
      image_address: imageAddress,
      address_url: addressUrl,
      latitude: lat,
      longitude: lng,
      step: 7,
    },
    step3: {
      id: contractId,
      uuid,
      name_real_estate: asText(contract.name_real_estate),
      name_owner: null,
      property_owner_id_num: asText(contract.property_owner_id_num),
      property_owner_dob: null,
      type_dob_property_owner: null,
      property_owner_mobile: null,
      property_owner_iban: null,
      add_legal_agent_of_owner: null,
      id_num_of_property_owner_agent: null,
      dob_of_property_owner_agent: null,
      type_dob_property_owner_agent: null,
      mobile_of_property_owner_agent: null,
      copy_of_the_authorization_or_agency: null,
      step: 7,
    },
    step4: {
      id: contractId,
      uuid,
      tenant_id_num: asText(contract.tenant_id_num),
      step: 7,
    },
    step5: null,
    step6: null,
    units: null,
  };
}

/**
 * دفعة هـ (E4) — تحميل الطلب لوضع التصحيح: بيانات الخطوات (للتعبئة المسبقة)
 * + طلب المرفق الناقص المطلوب. يتطلب جلسة صاحب الطلب (زائر أنشأه من هذا
 * المتصفح أو مستخدم مسجّل بنفس الجوال)؛ وإلا `needsLogin`.
 */
export async function loadContractForFix(input: {
  orderUuid: string;
  contractId: number;
  requestId: number;
}): Promise<LoadContractForFixResult> {
  const uuid = String(input.orderUuid).replace(/[^0-9A-Za-z-]/g, "").slice(0, 64);
  const contractId = Math.trunc(input.contractId);

  const [uncompleted, show] = await Promise.all([
    apiRequest<UncompletedContractApiResponse>("/contract/uncompleted-contract", {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ uuid }),
    }),
    apiRequest<ContractShowResponse>(`/contracts/${contractId}`, { method: "GET", cache: "no-store" }),
  ]);

  const contract = show.ok && show.data?.success ? show.data.data ?? null : null;
  if (!contract) {
    const status = show.status;
    return {
      ok: false,
      status,
      error: show.data?.message || show.error || "تعذّر تحميل الطلب.",
      needsLogin: status === 401 || status === 403 || status === 404,
    };
  }

  const pendingRequests = normalizePendingDataRequests(contract.pending_data_requests);
  const request = pendingRequests.find((item) => item.id === input.requestId) ?? null;
  if (!request) {
    return {
      ok: false,
      status: 410,
      error: "تم استلام هذا الطلب مسبقاً أو لم يعد مطلوباً — شكراً لك.",
      needsLogin: false,
      alreadyResolved: true,
    };
  }

  const contractType = contract.contract_type === "commercial" ? "commercial" : "housing";
  const fullData =
    uncompleted.ok && uncompleted.data?.success && uncompleted.data.data
      ? uncompleted.data.data
      : null;

  return {
    ok: true,
    data: fullData ?? buildPartialUncompletedData(contract, contractId, uuid),
    request,
    pendingRequests,
    contractType,
    partial: fullData === null,
  };
}
