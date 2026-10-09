import type {
  ContractInvoice,
  ContractInvoiceItem,
  InvoiceStatus,
} from "@/features/requests/types/contract-invoice";
import {
  normalizeCharges,
  normalizePaymentDetails,
  normalizePaymentState,
  normalizePaymentTotals,
} from "@/features/requests/utils/normalize-payment-state";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value: unknown) {
  const valueAsString = asString(value);
  return valueAsString || null;
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

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function normalizeItems(raw: unknown): ContractInvoiceItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    const amount = asNullableNumber(row.amount);

    return {
      index:
        typeof row.index === "number" || typeof row.index === "string"
          ? row.index
          : index + 1,
      key: asNullableString(row.key),
      description: asString(row.description) || asString(row.name) || "—",
      amount,
      amount_label:
        asString(row.amount_label) ||
        (amount !== null ? String(amount) : "") ||
        asString(row.price_label) ||
        "—",
      is_discount: asBoolean(row.is_discount) || (amount !== null && amount < 0),
      kind: asNullableString(row.kind),
      charge_id: asNullableNumber(row.charge_id),
    };
  });
}

function labelOrAmount(label: unknown, amount: number | null): string {
  const text = asString(label);
  if (text) return text;
  return amount !== null ? `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ريال` : "";
}

export function normalizeContractInvoice(
  raw: Record<string, unknown>,
  fallbackContractId: number,
): ContractInvoice {
  const contractId =
    asNullableNumber(raw.contract_id) ??
    asNullableNumber(raw.order_no) ??
    asNullableNumber(raw.id) ??
    fallbackContractId;

  const status = (asNullableString(raw.status) as InvoiceStatus | null) ?? null;
  const isPaid = asBoolean(raw.is_paid) || status === "paid";
  const isRefunded =
    asBoolean(raw.is_refunded) || status === "refunded" || status === "returned";

  // دفعة هـ: التراكمي + سجل الدفعات. `payment_details` (إن وُجد) يحمل نفس
  // الحقول؛ الجذر له الأولوية لأنه ما تصنعه نقطة الفاتورة نفسها.
  const details = normalizePaymentDetails(raw.payment_details);
  const totals = raw.totals ? normalizePaymentTotals(raw.totals) : details?.totals ?? normalizePaymentTotals(null);
  const originalTotal = asNullableNumber(raw.original_total) ?? totals.original;
  const extraTotal = asNullableNumber(raw.extra_total) ?? totals.extra;
  const refundedTotal = asNullableNumber(raw.refunded_total) ?? totals.refunded;
  const netTotal = asNullableNumber(raw.net_total) ?? totals.net;
  const transactions = Array.isArray(raw.transactions)
    ? normalizePaymentDetails({ transactions: raw.transactions })?.transactions ?? []
    : details?.transactions ?? [];
  const charges = Array.isArray(raw.charges) ? normalizeCharges(raw.charges) : details?.charges ?? [];

  return {
    contractId,
    kind: asString(raw.kind) || "contract",
    platform_name: asString(raw.platform_name),
    platform_subtitle: asString(raw.platform_subtitle),
    title: asString(raw.title),
    invoice_number: asString(raw.invoice_number) || asString(raw.invoice_no),
    datetime_label: asString(raw.datetime_label),
    reference_number: asNullableString(raw.reference_number),
    customer_name: asNullableString(raw.customer_name),
    order_number: asString(raw.order_number) || String(contractId),
    contract_type_label: asString(raw.contract_type_label),
    items: normalizeItems(raw.items),
    subtotal: asNullableNumber(raw.subtotal),
    subtotal_label: asString(raw.subtotal_label),
    discount: asNullableNumber(raw.discount),
    discount_label: asString(raw.discount_label),
    coupon_code: asNullableString(raw.coupon_code),
    vat: asNullableNumber(raw.vat),
    vat_label: asString(raw.vat_label),
    total_due_label: asString(raw.total_due_label),
    total_amount_label: asString(raw.total_amount_label),
    total_amount: asNullableNumber(raw.total_amount),
    amount_mismatch: asBoolean(raw.amount_mismatch),
    status,
    status_label: asString(raw.status_label),
    status_color: asNullableString(raw.status_color),
    print_label: asString(raw.print_label),
    is_paid: isPaid,
    is_refunded: isRefunded,
    is_cumulative:
      asBoolean(raw.is_cumulative) ||
      (extraTotal ?? 0) > 0 ||
      (refundedTotal ?? 0) > 0 ||
      transactions.length > 1,
    original_total_label: labelOrAmount(raw.original_total_label, originalTotal),
    extra_total_label: labelOrAmount(raw.extra_total_label, extraTotal),
    refunded_total_label: labelOrAmount(raw.refunded_total_label, refundedTotal),
    net_total_label: labelOrAmount(raw.net_total_label, netTotal),
    totals: {
      ...totals,
      original: originalTotal,
      extra: extraTotal,
      refunded: refundedTotal,
      net: netTotal,
    },
    transactions,
    charges,
    payment_state: normalizePaymentState(raw.payment_state) ?? details?.state ?? null,
    payment_method_label: asNullableString(raw.payment_method_label),
    invoice_url: asNullableString(raw.invoice_url) ?? asNullableString(raw.print_url) ?? details?.invoice_url ?? null,
  };
}
