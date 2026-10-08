import { pushToDataLayer, track } from "@/lib/analytics/track";

export { pushToDataLayer, track };

/**
 * Fire the standard `generate_lead` conversion event (kept for the GTM tags
 * already configured on it). The new typed events live in `lib/analytics/track.ts`.
 */
export function trackLead(params: {
  orderNumber: string;
  contractType: string;
}): void {
  const leadValue = Number(process.env.NEXT_PUBLIC_LEAD_VALUE);
  const value = Number.isFinite(leadValue) && leadValue > 0 ? leadValue : undefined;

  track("generate_lead", {
    order_number: params.orderNumber,
    contract_type: params.contractType,
    currency: "SAR",
    value,
  });
}
