import { describe, expect, it } from "vitest";

import {
  extractNotificationExtras,
  formatValidUntil,
  isExpired,
  ORDER_AFFECTING_KINDS,
  resolveNotificationKind,
} from "@/features/notifications/utils/notification-kinds";
import { toAccountNotification } from "@/features/notifications/utils/to-account-notification";
import { mapContractToRequestCard } from "@/features/requests/utils/map-contract-to-request-card";
import { formatRefundLabel, resolveRefundInfo } from "@/features/requests/utils/resolve-refund";
import { isNotarized } from "@/features/track-order/utils/is-notarized";
import { isContractStatusNotification } from "@/features/requests/utils/parse-contract-status-firebase-payload";
import type { ContractListItem } from "@/features/requests/types/contract-list-item";

describe("notification kinds (item 54)", () => {
  it("classifies batch D kinds", () => {
    expect(resolveNotificationKind("refund").key).toBe("refund");
    expect(resolveNotificationKind("discount_applied").tag).toBe("خصم مطبّق");
    expect(resolveNotificationKind("offer").tone).toBe("offer");
    expect(resolveNotificationKind("announcement").key).toBe("announcement");
    expect(resolveNotificationKind("assigned").key).toBe("assigned");
    expect(resolveNotificationKind("data_missing").tone).toBe("warning");
    expect(resolveNotificationKind("order_abandoned_24h").key).toBe("reminder");
    expect(resolveNotificationKind("something_new").key).toBe("general");
    expect(resolveNotificationKind(null).key).toBe("general");
  });

  it("refund and discount refresh order views; offers do not", () => {
    expect(ORDER_AFFECTING_KINDS.has("refund")).toBe(true);
    expect(ORDER_AFFECTING_KINDS.has("discount_applied")).toBe(true);
    expect(ORDER_AFFECTING_KINDS.has("offer")).toBe(false);
  });

  it("reads coupon + validity from data or root", () => {
    expect(
      extractNotificationExtras({ data: { coupon_code: "EID50", valid_until: "2026-10-20" } }),
    ).toMatchObject({ couponCode: "EID50", validUntil: "2026-10-20" });
    expect(extractNotificationExtras({ coupon_code: "WELCOME" }).couponCode).toBe("WELCOME");
    expect(
      extractNotificationExtras({ data: { coupon: { code: "VIP", expires_at: "2026-11-01" } } }),
    ).toMatchObject({ couponCode: "VIP", validUntil: "2026-11-01" });
    expect(extractNotificationExtras({ data: '{"coupon":"STR10"}' }).couponCode).toBe("STR10");
    expect(extractNotificationExtras({ data: { amount: "349.00" } }).amount).toBe(349);
    expect(extractNotificationExtras({ data: { step: 4 } }).step).toBe(4);
  });

  it("maps an API item to the account notification model", () => {
    const item = toAccountNotification({
      id: 7,
      title: "عرض خاص",
      body: "خصم على عقدك القادم",
      kind: "offer",
      smart_link: "https://contractejar.com/r/963031",
      order_number: "963031",
      data: { coupon_code: "EID50", valid_until: "2026-10-20" },
      created_at_iso: "2026-10-09T09:00:00+03:00",
    });
    expect(item).toMatchObject({
      id: 7,
      kind: "offer",
      href: "/r/963031",
      couponCode: "EID50",
      validUntil: "2026-10-20",
      orderNumber: "963031",
      isRead: false,
    });
  });

  it("validity formatting and expiry", () => {
    expect(formatValidUntil("2026-10-20")).toContain("2026");
    expect(isExpired("2026-10-20", new Date("2026-10-21T00:00:00+03:00"))).toBe(true);
    expect(isExpired("2026-10-20", new Date("2026-10-20T12:00:00+03:00"))).toBe(false);
    expect(isExpired(null)).toBe(false);
  });
});

