import type { PendingDataRequest } from "@/features/requests/types/payment-state";

/**
 * دفعة هـ (E4): يرافق استجابة `POST /contract/step1..6` عندما يكون الطلب مدفوعاً
 * ومفتوحاً للتصحيح (وضع التصحيح): الحقول المتغيّرة، طلبات المرفق الناقص التي
 * حُلّت تلقائياً، وما بقي معلّقاً.
 */
export type ContractStepFixPayload = {
  fix_mode: boolean;
  changed_fields: string[];
  resolved_request_ids: number[];
  pending_data_requests: PendingDataRequest[];
  message: string | null;
};

export function normalizeContractStepFix(raw: unknown): ContractStepFixPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const ids = Array.isArray(row.resolved_request_ids) ? row.resolved_request_ids : [];
  const fields = Array.isArray(row.changed_fields) ? row.changed_fields : [];
  return {
    fix_mode: row.fix_mode === true || row.fix_mode === 1 || row.fix_mode === "1",
    changed_fields: fields.filter((f): f is string => typeof f === "string"),
    resolved_request_ids: ids
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0),
    pending_data_requests: Array.isArray(row.pending_data_requests)
      ? (row.pending_data_requests as PendingDataRequest[])
      : [],
    message: typeof row.message === "string" && row.message.trim() ? row.message.trim() : null,
  };
}
