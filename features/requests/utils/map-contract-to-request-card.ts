import type {
  RequestActionType,
  RequestCardData,
  RequestStatus,
} from "@/features/requests/types/request";
import type { ContractListItem } from "@/features/requests/types/contract-list-item";
import { normalizeContractStatusSnapshot } from "@/features/requests/utils/normalize-contract-status";
import {
  normalizeCharges,
  normalizePaymentState,
  normalizePendingDataRequests,
} from "@/features/requests/utils/normalize-payment-state";
import { formatRefundLabel, resolveRefundInfo } from "@/features/requests/utils/resolve-refund";

type ContractCardLabels = {
  housing: string;
  commercial: string;
};

function formatContractDate(isoDate: string) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function formatLastUpdated(isoDate: string) {
  // A date-only value («2026-10-08») has no time: showing one invented a
  // misleading «03:00 ص» on every card.
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate.replaceAll("-", "/");
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  // Riyadh time regardless of the server's time zone (this runs on the server).
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  let hours = Number(parts.hour) % 24;
  const period = hours >= 12 ? "م" : "ص";
  hours = hours % 12 || 12;

  return `${parts.year}/${parts.month}/${parts.day} · ${String(hours).padStart(2, "0")}:${parts.minute} ${period}`;
}

/** Latest real update: the newest status-timeline entry, else the creation date. */
function resolveLastUpdatedSource(contract: ContractListItem): string {
  const timeline = (contract as { status_timeline?: Array<{ created_at?: string | null }> })
    .status_timeline;
  const latest = (timeline ?? [])
    .map((entry) => entry?.created_at)
    .filter((value): value is string => typeof value === "string" && value.length > 10)
    .sort()
    .pop();
  return latest ?? contract.created_at;
}

function resolveStatus(contract: ContractListItem): RequestStatus {
  // Batch D: refund is a status *case* (`refunded`), never an id — and
  // «قيد المراجعة» is no longer a refund state.
  if (resolveRefundInfo(contract).refunded) {
    return "returned";
  }

  if (contract.is_completed) {
    return "completed";
  }

  if (contract.is_draft || contract.step < 3) {
    return "incomplete";
  }

  const statusText =
    contract.status_label || contract.contract_status_name || "";

  // Older API without `status_key`: the refund row's Arabic name.
  if (statusText.includes("مرتجع") || statusText.includes("مسترجع")) {
    return "returned";
  }

  return "in-progress";
}

function resolveActionType(
  contract: ContractListItem,
  status: RequestStatus,
): RequestActionType {
  // A refunded order is closed: never offer «أكمل الدفع».
  if (status === "returned") {
    return "help-center";
  }

  if (!contract.is_completed && contract.step !== 7) {
    return "none";
  }

  if (contract.step === 7) {
    return contract.is_completed ? "dual-actions" : "complete-payment";
  }

  if (status === "completed") {
    return "help-center";
  }

  return "dual-actions";
}

function resolvePayableAmount(contract: ContractListItem): number | null {
  const candidates = [
    contract.total_price,
    contract.payable_amount,
    contract.amount,
    contract.doc_fee,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

export function mapContractToRequestCard(
  contract: ContractListItem,
  labels: ContractCardLabels,
): RequestCardData {
  const status = resolveStatus(contract);
  const refund = resolveRefundInfo(contract);
  const contractType =
    contract.contract_type === "commercial" ? "commercial" : "residential";
  const requestNumber = String(contract.uuid);
  const snapshot = normalizeContractStatusSnapshot(
    contract as unknown as Record<string, unknown>,
    contract.id,
  );

  const actionType = resolveActionType(contract, status);
  // #29: only treat a contract as an incomplete draft (showing the "complete
  // your data" prompt) when the backend actually marks it a draft. A paid or
  // in-progress/completed contract must never surface that banner.
  const isIncompleteDraft =
    contract.is_draft && !contract.is_completed && contract.step !== 7;

  return {
    id: String(contract.id),
    contractId: contract.id,
    contractType,
    uuid: contract.uuid,
    title:
      contract.name_real_estate?.trim() ||
      (contractType === "commercial" ? labels.commercial : labels.housing),
    date: formatContractDate(contract.created_at),
    lastUpdated: formatLastUpdated(resolveLastUpdatedSource(contract)),
    requestNumber,
    step: contract.step,
    status,
    statusName: snapshot.status_label || null,
    statusColor: snapshot.status_color || null,
    statusType: snapshot.status_type,
    statusCode: snapshot.status || null,
    journeyStatus: snapshot.journey_status || null,
    journeyStatusLabel: snapshot.journey_status_label || null,
    paymentSuccessful: contract.is_completed,
    refundLabel: refund.refunded || refund.partial ? formatRefundLabel(refund) : null,
    paymentStatusLabel:
      snapshot.journey_status_label || snapshot.status_label || null,
    payableAmount: resolvePayableAmount(contract),
    paymentState: normalizePaymentState(contract.payment_state),
    charges: normalizeCharges(contract.charges),
    pendingDataRequests: normalizePendingDataRequests(contract.pending_data_requests),
    isIncompleteDraft,
    showViewEdit: contract.step !== 7,
    showDownloadInvoice: !isIncompleteDraft,
    actionType,
    searchText: [
      requestNumber,
      contract.uuid,
      contract.name_real_estate,
      contract.property_owner_id_num,
      contract.tenant_id_num,
      snapshot.status_label,
      snapshot.journey_status_label,
      contract.contract_status_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}
