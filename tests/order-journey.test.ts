import { describe, expect, it } from "vitest";

import {
  buildTemplateJourney,
  normalizeOrderJourney,
  ORDER_JOURNEY_TEMPLATE,
} from "@/features/requests/data/order-journey";

describe("order journey (rule ف2 — six steps)", () => {
  it("has the six client-facing steps in order", () => {
    expect(ORDER_JOURNEY_TEMPLATE.map((s) => s.key)).toEqual([
      "received",
      "paid",
      "under_review",
      "whatsapp_draft",
      "draft_reviewed",
      "ejar_authenticated",
    ]);
  });

  it("template after payment: 2 done, review current", () => {
    expect(buildTemplateJourney(2).map((s) => s.state)).toEqual([
      "completed",
      "completed",
      "current",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("reads the API journey and falls back to null when missing", () => {
    expect(normalizeOrderJourney(null)).toBeNull();
    const steps = normalizeOrderJourney([
      { key: "received", label: "استلام الطلب", done: true, current: false, at: "2026-10-08T16:44:26+03:00" },
      { key: "paid", label: "الدفع", done: false, current: true, at: null },
    ]);
    expect(steps?.map((s) => s.state)).toEqual(["completed", "current"]);
    expect(steps?.[0].at).toBe("2026-10-08T16:44:26+03:00");
  });
});
