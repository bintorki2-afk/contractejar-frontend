import { describe, expect, it } from "vitest";

import { resolveExistingDeedImages } from "@/features/create-contract/utils/resolve-existing-deed-images";
import { buildTrackedOrderInvoice } from "@/features/requests/utils/build-tracked-order-invoice";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";

const SIGNED = (name: string) =>
  `http://localhost:8010/api/v2/contracts/294/deed-image/${name}?expires=1791588289&signature=abc`;

/** `uncompleted-contract` in fix mode (backend-ready.md): step1 + step2 carry signed image URLs. */
const STEP1 = {
  instrument_type: "electronic",
  image_instrument: SIGNED("image_instrument"),
  image_instrument_from_the_front: null,
  image_instrument_from_the_back: null,
  Image_inheritance_certificate: "",
  step: 7,
};
const STEP2 = {
  image_instrument: SIGNED("image_instrument"),
  image_address: SIGNED("image_address"),
  address_url: null,
  step: 7,
};

describe("W-1 — current deed/address images in fix mode", () => {
  it("reads the current images from the step-1/step-2 payload when there is no property context", () => {
    const images = resolveExistingDeedImages({ property: null, step1: STEP1, step2: STEP2 });
    expect(images.instrument).toBe(SIGNED("image_instrument"));
    expect(images.address).toBe(SIGNED("image_address"));
    expect(images.instrumentFront).toBeNull();
    expect(images.inheritance).toBeNull();
  });

  it("keeps the saved-property context first, then falls back to the step payload", () => {
    const images = resolveExistingDeedImages({
      property: { image_instrument: "images/property-deed.jpg", image_address: null },
      step1: STEP1,
      step2: STEP2,
    });
    expect(images.instrument).toMatch(/\/storage\/images\/property-deed\.jpg$/);
    expect(images.address).toBe(SIGNED("image_address"));
  });

  it("returns nulls when nothing is loaded (new order)", () => {
    const images = resolveExistingDeedImages({});
    expect(Object.values(images).every((value) => value === null)).toBe(true);
  });
});

const LABELS: RequestInvoiceDialogLabels = {
  close: "إغلاق",
  loading: "جاري تحميل الفاتورة...",
  retry: "إعادة المحاولة",
  loadError: "تعذر تحميل الفاتورة",
  customerLabel: "العميل",
  requestNumberLabel: "رقم الطلب",
  contractTypeLabel: "نوع العقد",
  tableIndex: "#",
  tableDescription: "الوصف",
  tableAmount: "المبلغ",
  title: "الفاتورة",
  platformName: "عقد إيجار",
  platformSubtitle: "منصة توثيق عقود الإيجار",
  printLabel: "طباعة / تحميل الفاتورة",
  totalDueLabel: "الإجمالي المستحق",
  subtotalLabel: "الإجمالي الفرعي",
  discountLabel: "الخصم",
  vatLabel: "ضريبة القيمة المضافة",
  unpaidStatusLabel: "غير مدفوعة",
  paidStatusLabel: "مدفوعة",
};

/** Real `POST /contract/track` shape (qa/api/q1-track-920011.json). */
const TRACK_PAID = {
  order_number: "920011",
  id: 301,
  uuid: "920011",
  contract_type: "housing",
  is_paid: true,
  payment_state: {
    status: "paid", status_label: "مدفوع", method: "bank_transfer", method_label: "حوالة",
    due_total: 249, paid_total: 249, outstanding: 0, refunded_total: 0, net_total: 249, refund_due: 0,
    pending_charges_count: 0, pending_charges_total: 0, label: "مدفوع · حوالة · 249 ر.س", is_paid: true,
  },
  payment_details: {
    lines: [{ key: "fee", label: "رسوم توثيق عقد إيجار سكني — سنة", amount: 249, quantity: 1, kind: "fee" }],
    transactions: [{
      id: 107, kind: "bank_transfer", kind_label: "حوالة بنكية", amount: 249, method: "bank_transfer",
      method_label: "حوالة", status: "success", status_label: "ناجحة", paid_at: "2026-10-10T01:45:09+03:00",
      reference: "QA-TRF-301", receipt_url: "http://localhost:8010/api/v2/payments/107/receipt?expires=1&signature=x",
    }],
    charges: [],
    invoice_number: "INV-301",
    invoice_url: "http://localhost:8010/api/v2/invoices/print/301?expires=1&signature=y",
    totals: { original: 249, extra: 0, refunded: 0, net: 249, due: 249, outstanding: 0, refund_due: 0 },
  },
  created_at: "2026-10-09T20:00:00+03:00",
};

