/**
 * حالة الاسترجاع للعميل (دفعة د، B2/B8) — «تم الاسترجاع» مع المبلغ.
 *
 * الحالة تُحدَّد بالـ case وليس بالرقم: `status_case`/`status` = `refunded`
 * (لم يعد «قيد المراجعة» حالة استرجاع). المبلغ من `refund.amount` /
 * `refunded_amount` / مجموع `refunds[]`، وإلا من الفاتورة إن وُجدت.
 * استرجاع جزئي (`refund.status = partial`) لا يغيّر حالة الطلب لكنه يُعرض.
 */

export type RefundInfo = {
  /** Full refund (order status = refunded). */
  refunded: boolean;
  /** Some money returned but the order continues. */
  partial: boolean;
  amount: number | null;
  at: string | null;
};

const REFUNDED_CASES = new Set(["refunded", "refund", "returned"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : null;
}

export function resolveRefundInfo(raw: unknown): RefundInfo {
  const row = asRecord(raw) ?? {};
  const refund = asRecord(row.refund);
  const refunds = Array.isArray(row.refunds) ? row.refunds.map(asRecord).filter(Boolean) : [];

  const cases = [row.status_case, row.status, row.journey_status, row.payment_status]
    .map(asText)
    .filter((value): value is string => value !== null);
  const refundState = asText(refund?.status) ?? asText(row.refund_status);

  const succeededRefunds = refunds.filter((item) => {
    const state = asText(item?.status);
    return !state || ["succeeded", "success", "completed", "refunded", "done"].includes(state);
  });
  const refundsTotal = succeededRefunds.reduce(
    (sum, item) => sum + (asAmount(item?.amount) ?? 0),
    0,
  );

  const amount =
    asAmount(refund?.amount) ??
    asAmount(row.refunded_amount) ??
    asAmount(row.refund_amount) ??
    (refundsTotal > 0 ? refundsTotal : null);

  const refunded =
    cases.some((value) => REFUNDED_CASES.has(value)) ||
    refundState === "full" ||
    refundState === "refunded" ||
    row.is_refunded === true;

  const partial =
    !refunded && (refundState === "partial" || (amount != null && amount > 0));

  const at =
    (typeof refund?.refunded_at === "string" && refund.refunded_at) ||
    (typeof row.refunded_at === "string" && row.refunded_at) ||
    (typeof succeededRefunds.at(-1)?.created_at === "string"
      ? (succeededRefunds.at(-1)?.created_at as string)
      : null) ||
    null;

  return { refunded, partial, amount: refunded || partial ? amount : null, at };
}

/** «تم استرجاع 349 ريال» / «تم الاسترجاع». */
export function formatRefundLabel(info: RefundInfo): string {
  const amount =
    info.amount != null
      ? `${info.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ريال`
      : null;
  if (info.refunded) {
    return amount ? `تم الاسترجاع · ${amount}` : "تم الاسترجاع";
  }
  return amount ? `استرجاع جزئي · ${amount}` : "استرجاع جزئي";
}
