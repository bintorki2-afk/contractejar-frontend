import {
  normalizeJourneySideState,
  normalizeOrderJourney,
} from "@/features/requests/data/order-journey";
import {
  normalizeCharges,
  normalizePaymentState,
  normalizePendingDataRequests,
} from "@/features/requests/utils/normalize-payment-state";
import { resolveRefundInfo } from "@/features/requests/utils/resolve-refund";
import type {
  ContractDetail,
  ContractJourneyStep,
  ContractStatusSnapshot,
  ContractStatusType,
} from "@/features/requests/types/contract-journey";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }

  return null;
}

function normalizeStatusType(value: unknown): ContractStatusType {
  return value === "draft" ? "draft" : "contract";
}

export function normalizeJourneySteps(raw: unknown): ContractJourneyStep[] {
  // The API returns the 3-step journey (دفعة هـ: `label/done/current/at/by`);
  // older payloads used `status_label/state`. Both map onto the same model.
  const steps = normalizeOrderJourney(raw);
  if (!steps) {
    return [];
  }

  return steps.map((step) => ({
    key: step.key,
    status: step.key,
    status_label: step.label,
    description: step.description,
    state: step.state,
    at: step.at,
    by: step.by ?? null,
  }));
}

export function normalizeContractStatusSnapshot(
  raw: Record<string, unknown>,
  fallbackContractId?: number,
): ContractStatusSnapshot {
  const contractId =
    asNullableNumber(raw.id) ??
    asNullableNumber(raw.contract_id) ??
    fallbackContractId ??
    0;

  const statusLabel =
    asNullableString(raw.status_label) ||
    asNullableString(raw.contract_status_name) ||
    asString(raw.status);

  const statusColor =
    asNullableString(raw.status_color) ||
    asNullableString(raw.contract_status_color);

  const statusId =
    asNullableNumber(raw.status_id) ??
    asNullableNumber(raw.contract_status_id);

  return {
    contractId,
    status: asString(raw.status) || asString(raw.journey_status),
    status_label: statusLabel,
    status_type: normalizeStatusType(raw.status_type),
    status_id: statusId,
    status_color: statusColor,
    status_description: asNullableString(raw.status_description),
    journey_status: asString(raw.journey_status),
    journey_status_label:
      asNullableString(raw.journey_status_label) || statusLabel,
    journey: normalizeJourneySteps(raw.journey),
    journey_sentence: asNullableString(raw.journey_sentence),
    journey_side_state: normalizeJourneySideState(raw.journey_side_state),
  };
}

export function normalizeContractDetail(
  raw: Record<string, unknown>,
): ContractDetail {
  const snapshot = normalizeContractStatusSnapshot(raw);

  return {
    ...snapshot,
    uuid: asNullableString(raw.uuid) ?? undefined,
    refund: resolveRefundInfo(raw),
    is_completed: Boolean(raw.is_completed),
    is_draft: Boolean(raw.is_draft),
    step: asNullableNumber(raw.step) ?? undefined,
    payment_state: normalizePaymentState(raw.payment_state),
    charges: normalizeCharges(raw.charges),
    pending_data_requests: normalizePendingDataRequests(raw.pending_data_requests),
  };
}
