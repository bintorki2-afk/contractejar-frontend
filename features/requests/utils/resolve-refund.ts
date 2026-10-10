/**
 * حالة الاسترجاع للعميل (دفعة د، B2/B8) — «تم الاسترجاع» مع المبلغ.
 *
 * الحالة تُحدَّد بالمفتاح وليس بالرقم: `status` / `status_key` = `refunded`
 * (لم يعد «قيد المراجعة» حالة استرجاع). ملاحظة الخادم: `status_case` على صف
 * الحالة كائن نموذج `{key, fields}` (للمسترجع key = `return`) وليس مفتاح الحالة. المبلغ من `refund.amount` /
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
  /** Server `payment_state.refund_pending`: refund approved, money not returned yet. */
  pending?: boolean;
  pendingAmount?: number | null;
};

const REFUNDED_CASES = new Set(["refunded", "refund", "returned", "return"]);

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

  const statusCase = asRecord(row.status_case);
  const cases = [
    row.status_key,
    typeof row.status_case === "string" ? row.status_case : statusCase?.key,
    row.status,
    row.journey_status,
    row.payment_status,
  ]
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

  // QA WEB-5: «تم الاسترجاع · 0 ريال» — a zero is "no refund recorded yet",
  // never an amount to show. The server's money state (`payment_state`) wins.
  const paymentState = asRecord(row.payment_state);
  const positive = (value: unknown) => {
    const parsed = asAmount(value);
    return parsed != null && parsed > 0 ? parsed : null;
  };
  const amount =
    positive(paymentState?.refunded_total) ??
    positive(refund?.amount) ??
    positive(row.refunded_amount) ??
    positive(row.refund_amount) ??
    (refundsTotal > 0 ? refundsTotal : null);

  const refunded =
    cases.some((value) => REFUNDED_CASES.has(value)) ||
    refundState === "full" ||
    refundState === "refunded" ||
    asText(paymentState?.status) === "refunded" ||
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

  const result: RefundInfo = { refunded, partial, amount: refunded || partial ? amount : null, at };
  if (paymentState?.refund_pending === true || paymentState?.refund_pending === 1) {
    result.pending = true;
    result.pendingAmount = positive(paymentState.refund_pending_amount);
  }
  return result;
}

/** «تم استرجاع 349 ريال» / «تم الاسترجاع». */
export function formatRefundLabel(info: RefundInfo): string {
  if (info.pending && info.amount == null) {
    // QA WEB-5: approved but not yet returned — never «تم الاسترجاع».
    return info.pendingAmount != null
      ? `مسترجع — بانتظار إعادة المبلغ · ${info.pendingAmount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ريال`
      : "مسترجع — بانتظار إعادة المبلغ";
  }
  const amount =
    info.amount != null
      ? `${info.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ريال`
      : null;
  if (info.refunded) {
    return amount ? `تم الاسترجاع · ${amount}` : "تم الاسترجاع";
  }
  return amount ? `استرجاع جزئي · ${amount}` : "استرجاع جزئي";
}
