import { describe, expect, it } from "vitest";

import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";

/** Simulates typing one character at a time into the controlled input. */
function typeInto(text: string) {
  let value = "";
  for (const char of text) value = toSaudiMobileInputValue(value + char);
  return value;
}

describe("Saudi mobile input (regression: db1fa14)", () => {
  const cases: Array<[string, string]> = [
    ["+966501234567", "0501234567"],
    ["00966501234567", "0501234567"],
    ["966501234567", "0501234567"],
    ["0501234567", "0501234567"],
    ["501234567", "0501234567"],
    ["٠٥٠١٢٣٤٥٦٧", "0501234567"],
    ["0505123456", "0505123456"],
  ];

  it.each(cases)("typing %s gives %s", (input, expected) => {
    expect(typeInto(input)).toBe(expected);
  });

  it.each(cases)("pasting %s gives %s", (input, expected) => {
    expect(toSaudiMobileInputValue(input)).toBe(expected);
  });

  it("caps at 10 digits", () => {
    expect(toSaudiMobileInputValue("05012345678999")).toBe("0501234567");
  });
});
