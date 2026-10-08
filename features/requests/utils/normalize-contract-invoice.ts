import type {
  ContractInvoice,
  ContractInvoiceItem,
  InvoiceStatus,
} from "@/features/requests/types/contract-invoice";

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
    };
  });
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
  };
}
