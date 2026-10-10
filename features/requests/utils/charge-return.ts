/** دفعة هـ (E5): العودة من ميسر بعد دفع رسم — تحليل الرابط (خادم + عميل). */

export type ChargeReturn = {
  chargeId: number;
  status: "success" | "failed" | string;
  paid: boolean;
};

/** `/r/{uuid}?charge={cid}&status=success|failed&paid=1|0` → typed return info (or `null`). */
export function parseChargeReturn(params: {
  charge?: string | string[] | null;
  status?: string | string[] | null;
  paid?: string | string[] | null;
}): ChargeReturn | null {
  const first = (value: string | string[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const chargeId = Number(first(params.charge));
  if (!Number.isFinite(chargeId) || chargeId <= 0) {
    return null;
  }
  const status = (first(params.status) ?? "").toLowerCase();
  const paidFlag = first(params.paid);
  const paid = paidFlag === "1" || paidFlag === "true" || (paidFlag == null && status === "success");
  return {
    chargeId: Math.trunc(chargeId),
    status: status === "success" || status === "failed" ? status : paid ? "success" : "failed",
    paid,
  };
}

/** `chg-{order}-{charge}` — the Moyasar invoice key the backend uses for charges. */
export function chargeTransactionId(orderUuid: string, chargeId: number): string {
  return `chg-${orderUuid}-${chargeId}`;
}

