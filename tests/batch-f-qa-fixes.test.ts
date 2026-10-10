import { describe, expect, it } from "vitest";

import { buildTrackedOrderInvoice } from "@/features/requests/utils/build-tracked-order-invoice";
import { formatRefundLabel, resolveRefundInfo } from "@/features/requests/utils/resolve-refund";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";
import { formatArDateTime } from "@/lib/utils/date-format";

const LABELS = {
  title: "الفاتورة",
  platformName: "عقدي",
  platformSubtitle: "منصة توثيق عقود الإيجار",
  printLabel: "طباعة / تحميل الفاتورة",
  totalDueLabel: "الإجمالي المستحق",
  unpaidStatusLabel: "غير مدفوعة",
  paidStatusLabel: "مدفوعة",
} as unknown as RequestInvoiceDialogLabels;

/** Real `POST /contract/track` shapes from qa100/WEB/out. */
const UNPAID_116001 = {
  order_number: "116001",
  id: 297,
  contract_type: "housing",
  payment_state: {
    status: "unpaid", status_label: "غير مدفوع", due_total: 249, original_due: 249, extra_due: 0,
    paid_total: 0, outstanding: 249, refunded_total: 0, net_total: 0, label: "غير مدفوع · 249 ر.س", is_paid: false,
  },
  payment_details: {
    lines: [{ key: "fee", label: "رسوم توثيق عقد إيجار سكني — سنة", amount: 249, quantity: 1, kind: "fee" }],
    transactions: [],
    charges: [],
    invoice_number: null,
    invoice_url: "http://localhost:8012/api/v2/invoices/print/297?expires=1&signature=x",
    totals: { original: 0, extra: 0, refunded: 0, net: 0, due: 249, outstanding: 249, refund_due: 0 },
  },
};

const PARTIAL_851818 = {
  order_number: "851818",
  id: 318,
  contract_type: "housing",
  payment_state: {
    status: "partially_paid", status_label: "مدفوع جزئياً", method: "moyasar", method_label: "Moyasar",
    due_total: 2224, paid_total: 2149, outstanding: 75, refunded_total: 0, net_total: 2149, is_paid: false,
    label: "مدفوع جزئياً · 2149 من 2224 ر.س",
  },
  payment_details: {
    lines: [{ key: "fee", label: "رسوم توثيق", amount: 2149, quantity: 1, kind: "fee" }],
    transactions: [{ id: 1, kind: "original", amount: 2149, method: "moyasar", status: "success", paid_at: "2026-10-10T05:00:00+03:00" }],
    charges: [],
    invoice_number: "INV-318",
    invoice_url: "http://localhost:8012/api/v2/invoices/print/318?expires=1&signature=x",
    totals: { original: 2149, extra: 0, refunded: 0, net: 2149, due: 2224, outstanding: 75, refund_due: 0 },
  },
};

describe("WEB-26 / ORDERS-RES-5 — tracked invoice", () => {
  it("shows no invoice for an unpaid order even though the server signs an invoice_url", () => {
    expect(buildTrackedOrderInvoice(UNPAID_116001, { labels: LABELS, contractTypeLabel: "عقد سكني" })).toBeNull();
  });

  it("«الإجمالي المستحق» is the server's due total while money is outstanding", () => {
    const invoice = buildTrackedOrderInvoice(PARTIAL_851818, { labels: LABELS, contractTypeLabel: "عقد سكني" });
    expect(invoice?.total_amount).toBe(2224);
    expect(invoice?.total_amount_label).toBe("2,224 ريال");
  });
});

describe("WEB-5 — refunded order without a recorded refund amount", () => {
  const REFUNDED_832510 = {
    status: "refunded",
    payment_state: { status: "paid", paid_total: 5047, refunded_total: 0, refund_due: 5047 },
    refund: { status: "none", amount: 0, refunded_at: null },
    refunded_amount: 0,
  };

  it("never shows «0 ريال» as the refunded amount", () => {
    const info = resolveRefundInfo(REFUNDED_832510);
    expect(info.refunded).toBe(true);
    expect(info.amount).toBeNull();
    expect(formatRefundLabel(info)).toBe("تم الاسترجاع");
  });

  it("prefers the server money state (payment_state.refunded_total)", () => {
    const info = resolveRefundInfo({
      ...REFUNDED_832510,
      payment_state: { status: "refunded", refunded_total: 349 },
    });
    expect(info.amount).toBe(349);
    expect(formatRefundLabel(info)).toBe("تم الاسترجاع · 349 ريال");
  });
});

describe("WEB-3 / WEB-4 — one Gregorian, Latin-digit date format", () => {
  it("formats in the Gregorian calendar with Latin digits (no Hijri month names)", () => {
    const label = formatArDateTime("2026-10-10T05:35:00+03:00");
    expect(label).toMatch(/2026/);
    expect(label).toMatch(/10/);
    expect(label).not.toMatch(/[٠-٩]/);
    expect(label).not.toMatch(/ربيع|هـ/);
  });

  it("returns an empty string for missing or invalid input", () => {
    expect(formatArDateTime(null)).toBe("");
    expect(formatArDateTime("not-a-date")).toBe("");
  });
});
