import type {
  ContractCharge,
  PaymentDetails,
  PaymentState,
  PaymentTotals,
  PaymentTransaction,
  PendingDataRequest,
  PendingDataRequestItem,
} from "@/features/requests/types/payment-state";

/**
 * دفعة هـ — تطبيع `payment_state` / `charges[]` / `pending_data_requests[]` /
 * `payment_details` كما يرسلها الخادم. متسامح مع الغياب (يعيد `null` أو `[]`)
 * حتى لا تتعطّل الصفحات مع خادم أقدم. لا يحسب أي مبلغ: كل الأرقام من الخادم.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function asNullableText(value: unknown): string | null {
  const text = asText(value);
  return text || null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

/** «مدفوع» / «غير مدفوع» … — fallback labels when the server sends only a status. */
const STATUS_LABELS: Record<string, string> = {
  unpaid: "غير مدفوع",
  paid: "مدفوع",
  partially_paid: "مدفوع جزئياً",
  partially_refunded: "مسترجع جزئياً",
  refunded: "مسترجع",
};

const METHOD_LABELS: Record<string, string> = {
  moyasar: "Moyasar",
  bank_transfer: "حوالة",
  mixed: "Moyasar + حوالة",
};

export function normalizePaymentState(raw: unknown): PaymentState | null {
  const row = asRecord(raw);
  if (!row) return null;

  const status = asText(row.status).toLowerCase();
  if (!status) return null;

  const method = asNullableText(row.method)?.toLowerCase() ?? null;
  const statusLabel = asText(row.status_label) || STATUS_LABELS[status] || status;
  const paidTotal = asNumber(row.paid_total);

  return {
    status,
    status_label: statusLabel,
    method,
    method_label: asNullableText(row.method_label) ?? (method ? METHOD_LABELS[method] ?? method : null),
    due_total: asNumber(row.due_total),
    paid_total: paidTotal,
    outstanding: asNumber(row.outstanding),
    refunded_total: asNumber(row.refunded_total),
    net_total: asNumber(row.net_total),
    refund_due: asNumber(row.refund_due),
    pending_charges_count: asNumber(row.pending_charges_count) ?? 0,
    pending_charges_total: asNumber(row.pending_charges_total),
    label:
      asText(row.label) ||
      [statusLabel, paidTotal != null ? `${formatSar(paidTotal)} ر.س` : null]
        .filter(Boolean)
        .join(" · "),
    is_paid: asBoolean(row.is_paid) || status === "paid",
  };
}

export function normalizeCharge(raw: unknown): ContractCharge | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  const amount = asNumber(row.amount);
  if (id == null || amount == null) return null;

  const status = asText(row.status).toLowerCase() || "pending";
  const kind = asText(row.kind).toLowerCase() || "extra_fee";

  return {
    id,
    kind,
    kind_label:
      asText(row.kind_label) || (kind === "price_difference" ? "فرق سعر" : "رسوم إضافية"),
    amount,
    message: asText(row.message) || asText(row.internal_reason),
    status,
    status_label:
      asText(row.status_label) ||
      (status === "paid" ? "مدفوعة" : status === "cancelled" ? "ملغاة" : "بانتظار الدفع"),
    payment_url: status === "pending" ? asNullableText(row.payment_url) : null,
    paid_at: asNullableText(row.paid_at),
    created_at: asNullableText(row.created_at),
  };
}

/** Cancelled charges are hidden by the server; drop them here too for safety. */
export function normalizeCharges(raw: unknown): ContractCharge[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeCharge)
    .filter((charge): charge is ContractCharge => charge !== null && charge.status !== "cancelled");
}

export function pendingCharges(charges: ContractCharge[] | null | undefined): ContractCharge[] {
  return (charges ?? []).filter((charge) => charge.status === "pending");
}

function normalizeDataRequestItem(raw: unknown): PendingDataRequestItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const label = asText(row.label) || asText(row.key);
  if (!label) return null;
  return {
    key: asText(row.key),
    label,
    step: asNumber(row.step),
    fields: Array.isArray(row.fields) ? row.fields.map(asText).filter(Boolean) : [],
  };
}

