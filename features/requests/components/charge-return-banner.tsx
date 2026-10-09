"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";

import type { ContractCharge } from "@/features/requests/types/payment-state";
import { formatSar } from "@/features/requests/utils/normalize-payment-state";
import { trackChargePurchaseOnce } from "@/lib/analytics/track";

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

type ChargeReturnBannerProps = {
  orderUuid: string;
  chargeReturn: ChargeReturn;
  /** The charge as the server now reports it (after the lookup) — may be null while loading. */
  charge: ContractCharge | null;
};

/**
 * دفعة هـ (E5): نتيجة العودة من ميسر بعد دفع رسم معلّق — نجاح (الفاتورة
 * محدّثة) أو فشل (الرسم ما زال بانتظار الدفع). يطلق `charge_purchase` مرة
 * واحدة عند النجاح المؤكّد من الخادم (الرسم `paid`).
 */
export default function ChargeReturnBanner({ orderUuid, chargeReturn, charge }: ChargeReturnBannerProps) {
  const serverPaid = charge?.status === "paid";
  const success = chargeReturn.status === "success" && chargeReturn.paid;

  useEffect(() => {
    if (!success || !serverPaid || !charge) {
      return;
    }
    trackChargePurchaseOnce({
      transaction_id: chargeTransactionId(orderUuid, charge.id),
      order_number: orderUuid,
      charge_id: charge.id,
      charge_kind: charge.kind,
      value: charge.amount,
      currency: "SAR",
    });
  }, [success, serverPaid, charge, orderUuid]);

  if (success) {
    return (
      <div
        role="status"
        data-testid="charge-return-success"
        className="flex items-start gap-2.5 rounded-2xl border border-brand/20 bg-brand-background-green p-4 dark:border-[#2f403b] dark:bg-[#12302a]"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand dark:text-[#48c0b8]" aria-hidden="true" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-extrabold text-brand dark:text-[#48c0b8]">
            تم دفع {charge ? `${charge.kind_label} ${formatSar(charge.amount)} ر.س` : "الرسوم"} بنجاح ✅
          </p>
          <p className="text-xs leading-relaxed text-[#3f4d4a] dark:text-[#9eb5af]">
            {serverPaid
              ? "تم تحديث فاتورتك لتشمل هذا المبلغ، وسيكمل موظفنا توثيق العقد."
              : "نؤكد الدفع مع البوابة الآن — حدّث الصفحة بعد لحظات إن لم تتغيّر حالة الرسم."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      data-testid="charge-return-failed"
      className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30"
    >
      <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-extrabold text-red-700 dark:text-red-200">لم يكتمل دفع الرسوم</p>
        <p className="text-xs leading-relaxed text-red-700/90 dark:text-red-300">
          {serverPaid
            ? "لكن الخادم يؤكد أن الرسم مدفوع — لا حاجة لإعادة الدفع."
            : "لم يُخصم أي مبلغ. تقدر تعيد المحاولة من بطاقة الرسوم أدناه."}
        </p>
      </div>
    </div>
  );
}
