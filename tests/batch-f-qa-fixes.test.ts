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

import { EMPTY_UNIT_DATA } from "@/features/create-unit/types/unit-data";
import { buildUnitFieldsPayload } from "@/features/create-unit/utils/build-unit-api-payload";
import { appendPropertyStep1Fields } from "@/features/create-property/utils/build-property-step1-form-data";
import { fileNameFromUrl } from "@/features/shared/utils/attachment-preview-actions";
import { sourceLinkRel } from "@/features/blog/components/blog-detail-sources";

describe("PROPS-14 / ORDERS-RES-9 / ORDERS-COM-2 — unit payload", () => {
  const unit = {
    ...EMPTY_UNIT_DATA,
    unitTypeId: "1",
    unitUsageId: "2",
    totalArea: "120",
    floorNumber: "1",
    unitNumber: "A1",
  };

  it("sends untouched counters as 0 instead of dropping them (saved as NULL)", () => {
    const payload = buildUnitFieldsPayload(unit);
    expect(payload.tootal_rooms).toBe(0);
    expect(payload.The_number_of_toilets).toBe(0);
    expect(payload.The_number_of_kitchens).toBe(0);
    expect(payload.window_ac).toBe(0);
    expect(payload.split_ac).toBe(0);
  });

  it("keeps «مؤثثة» even when new/used was not chosen", () => {
    const payload = buildUnitFieldsPayload({ ...unit, furnished: true, furnishingType: "" });
    expect(payload.furnished).toBe(true);
    expect("type_furnished" in payload).toBe(false);
    expect(buildUnitFieldsPayload({ ...unit, furnished: true, furnishingType: "new" }).type_furnished).toBe(true);
  });
});

describe("PROPS-5 / PROPS-6 — property step 1 form data", () => {
  const base = { instrumentType: "electronic", addressMethod: "link", addressUrl: "https://maps.google.com/?q=21.3891,39.8579" } as const;

  it("sends contract_type and never the Riyadh placeholder coordinates", () => {
    const formData = new FormData();
    appendPropertyStep1Fields(formData, { ...base, latitude: 24.7136, longitude: 46.6753, contractType: "commercial" } as never);
    expect(formData.get("contract_type")).toBe("commercial");
    expect(formData.has("latitude")).toBe(false);
    expect(formData.has("longitude")).toBe(false);
    expect(formData.get("address_url")).toBe(base.addressUrl);
  });

  it("sends a real pin", () => {
    const formData = new FormData();
    appendPropertyStep1Fields(formData, { ...base, latitude: 21.4858, longitude: 39.1925 } as never);
    expect(formData.get("latitude")).toBe("21.4858");
    expect(formData.has("contract_type")).toBe(false);
  });
});

describe("PROPS-20 — attachment names", () => {
  it("hides the field key of a signed backend link", () => {
    expect(fileNameFromUrl("http://x/api/v2/real-estates/14/deed-image/image_instrument?expires=1&signature=a")).toBe("");
  });
  it("keeps a real file name", () => {
    expect(fileNameFromUrl("http://x/storage/deeds/deed-123.pdf")).toBe("deed-123.pdf");
  });
});

describe("WEB-21 — blog sources rel", () => {
  it("nofollows non-government domains only", () => {
    expect(sourceLinkRel("https://ejari.sa/x")).toContain("nofollow");
    expect(sourceLinkRel("https://www.ejar.sa/x")).toContain("nofollow");
    expect(sourceLinkRel("https://moj.gov.sa/x")).not.toContain("nofollow");
  });
});

import { normalizeContractStepFix, pickFixMessage } from "@/features/create-contract/types/contract-fix-api";

describe("APP-7 / W-10 (website side) — fix outcome message", () => {
  it("prefers what is still missing, then resolved, over a plain save", () => {
    const saved = normalizeContractStepFix({ fix_mode: true, changed_fields: ["x"], resolved_request_ids: [], result: "saved", message: "تم حفظ تعديلك وإبلاغ الموظف." })!;
    const partial = normalizeContractStepFix({ fix_mode: true, changed_fields: ["y"], resolved_request_ids: [], result: "partial", remaining_items: ["صورة الوكالة"], message: "استلمنا جزءاً من المطلوب — بقي: صورة الوكالة." })!;
    const resolved = normalizeContractStepFix({ fix_mode: true, changed_fields: ["z"], resolved_request_ids: [3], result: "resolved", message: "تم الإرسال — سيراجعها الموظف." })!;
    expect(pickFixMessage([saved, partial])).toBe(partial.message);
    expect(pickFixMessage([saved, resolved])).toBe(resolved.message);
    expect(partial.remaining_items).toEqual(["صورة الوكالة"]);
  });
});

import { normalizeContractInvoice } from "@/features/requests/utils/normalize-contract-invoice";

describe("WEB-26 — server invoice («طلباتي») bottom line", () => {
  it("shows the due total while a charge is outstanding", () => {
    const invoice = normalizeContractInvoice(
      { contract_id: 318, total_amount: 2149, total_amount_label: "2,149 ريال", due_total: 2224, due_total_label: "2,224 ريال", outstanding: 75, has_outstanding: true },
      318,
    );
    expect(invoice.total_amount).toBe(2224);
    expect(invoice.total_amount_label).toBe("2,224 ريال");
  });

  it("keeps total_amount when nothing is outstanding", () => {
    const invoice = normalizeContractInvoice({ contract_id: 1, total_amount: 349, total_amount_label: "349 ريال", due_total: 349, outstanding: 0 }, 1);
    expect(invoice.total_amount).toBe(349);
    expect(invoice.total_amount_label).toBe("349 ريال");
  });
});

import { normalizeOrderJourney } from "@/features/requests/data/order-journey";

describe("second pass — server fields from needs-frontend", () => {
  it("WEB-5: refund_pending reads «بانتظار إعادة المبلغ», never «تم الاسترجاع»", () => {
    const info = resolveRefundInfo({
      status: "refunded",
      payment_state: { status: "paid", refunded_total: 0, refund_pending: true, refund_pending_amount: 5047 },
      refund: { status: "none", amount: 0 },
    });
    expect(info.pending).toBe(true);
    expect(formatRefundLabel(info)).toBe("مسترجع — بانتظار إعادة المبلغ · 5,047 ريال");
  });

  it("ORDERS-RES-13: an unpaid order's current step reads «بانتظار الدفع»", () => {
    const steps = normalizeOrderJourney([
      { step: 1, key: "under_review", label: "قيد المراجعة", description: "تم استلام دفعتك وطلبك قيد المراجعة.", done: false, current: true, awaiting_payment: true, current_label: "بانتظار الدفع" },
      { step: 2, key: "received_by_employee", label: "مستلم من الموظف", done: false, current: false },
      { step: 3, key: "ejar_authenticated", label: "تم التوثيق", done: false, current: false },
    ]);
    expect(steps?.[0].label).toBe("بانتظار الدفع");
    expect(steps?.[0].description).not.toMatch(/استلام دفعتك/);
    expect(steps?.[0].awaitingPayment).toBe(true);
  });
});
