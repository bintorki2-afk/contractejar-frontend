import { describe, expect, it } from "vitest";

import { normalizeContractStepFix } from "@/features/create-contract/types/contract-fix-api";
import {
  backendStepsForWizardStep,
  fixWizardStepFor,
} from "@/features/create-contract/types/contract-fix-mode";
import { parseChargeReturn, chargeTransactionId } from "@/features/requests/components/charge-return-banner";
import { buildFixHref } from "@/features/requests/components/data-request-banner";
import {
  normalizeCharges,
  normalizePaymentDetails,
  normalizePaymentState,
  normalizePendingDataRequests,
  paymentChipTone,
  pendingCharges,
} from "@/features/requests/utils/normalize-payment-state";
import { normalizeContractInvoice } from "@/features/requests/utils/normalize-contract-invoice";
import { parseFixParam, parseStepParam } from "@/features/requests/utils/parse-fix-param";

/** Real shapes from the batch E backend (`backend-ready.md`). */
const PAID = {
  status: "paid", status_label: "مدفوع", method: "moyasar", method_label: "Moyasar",
  due_total: 264, paid_total: 264, outstanding: 0, refunded_total: 0, net_total: 264, refund_due: 0,
  pending_charges_count: 0, pending_charges_total: 0, label: "مدفوع · Moyasar · 264 ر.س", is_paid: true,
};

describe("payment_state chip mapping (دفعة هـ — 5 states)", () => {
  it("keeps the server label and maps each status to a chip tone", () => {
    const paid = normalizePaymentState(PAID);
    expect(paid?.label).toBe("مدفوع · Moyasar · 264 ر.س");
    expect(paymentChipTone(paid?.status)).toBe("success");

    expect(paymentChipTone("unpaid")).toBe("warning");
    expect(paymentChipTone("partially_paid")).toBe("warning");
    expect(paymentChipTone("partially_refunded")).toBe("refund");
    expect(paymentChipTone("refunded")).toBe("refund");
    expect(paymentChipTone(undefined)).toBe("neutral");
  });

  it("bank transfer and partial payment keep the server numbers (no client math)", () => {
    const transfer = normalizePaymentState({ ...PAID, method: "bank_transfer", method_label: "حوالة", label: "مدفوع · حوالة · 264 ر.س" });
    expect(transfer?.method).toBe("bank_transfer");
    expect(transfer?.label).toBe("مدفوع · حوالة · 264 ر.س");

    const partial = normalizePaymentState({
      status: "partially_paid", status_label: "مدفوع جزئياً", method: "moyasar", method_label: "Moyasar",
      due_total: 324, paid_total: 249, outstanding: 75, refunded_total: 0, net_total: 249, refund_due: 0,
      pending_charges_count: 1, pending_charges_total: 75, label: "مدفوع جزئياً · 249 من 324 ر.س", is_paid: false,
    });
    expect(partial).toMatchObject({ outstanding: 75, pending_charges_count: 1, pending_charges_total: 75, is_paid: false });
  });

  it("tolerates a missing or partial payload (older backend)", () => {
    expect(normalizePaymentState(undefined)).toBeNull();
    expect(normalizePaymentState({})).toBeNull();
    const minimal = normalizePaymentState({ status: "unpaid", paid_total: 0 });
    expect(minimal?.status_label).toBe("غير مدفوع");
    expect(minimal?.label).toBe("غير مدفوع · 0 ر.س");
  });
});