describe("W-2 — invoice on /track and /r/{order} from the track payload", () => {
  it("builds the invoice (lines, totals, transactions, signed invoice_url) without calling /invoices", () => {
    const invoice = buildTrackedOrderInvoice(TRACK_PAID, { labels: LABELS, contractTypeLabel: "عقد سكني" });
    expect(invoice).not.toBeNull();
    expect(invoice?.invoice_number).toBe("INV-301");
    expect(invoice?.invoice_url).toContain("/invoices/print/301?");
    expect(invoice?.order_number).toBe("920011");
    expect(invoice?.contractId).toBe(301);
    expect(invoice?.items).toHaveLength(1);
    expect(invoice?.items[0]).toMatchObject({ description: "رسوم توثيق عقد إيجار سكني — سنة", amount: 249, kind: "fee" });
    expect(invoice?.items[0].amount_label).toBe("249 ريال");
    expect(invoice?.total_amount).toBe(249);
    expect(invoice?.total_amount_label).toBe("249 ريال");
    expect(invoice?.status).toBe("paid");
    expect(invoice?.status_label).toBe("مدفوع");
    expect(invoice?.is_paid).toBe(true);
    expect(invoice?.is_cumulative).toBe(false);
    expect(invoice?.transactions).toHaveLength(1);
    expect(invoice?.transactions[0]).toMatchObject({ kind: "bank_transfer", amount: 249, reference: "QA-TRF-301" });
    expect(invoice?.payment_state?.label).toBe("مدفوع · حوالة · 249 ر.س");
    expect(invoice?.platform_name).toBe("عقد إيجار");
    expect(invoice?.print_label).toBe("طباعة / تحميل الفاتورة");
    expect(invoice?.datetime_label).toMatch(/^10\/10\/2026, 01:45$/);
  });

  it("is cumulative after an extra fee was paid (original + extra = net)", () => {
    const invoice = buildTrackedOrderInvoice(
      {
        ...TRACK_PAID,
        payment_state: { ...TRACK_PAID.payment_state, paid_total: 384, net_total: 384, label: "مدفوع · Moyasar · 384 ر.س" },
        payment_details: {
          ...TRACK_PAID.payment_details,
          lines: [
            ...TRACK_PAID.payment_details.lines,
            { key: "extra_fee_5", label: "رسوم إضافية — رسوم إضافة وحدة ثانية", amount: 120, kind: "extra_fee", charge_id: 5 },
          ],
          transactions: [
            ...TRACK_PAID.payment_details.transactions,
            { id: 108, kind: "extra_fee", kind_label: "رسوم إضافية", amount: 120, method: "moyasar", status: "success", paid_at: "2026-10-10T01:51:00+03:00", charge_id: 5 },
          ],
          totals: { original: 264, extra: 120, refunded: 0, net: 384, due: 384, outstanding: 0, refund_due: 0 },
        },
      },
      { labels: LABELS, contractTypeLabel: "عقد سكني" },
    );
    expect(invoice?.is_cumulative).toBe(true);
    expect(invoice?.totals).toMatchObject({ original: 264, extra: 120, net: 384 });
    expect(invoice?.net_total_label).toBe("384 ريال");
    expect(invoice?.items[1]).toMatchObject({ kind: "extra_fee", charge_id: 5, amount: 120 });
    expect(invoice?.transactions).toHaveLength(2);
  });

  it("returns null when nothing was paid yet (no invoice to show) or the server omits payment_details", () => {
    expect(
      buildTrackedOrderInvoice(
        {
          ...TRACK_PAID,
          is_paid: false,
          payment_state: { ...TRACK_PAID.payment_state, status: "unpaid", paid_total: 0, is_paid: false },
          payment_details: { lines: TRACK_PAID.payment_details.lines, transactions: [], charges: [], invoice_number: null, invoice_url: null, totals: { original: 249, extra: 0, refunded: 0, net: 0, due: 249, outstanding: 249, refund_due: 0 } },
        },
        { labels: LABELS, contractTypeLabel: "عقد سكني" },
      ),
    ).toBeNull();
    expect(
      buildTrackedOrderInvoice({ ...TRACK_PAID, payment_details: undefined }, { labels: LABELS, contractTypeLabel: "عقد سكني" }),
    ).toBeNull();
  });
});