export function normalizePendingDataRequest(raw: unknown): PendingDataRequest | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asNumber(row.id);
  if (id == null) return null;

  const items = Array.isArray(row.items)
    ? row.items.map(normalizeDataRequestItem).filter((item): item is PendingDataRequestItem => item !== null)
    : [];
  const itemSteps = items.map((item) => item.step).filter((step): step is number => step != null);
  const steps = Array.isArray(row.steps)
    ? row.steps.map(asNumber).filter((step): step is number => step != null)
    : itemSteps;
  const step = asNumber(row.step) ?? steps[0] ?? itemSteps[0] ?? null;
  const note = asNullableText(row.note);
  const itemsText = items.map((item) => item.label).join("، ");

  return {
    id,
    section: asText(row.section),
    section_label: asText(row.section_label),
    items,
    note,
    requested_at: asNullableText(row.requested_at),
    step,
    steps: steps.length > 0 ? Array.from(new Set(steps)) : step != null ? [step] : [],
    deep_link: asNullableText(row.deep_link),
    banner:
      asText(row.banner) ||
      `مطلوب منك: ${itemsText || "استكمال بيانات الطلب"}${note ? ` — ${note}` : ""}`,
  };
}

export function normalizePendingDataRequests(raw: unknown): PendingDataRequest[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizePendingDataRequest)
    .filter((request): request is PendingDataRequest => request !== null);
}

function normalizeTransaction(raw: unknown): PaymentTransaction | null {
  const row = asRecord(raw);
  if (!row) return null;
  const amount = asNumber(row.amount);
  if (amount == null) return null;
  const kind = asText(row.kind).toLowerCase() || "original";
  const id = asNumber(row.id) ?? asText(row.id) ?? `${kind}-${asText(row.paid_at)}`;

  return {
    id,
    kind,
    kind_label: asText(row.kind_label) || kind,
    amount,
    method: asNullableText(row.method),
    method_label: asNullableText(row.method_label),
    status: asNullableText(row.status),
    status_label: asNullableText(row.status_label),
    paid_at: asNullableText(row.paid_at) ?? asNullableText(row.created_at),
    reference: asNullableText(row.reference),
    card_last4: asNullableText(row.card_last4),
    reason: asNullableText(row.reason),
    receipt_url: asNullableText(row.receipt_url),
    charge_id: asNumber(row.charge_id),
  };
}

export function normalizePaymentTotals(raw: unknown): PaymentTotals {
  const row = asRecord(raw) ?? {};
  return {
    original: asNumber(row.original),
    extra: asNumber(row.extra),
    refunded: asNumber(row.refunded),
    net: asNumber(row.net),
    due: asNumber(row.due),
    outstanding: asNumber(row.outstanding),
    refund_due: asNumber(row.refund_due),
  };
}

export function normalizePaymentDetails(raw: unknown): PaymentDetails | null {
  const row = asRecord(raw);
  if (!row) return null;

  return {
    transactions: Array.isArray(row.transactions)
      ? row.transactions
          .map(normalizeTransaction)
          .filter((transaction): transaction is PaymentTransaction => transaction !== null)
      : [],
    charges: normalizeCharges(row.charges),
    invoice_number: asNullableText(row.invoice_number),
    invoice_url: asNullableText(row.invoice_url) ?? asNullableText(row.print_url),
    totals: normalizePaymentTotals(row.totals),
    state: normalizePaymentState(row.state ?? row.payment_state),
  };
}

/** «1,234» — Latin digits, no decimals unless needed (display only). */
export function formatSar(amount: number): string {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export type PaymentChipTone = "neutral" | "success" | "warning" | "refund";

/** لون شريحة حالة الدفع حسب `status` (5 حالات). */
export function paymentChipTone(status: string | null | undefined): PaymentChipTone {
  switch ((status ?? "").toLowerCase()) {
    case "paid":
      return "success";
    case "partially_paid":
    case "unpaid":
      return "warning";
    case "refunded":
    case "partially_refunded":
      return "refund";
    default:
      return "neutral";
  }
}
