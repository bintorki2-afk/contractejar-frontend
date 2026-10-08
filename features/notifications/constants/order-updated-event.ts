/**
 * Fired on `window` when a push notification changes an order (refund,
 * discount, status, assignment…): order views re-fetch (batch D, item 53).
 * `detail`: `{ contractId?: number; orderNumber?: string; kind: string }`.
 */
export const ORDER_UPDATED_EVENT = "contractejar:order-updated";

export type OrderUpdatedDetail = {
  contractId?: number;
  orderNumber?: string;
  kind: string;
};