describe("charge card states (E5)", () => {
  const raw = [
    { id: 6, kind: "price_difference", kind_label: "فرق سعر", amount: 75, message: "تغيير نوع المستند: إلكتروني → ورقي", status: "pending", status_label: "بانتظار الدفع", payment_url: "http://localhost:8010/api/v2/contracts/920018/charges/6/pay", paid_at: null, created_at: "2026-10-09T22:02:37+03:00" },
    { id: 1, kind: "extra_fee", kind_label: "رسوم إضافية", amount: 120, message: "رسوم إضافة وحدة ثانية في إيجار", status: "paid", status_label: "مدفوعة", payment_url: null, paid_at: "2026-10-09T21:59:02+03:00", created_at: "2026-10-09T21:55:36+03:00" },
    { id: 9, kind: "extra_fee", amount: 10, message: "x", status: "cancelled" },
    { id: "bad" },
  ];

  it("keeps pending + paid charges, hides cancelled and invalid rows", () => {
    const charges = normalizeCharges(raw);
    expect(charges.map((c) => c.id)).toEqual([6, 1]);
    expect(pendingCharges(charges).map((c) => c.id)).toEqual([6]);
    expect(charges[0]).toMatchObject({ kind: "price_difference", amount: 75, status: "pending" });
    expect(charges[0].payment_url).toContain("/charges/6/pay");
    expect(charges[1]).toMatchObject({ status: "paid", payment_url: null, paid_at: "2026-10-09T21:59:02+03:00" });
  });

  it("derives labels when the server sends only kind/status", () => {
    const [charge] = normalizeCharges([{ id: 2, kind: "extra_fee", amount: 50, message: "m", status: "pending" }]);
    expect(charge.kind_label).toBe("رسوم إضافية");
    expect(charge.status_label).toBe("بانتظار الدفع");
  });

  it("parses the Moyasar return URL and builds the charge transaction id", () => {
    expect(parseChargeReturn({ charge: "6", status: "success", paid: "1" })).toEqual({ chargeId: 6, status: "success", paid: true });
    expect(parseChargeReturn({ charge: "6", status: "failed", paid: "0" })).toEqual({ chargeId: 6, status: "failed", paid: false });
    expect(parseChargeReturn({ charge: ["6"], status: "success" })).toEqual({ chargeId: 6, status: "success", paid: true });
    expect(parseChargeReturn({ charge: "abc" })).toBeNull();
    expect(parseChargeReturn({})).toBeNull();
    expect(chargeTransactionId("920018", 6)).toBe("chg-920018-6");
  });

  it("invoice becomes cumulative: original + extra − refunded = net, transactions listed", () => {
    const invoice = normalizeContractInvoice(
      {
        invoice_number: "INV-297", order_number: "#920005", items: [
          { index: 1, key: "fee", description: "رسوم توثيق", amount: 264, amount_label: "264 ريال" },
          { index: 2, key: "extra_fee_1", description: "رسوم إضافية — رسوم إضافة وحدة ثانية في إيجار", amount: 120, amount_label: "120 ريال", kind: "extra_fee", charge_id: 1 },
        ],
        total_amount: 384, total_amount_label: "384 ريال", status: "paid", status_label: "مدفوعة",
        original_total: 264, original_total_label: "264 ريال", extra_total: 120, extra_total_label: "120 ريال",
        refunded_total: 0, net_total: 384, net_total_label: "384 ريال", is_cumulative: true,
        transactions: [
          { id: 91, kind: "original", kind_label: "الدفعة الأصلية", amount: 264, method: "moyasar", method_label: "Moyasar", status: "success", status_label: "ناجحة", paid_at: "2026-10-07T21:55:36+03:00" },
          { id: 97, kind: "extra_fee", kind_label: "رسوم إضافية", amount: 120, method: "moyasar", method_label: "Moyasar", status: "success", status_label: "ناجحة", paid_at: "2026-10-09T21:59:02+03:00", charge_id: 1 },
        ],
        totals: { original: 264, extra: 120, refunded: 0, net: 384, due: 384, outstanding: 0, refund_due: 0 },
        payment_state: PAID,
        invoice_url: "http://localhost:8010/api/v2/invoices/print/297?expires=1&signature=s",
      },
      297,
    );
    expect(invoice.is_cumulative).toBe(true);
    expect(invoice.totals).toMatchObject({ original: 264, extra: 120, refunded: 0, net: 384 });
    expect(invoice.net_total_label).toBe("384 ريال");
    expect(invoice.transactions.map((t) => t.kind)).toEqual(["original", "extra_fee"]);
    expect(invoice.items[1]).toMatchObject({ kind: "extra_fee", charge_id: 1 });
    expect(invoice.payment_state?.label).toBe("مدفوع · Moyasar · 264 ر.س");
    expect(invoice.invoice_url).toContain("/invoices/print/297");
  });

  it("a plain single-payment invoice is not cumulative and still normalizes", () => {
    const invoice = normalizeContractInvoice({ items: [], total_amount: 249, transactions: [{ id: 1, kind: "original", amount: 249 }] }, 1);
    expect(invoice.is_cumulative).toBe(false);
    expect(invoice.transactions).toHaveLength(1);
    expect(normalizePaymentDetails(null)).toBeNull();
  });
});

