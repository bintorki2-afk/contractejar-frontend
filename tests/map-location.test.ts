import { describe, expect, it } from "vitest";

import {
  appendContractStep2Fields,
  hasRealMapLocation,
} from "@/features/create-contract/utils/build-contract-step2-form-data";

describe("hasRealMapLocation", () => {
  it("rejects the Riyadh placeholder and empty values", () => {
    expect(hasRealMapLocation(24.7136, 46.6753)).toBe(false);
    expect(hasRealMapLocation(0, 0)).toBe(false);
    expect(hasRealMapLocation(undefined, null)).toBe(false);
  });

  it("accepts a real location (e.g. from a saved property)", () => {
    expect(hasRealMapLocation(21.4858, 39.1925)).toBe(true);
  });
});

describe("appendContractStep2Fields", () => {
  it("does not send placeholder coordinates for a link address", () => {
    const fd = new FormData();
    appendContractStep2Fields(fd, {
      contractId: 7,
      addressMethod: "link",
      latitude: 24.7136,
      longitude: 46.6753,
      addressUrl: "https://maps.app.goo.gl/x",
    });
    expect(fd.has("latitude")).toBe(false);
    expect(fd.has("lat")).toBe(false);
    expect(fd.get("address_url")).toBe("https://maps.app.goo.gl/x");
  });

  it("keeps real coordinates", () => {
    const fd = new FormData();
    appendContractStep2Fields(fd, {
      contractId: 7,
      addressMethod: "link",
      latitude: 21.4858,
      longitude: 39.1925,
      addressUrl: "https://maps.app.goo.gl/x",
    });
    expect(fd.get("lat")).toBe("21.4858");
  });
});