describe("refund state (B2/B8: by case, never by id)", () => {
  it("status refunded = full refund with amount", () => {
    const info = resolveRefundInfo({ status: "refunded", refund: { status: "full", amount: 349 } });
    expect(info).toMatchObject({ refunded: true, partial: false, amount: 349 });
    expect(formatRefundLabel(info)).toBe("تم الاسترجاع · 349 ريال");
  });

  it("status_key / status_case object (key=return) also mean refunded", () => {
    expect(resolveRefundInfo({ status_key: "refunded" }).refunded).toBe(true);
    expect(resolveRefundInfo({ status_case: { key: "return", fields: [] } }).refunded).toBe(true);
  });

  it("«قيد المراجعة» (under_review, old id 2) is NOT a refund", () => {
    expect(resolveRefundInfo({ status: "under_review", status_id: 2 }).refunded).toBe(false);
    expect(resolveRefundInfo({ status: "under_review", status_id: 2 }).partial).toBe(false);
  });

  it("partial refund keeps the order going", () => {
    const info = resolveRefundInfo({ status: "received_by_employee", refund: { status: "partial", amount: "50" } });
    expect(info).toMatchObject({ refunded: false, partial: true, amount: 50 });
    expect(formatRefundLabel(info)).toBe("استرجاع جزئي · 50 ريال");
  });

  it("sums refunds[] when no single amount", () => {
    const info = resolveRefundInfo({
      status: "refunded",
      refunds: [
        { amount: 100, status: "succeeded" },
        { amount: 49, status: "succeeded" },
        { amount: 999, status: "failed" },
      ],
    });
    expect(info.amount).toBe(149);
  });

  it("nothing → no refund", () => {
    expect(resolveRefundInfo(null)).toEqual({ refunded: false, partial: false, amount: null, at: null });
  });

  it("request card shows the refund label and no pay action", () => {
    const contract = {
      id: 1,
      uuid: "963031",
      contract_type: "housing",
      name_real_estate: null,
      property_owner_id_num: null,
      tenant_id_num: null,
      instrument_type: null,
      is_completed: true,
      is_draft: false,
      step: 7,
      contract_status_id: 11,
      contract_status_name: "مسترجع",
      contract_status_color: "#8b5cf6",
      status: "refunded",
      refund: { status: "full", amount: 349 },
      created_at: "2026-10-09",
      time_to_documentation_contract: null,
    } as unknown as ContractListItem;
    const card = mapContractToRequestCard(contract, { housing: "سكني", commercial: "تجاري" });
    expect(card.status).toBe("returned");
    expect(card.refundLabel).toBe("تم الاسترجاع · 349 ريال");
    expect(card.actionType).toBe("help-center");
  });

  it("under_review card is in progress (not returned)", () => {
    const contract = {
      id: 2,
      uuid: "963032",
      contract_type: "housing",
      is_completed: true,
      is_draft: false,
      step: 7,
      status: "under_review",
      status_label: "قيد المراجعة",
      contract_status_id: 2,
      created_at: "2026-10-09",
    } as unknown as ContractListItem;
    const card = mapContractToRequestCard(contract, { housing: "سكني", commercial: "تجاري" });
    expect(card.status).toBe("completed");
    expect(card.refundLabel).toBeNull();
  });
});

describe("rate-the-service after notarization (W5)", () => {
  it("shows after ejar_authenticated / completed", () => {
    expect(isNotarized({ status: "ejar_authenticated" })).toBe(true);
    expect(isNotarized({ status: "x", status_key: "completed" })).toBe(true);
    expect(isNotarized({ status: "whatsapp_draft", journey: [{ key: "ejar_authenticated", done: true }] })).toBe(true);
    expect(isNotarized({ status: "under_review", journey: [{ key: "ejar_authenticated", done: false }] })).toBe(false);
  });
});

describe("push payloads", () => {
  it("refund push with a status updates the order card live", () => {
    expect(isContractStatusNotification({ kind: "refund", status: "refunded", contract_id: "1" })).toBe(true);
    expect(isContractStatusNotification({ kind: "offer", status: "x" })).toBe(false);
    expect(isContractStatusNotification({ type: "contract_status_changed" })).toBe(true);
  });
});
