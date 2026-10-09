import { describe, expect, it } from "vitest";

import {
  buildTemplateJourney,
  journeyAfterPayment,
  normalizeJourneySideState,
  normalizeOrderJourney,
  ORDER_JOURNEY_SENTENCE,
  ORDER_JOURNEY_TEMPLATE,
} from "@/features/requests/data/order-journey";

describe("order journey (دفعة هـ — three steps, no draft stage)", () => {
  it("has the three client-facing steps in order", () => {
    expect(ORDER_JOURNEY_TEMPLATE.map((s) => s.key)).toEqual([
      "under_review",
      "received_by_employee",
      "ejar_authenticated",
    ]);
    expect(ORDER_JOURNEY_TEMPLATE.map((s) => s.label)).toEqual([
      "قيد المراجعة",
      "مستلم من الموظف",
      "تم التوثيق",
    ]);
  });

  it("never mentions the draft stage", () => {
    const text = JSON.stringify(ORDER_JOURNEY_TEMPLATE) + ORDER_JOURNEY_SENTENCE;
    expect(text).not.toMatch(/مسودة|whatsapp_draft|draft_reviewed/);
  });

  it("template: unpaid → first step current; paid → review done, employee step current", () => {
    expect(buildTemplateJourney(0).map((s) => s.state)).toEqual(["current", "pending", "pending"]);
    expect(journeyAfterPayment().map((s) => s.state)).toEqual(["completed", "current", "pending"]);
    expect(buildTemplateJourney(3).map((s) => s.state)).toEqual(["completed", "completed", "completed"]);
  });

  it("reads the API journey (done/current/at/by) and falls back to null when missing", () => {
    expect(normalizeOrderJourney(null)).toBeNull();
    expect(normalizeOrderJourney([])).toBeNull();
    const steps = normalizeOrderJourney([
      { step: 1, key: "under_review", label: "قيد المراجعة", done: true, current: false, at: "2026-10-09T22:02:37+03:00", by: null },
      { step: 2, key: "received_by_employee", label: "مستلم من الموظف", done: true, current: false, at: "2026-10-09T22:02:37+03:00", by: "أدمن النظام" },
      { step: 3, key: "ejar_authenticated", label: "تم التوثيق", done: false, current: true, at: null, by: null },
    ]);
    expect(steps?.map((s) => s.state)).toEqual(["completed", "completed", "current"]);
    expect(steps?.[1].by).toBe("أدمن النظام");
    expect(steps?.[0].at).toBe("2026-10-09T22:02:37+03:00");
  });

  it("is history-safe: a legacy six-step payload collapses to the three steps without draft rows", () => {
    const steps = normalizeOrderJourney([
      { key: "received", label: "استلام الطلب", done: true },
      { key: "paid", label: "الدفع", done: true },
      { key: "under_review", label: "مراجعة الفريق", done: true },
      { key: "whatsapp_draft", label: "إرسال مسودة العقد عبر واتساب", done: true },
      { key: "draft_reviewed", label: "اطلاعك على المسودة", current: true },
      { key: "ejar_authenticated", label: "توثيق العقد", done: false },
    ]);
    expect(steps?.map((s) => s.key)).toEqual(["under_review", "ejar_authenticated"]);
    expect(steps?.map((s) => s.state)).toEqual(["completed", "current"]);
    expect(JSON.stringify(steps)).not.toMatch(/مسودة/);
  });

  it("maps journey_side_state (object or key) to ملغي / مسترجع and ignores the normal path", () => {
    expect(normalizeJourneySideState(null)).toBeNull();
    expect(normalizeJourneySideState({})).toBeNull();
    expect(normalizeJourneySideState("cancelled")).toMatchObject({ key: "cancelled", label: "ملغي" });
    expect(
      normalizeJourneySideState({ key: "refunded", label: "مسترجع", color: "#7c3aed", at: "2026-10-09T10:00:00+03:00" }),
    ).toEqual({ key: "refunded", label: "مسترجع", color: "#7c3aed", at: "2026-10-09T10:00:00+03:00" });
  });
});
