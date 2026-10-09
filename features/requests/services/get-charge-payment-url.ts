"use server";

import { apiRequest } from "@/lib/api/api-request";

type ChargePayApiResponse = {
  message?: string;
  code?: number;
  success?: boolean;
  data?: {
    payment_url?: string | null;
    amount?: number | string | null;
    message?: string | null;
    test_mode?: boolean;
    contract_uuid?: string | null;
  };
};

export type GetChargePaymentUrlResult =
  | { ok: true; paymentUrl: string; amount: number | null; testMode: boolean }
  | {
      ok: false;
      status: number;
      error: string;
      /** 401/403/404: this browser session does not own the order — sign in by OTP and retry. */
      needsLogin: boolean;
    };

/**
 * دفعة هـ (E5): رابط ميسر لدفع رسم معلّق (رسوم إضافية / فرق سعر) — المبلغ هو
 * مبلغ الرسم فقط. `GET /contracts/{uuid}/charges/{cid}/pay` يتطلب جلسة صاحب
 * الطلب (زائر أنشأه من هذا المتصفح أو مستخدم مسجّل بنفس الجوال).
 */
export async function getChargePaymentUrl(
  orderUuid: string,
  chargeId: number,
): Promise<GetChargePaymentUrlResult> {
  const safeOrder = String(orderUuid).replace(/[^0-9A-Za-z-]/g, "").slice(0, 64);
  const response = await apiRequest<ChargePayApiResponse>(
    `/contracts/${encodeURIComponent(safeOrder)}/charges/${Math.trunc(chargeId)}/pay`,
    { method: "GET", cache: "no-store" },
  );

  const paymentUrl = response.data?.data?.payment_url;
  if (response.ok && response.data?.success && paymentUrl) {
    const rawAmount = response.data.data?.amount;
    const amount =
      typeof rawAmount === "number"
        ? rawAmount
        : typeof rawAmount === "string" && rawAmount.trim() !== "" && !Number.isNaN(Number(rawAmount))
          ? Number(rawAmount)
          : null;
    return {
      ok: true,
      paymentUrl,
      amount,
      testMode: Boolean(response.data.data?.test_mode),
    };
  }

  return {
    ok: false,
    status: response.status,
    error: response.data?.message || response.error || "تعذّر إنشاء رابط الدفع. حاول مرة أخرى.",
    needsLogin: response.status === 401 || response.status === 403 || response.status === 404,
  };
}
