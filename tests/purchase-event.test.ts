import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buildPurchaseEvent } from "@/lib/analytics/purchase-event";
import { trackPurchaseOnce } from "@/lib/analytics/track";

describe("purchase event (Google Ads / TikTok conversion)", () => {
  it("carries transaction_id, value and currency from the server status", () => {
    expect(
      buildPurchaseEvent("963031", { paidAmount: 349, contractType: "Housing" }),
    ).toEqual({
      transaction_id: "963031",
      value: 349,
      currency: "SAR",
      contract_type: "housing",
    });
  });

  it("maps commercial and lessor-change orders", () => {
    expect(buildPurchaseEvent(1, { paidAmount: 799, contractType: "commercial" }).contract_type).toBe(
      "commercial",
    );
    expect(buildPurchaseEvent(2, { paidAmount: 400, kind: "lessor_change" }).contract_type).toBe(
      "lessor_change",
    );
  });

  it("omits value when the server did not confirm an amount (never 0 / NaN)", () => {
    expect(buildPurchaseEvent("5", { paidAmount: null }).value).toBeUndefined();
    expect(buildPurchaseEvent("5", { paidAmount: Number.NaN }).value).toBeUndefined();
    expect(buildPurchaseEvent("5", null).value).toBeUndefined();
    expect(buildPurchaseEvent("5", null).currency).toBe("SAR");
  });

  describe("dataLayer push", () => {
    const store = new Map<string, string>();
    const previousGtm = process.env.NEXT_PUBLIC_GTM_ID;

    beforeEach(() => {
      store.clear();
      process.env.NEXT_PUBLIC_GTM_ID = "GTM-TEST";
      (globalThis as unknown as { window: unknown }).window = {
        dataLayer: [],
        sessionStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => void store.set(key, value),
        },
      };
    });

    afterEach(() => {
      delete (globalThis as unknown as { window?: unknown }).window;
      process.env.NEXT_PUBLIC_GTM_ID = previousGtm;
    });

    it("pushes `purchase` once per order with the conversion fields", () => {
      const params = buildPurchaseEvent("963031", { paidAmount: 349 });
      expect(trackPurchaseOnce(params)).toBe(true);
      expect(trackPurchaseOnce(params)).toBe(false);

      const layer = (globalThis as unknown as { window: { dataLayer: unknown[] } }).window.dataLayer;
      expect(layer).toEqual([
        {
          event: "purchase",
          transaction_id: "963031",
          value: 349,
          currency: "SAR",
          contract_type: "housing",
        },
      ]);
    });
  });
});
