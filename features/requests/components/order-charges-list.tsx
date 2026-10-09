"use client";

import { CheckCircle2, CreditCard, LoaderCircle, Receipt } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import CreateContractOtpLoginDialog from "@/features/create-contract/components/create-contract-otp-login-dialog";
import { getChargePaymentUrl } from "@/features/requests/services/get-charge-payment-url";
import type { ContractCharge } from "@/features/requests/types/payment-state";
import { formatSar } from "@/features/requests/utils/normalize-payment-state";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export const CHARGE_LOGIN_HINT =
  "للدفع من هذا الجهاز سجّل دخولك برقم جوال الطلب (رمز تحقق)، أو ادفع من التطبيق.";

type OrderChargesListProps = {
  orderUuid: string;
  charges: ContractCharge[];
  /** Mobile typed on the track form (prefills the OTP sign-in when needed). */
  mobile?: string;
  /** Hide paid charges (e.g. on a compact card). */
  pendingOnly?: boolean;
  className?: string;
};

function formatChargeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * دفعة هـ (E5): بطاقات الرسوم الإضافية / فرق السعر على صفحة التتبّع وطلباتي —
 * «رسوم إضافية 75 ر.س — <رسالة الموظف> — ادفع». الدفع عبر
 * `GET /contracts/{uuid}/charges/{cid}/pay` ثم التحويل لميسر؛ بعد الدفع يعود
 * العميل إلى `/r/{uuid}?charge={cid}&status=success` والفاتورة تصير تراكمية.
 * المبالغ من الخادم فقط.
 */
export default function OrderChargesList({
  orderUuid,
  charges,
  mobile = "",
  pendingOnly = false,
  className,
}: OrderChargesListProps) {
  const [payingId, setPayingId] = useState<number | null>(null);
  const [loginForCharge, setLoginForCharge] = useState<ContractCharge | null>(null);

  const visible = pendingOnly ? charges.filter((charge) => charge.status === "pending") : charges;
  if (visible.length === 0) {
    return null;
  }

  async function pay(charge: ContractCharge) {
    if (payingId !== null) return;
    setPayingId(charge.id);
    try {
      const result = await getChargePaymentUrl(orderUuid, charge.id);
      if (!result.ok) {
        if (result.needsLogin) {
          toast.info(CHARGE_LOGIN_HINT);
          setLoginForCharge(charge);
          return;
        }
        toast.error(result.error);
        return;
      }

      track("charge_payment_started", {
        order_number: orderUuid,
        charge_id: charge.id,
        charge_kind: charge.kind,
        value: result.amount ?? charge.amount,
        currency: "SAR",
      });
      window.location.assign(result.paymentUrl);
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className={cn("space-y-3", className)} data-testid="order-charges">
      {visible.map((charge) => {
        const pending = charge.status === "pending";
        const paidAt = formatChargeDate(charge.paid_at);

        return (
          <article
            key={charge.id}
            data-testid={`charge-card-${charge.id}`}
            data-status={charge.status}
            className={cn(
              "rounded-2xl border p-4",
              pending
                ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
                : "border-brand/15 bg-brand-background-green dark:border-[#2f403b] dark:bg-[#12302a]",
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-extrabold",
                    pending ? "text-amber-900 dark:text-amber-200" : "text-brand dark:text-[#48c0b8]",
                  )}
                >
                  {pending ? (
                    <Receipt className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {charge.kind_label} {formatSar(charge.amount)} ر.س
                  </span>
                </p>
                {charge.message ? (
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      pending ? "text-amber-800 dark:text-amber-300" : "text-[#3f4d4a] dark:text-[#9eb5af]",
                    )}
                  >
                    {charge.message}
                  </p>
                ) : null}
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                  pending
                    ? "bg-white text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    : "bg-white text-brand dark:bg-[#1a2421] dark:text-[#48c0b8]",
                )}
              >
                {charge.status_label}
                {!pending && paidAt ? <span dir="ltr" className="ms-1 font-normal">{paidAt}</span> : null}
              </span>
            </div>

            {pending ? (
              <Button
                type="button"
                disabled={payingId !== null}
                onClick={() => void pay(charge)}
                className="mt-3 h-11 w-full rounded-full bg-brand text-sm font-bold text-white hover:bg-brand/90"
                data-testid={`charge-pay-${charge.id}`}
              >
                {payingId === charge.id ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CreditCard className="size-4" aria-hidden="true" />
                )}
                ادفع {formatSar(charge.amount)} ر.س
              </Button>
            ) : null}
          </article>
        );
      })}

      <CreateContractOtpLoginDialog
        open={loginForCharge !== null}
        onOpenChange={(open) => {
          if (!open) setLoginForCharge(null);
        }}
        initialMobile={mobile}
        onVerified={() => {
          const charge = loginForCharge;
          setLoginForCharge(null);
          if (charge) {
            void pay(charge);
          }
        }}
      />
    </div>
  );
}
