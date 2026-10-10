import type { MessagePayload } from "firebase/messaging";

import type { ContractLivePatch } from "@/features/requests/stores/use-contracts-live-store";
import type { ContractStatusType } from "@/features/requests/types/contract-journey";

const CONTRACT_EVENT_TYPES = new Set([
  "contract_status_changed",
  "contract_received",
]);

// Batch D notification kinds that carry the order's new status (refund →
// «مسترجع», assignment → «مستلم من الموظف»…).
const CONTRACT_EVENT_KINDS = new Set([
  "status_changed",
  "refund",
  "assigned",
  "payment_success",
  "notarized",
  // دفعة هـ: رسوم/فرق سعر وطلب مرفق ناقص تغيّر ما يراه العميل على الطلب.
  "charge_payment_request",
  "price_difference",
  "data_missing",
  "data_request_resolved",
]);

function asRecord(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, entryValue]) => entryValue != null,
  );

  return Object.fromEntries(
    entries.map(([key, entryValue]) => [key, String(entryValue)]),
  );
}

export function isContractStatusNotification(
  data: Record<string, string> | null | undefined,
) {
  if (!data) {
    return false;
  }

  return (
    CONTRACT_EVENT_TYPES.has(data.type) ||
    (CONTRACT_EVENT_KINDS.has(data.kind) && Boolean(data.status || data.status_label))
  );
}

export function parseContractStatusFirebasePayload(
  payload: MessagePayload,
): ContractLivePatch | null {
  const data = asRecord(payload.data);

  if (!data || !isContractStatusNotification(data)) {
    return null;
  }

  const contractId = Number(data.contract_id);

  if (!Number.isFinite(contractId) || contractId <= 0) {
    return null;
  }

  const statusType: ContractStatusType | undefined =
    data.status_type === "draft"
      ? "draft"
      : data.status_type === "contract"
        ? "contract"
        : undefined;

  const statusIdRaw = data.status_id;
  const statusId =
    statusIdRaw != null && statusIdRaw !== ""
      ? Number(statusIdRaw)
      : undefined;

  return {
    contractId,
    status: data.status,
    status_label: data.status_label,
    status_type: statusType,
    status_id:
      statusId != null && Number.isFinite(statusId) ? statusId : undefined,
    status_color: data.status_color,
    status_description: data.status_description,
    journey_status: data.journey_status,
    journey_status_label: data.journey_status_label,
  };
}
