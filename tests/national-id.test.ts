import { describe, expect, it } from "vitest";

import { isValidOwnerId, isValidPersonId } from "@/lib/validation/national-id";

describe("Saudi ID numbers", () => {
  it("person: 10 digits starting with 1 or 2", () => {
    expect(isValidPersonId("1012345678")).toBe(true);
    expect(isValidPersonId("2012345678")).toBe(true);
    expect(isValidPersonId("١٠١٢٣٤٥٦٧٨")).toBe(true);
    expect(isValidPersonId("3012345678")).toBe(false);
    expect(isValidPersonId("7001234567")).toBe(false);
    expect(isValidPersonId("101234567")).toBe(false);
  });

  it("owner may also be an establishment (7…)", () => {
    expect(isValidOwnerId("7001234567")).toBe(true);
    expect(isValidOwnerId("3012345678")).toBe(false);
  });
});
