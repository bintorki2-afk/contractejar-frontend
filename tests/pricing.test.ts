import { describe, expect, it } from "vitest";

import { computeContractFee } from "@/features/pricing/types/contract-pricing";

const housing = { first_year: 249, extra_year: 150 };

describe("contract fee rule (same as backend ContractPricing)", () => {
  it.each([
    [1, 1, 249],
    [12, 1, 249],
    [13, 2, 399],
    [24, 2, 399],
    [25, 3, 549],
  ])("%i months → %i billable years → %i SAR", (months, years, fee) => {
    expect(computeContractFee(housing, months)).toEqual({ billableYears: years, fee });
  });

  it("never goes below one year", () => {
    expect(computeContractFee(housing, 0).fee).toBe(249);
  });
});