describe("data requests + fix deep-link routing (E4)", () => {
  const request = {
    id: 3, section: "property", section_label: "العقار والعنوان",
    items: [{ key: "deed_image_unclear", label: "صورة الصك غير واضحة", step: 1, fields: ["image_instrument"] }],
    note: "الصورة مقصوصة من الأسفل", requested_at: "2026-10-08T16:02:37+03:00", step: 1, steps: [1],
    deep_link: "http://localhost:3010/r/920016?fix=3&step=1", banner: "مطلوب منك: صورة الصك غير واضحة — الصورة مقصوصة من الأسفل",
  };

  it("normalizes the pending request and keeps the server banner", () => {
    const [pending] = normalizePendingDataRequests([request]);
    expect(pending).toMatchObject({ id: 3, step: 1, steps: [1], banner: request.banner });
    expect(pending.items[0].label).toBe("صورة الصك غير واضحة");
  });

  it("builds the banner itself when the server omits it", () => {
    const [pending] = normalizePendingDataRequests([
      { id: 4, section: "tenant", items: [{ key: "tenant_mobile", label: "الجوال", step: 4 }, { key: "tenant_dob", label: "تاريخ الميلاد", step: 4 }], note: null },
    ]);
    expect(pending.banner).toBe("مطلوب منك: الجوال، تاريخ الميلاد");
    expect(pending.step).toBe(4);
    expect(pending.steps).toEqual([4]);
  });

  it("parses ?fix= and ?step= from the smart link", () => {
    expect(parseFixParam("3")).toBe(3);
    expect(parseFixParam(["7", "8"])).toBe(7);
    expect(parseFixParam("0")).toBeNull();
    expect(parseFixParam(undefined)).toBeNull();
    expect(parseStepParam("1")).toBe(1);
    expect(parseStepParam("9")).toBeNull();
  });

  it("routes the fix button to the wizard with the exact order/request/step", () => {
    const href = buildFixHref({ orderUuid: "920016", contractId: 306, contractType: "housing", requestId: 3, step: 1 });
    const url = new URL(href, "https://contractejar.com");
    expect(url.pathname).toBe("/create-contract");
    expect(Object.fromEntries(url.searchParams)).toEqual({ id: "residential", fix: "3", order: "920016", cid: "306", step: "1" });
    expect(buildFixHref({ orderUuid: "1", contractId: 2, contractType: "commercial", requestId: 5, step: null })).toBe(
      "/create-contract?id=commercial&fix=5&order=1&cid=2",
    );
  });

  it("maps the server step to the wizard screen and submits only the requested backend steps", () => {
    expect(fixWizardStepFor(1)).toBe("deed");
    expect(fixWizardStepFor(2)).toBe("deed");
    expect(fixWizardStepFor(3)).toBe("owner");
    expect(fixWizardStepFor(4)).toBe("tenant");
    expect(fixWizardStepFor(6)).toBe("finance");
    expect(backendStepsForWizardStep("deed", [1])).toEqual([1]);
    expect(backendStepsForWizardStep("deed", [1, 2])).toEqual([1, 2]);
    expect(backendStepsForWizardStep("tenant", [4])).toEqual([4]);
    expect(backendStepsForWizardStep("owner", [1])).toEqual([]);
  });

  it("reads the step response `fix` payload", () => {
    expect(normalizeContractStepFix(undefined)).toBeNull();
    expect(
      normalizeContractStepFix({ fix_mode: true, changed_fields: ["image_instrument"], resolved_request_ids: ["3"], pending_data_requests: [], message: "تم الإرسال — سيراجعها الموظف." }),
    ).toEqual({ fix_mode: true, changed_fields: ["image_instrument"], resolved_request_ids: [3], pending_data_requests: [], message: "تم الإرسال — سيراجعها الموظف." });
  });
});
