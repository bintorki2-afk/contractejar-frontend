import type { AnalyticsEventMap, ContractTypeParam } from "@/lib/analytics/track";

/**
 * معاملات حدث `purchase` (تحويل الشراء الرئيسي في Google Ads / TikTok).
 *
 * - `transaction_id` = رقم الطلب (يمنع Google Ads من عدّ التحويل مرتين).
 * - `value` = المبلغ المدفوع كما أكّده الخادم (رقم بالريال، بدون ضريبة حالياً).
 * - `currency` = "SAR" دائماً.
 *
 * دالة نقية حتى تُختبر (`tests/purchase-event.test.ts`).
 */
export function buildPurchaseEvent(
  orderNumber: string | number,
  status: {
    paidAmount?: number | null;
    kind?: string | null;
    contractType?: string | null;
  } | null | undefined,
): AnalyticsEventMap["purchase"] {
  const amount = status?.paidAmount;
  const value =
    typeof amount === "number" && Number.isFinite(amount) && amount > 0
      ? Math.round(amount * 100) / 100
      : undefined;

  let contractType: ContractTypeParam = "housing";
  if (status?.kind === "lessor_change") {
    contractType = "lessor_change";
  } else if (status?.contractType?.toLowerCase() === "commercial") {
    contractType = "commercial";
  }

  return {
    transaction_id: String(orderNumber),
    value,
    currency: "SAR",
    contract_type: contractType,
  };
}
