import { describe, expect, it } from "vitest";

import {
  createRateLimiter,
  isSameOriginRequest,
  sniffAllowedDocumentType,
} from "@/lib/security/request-guards";

function post(headers: Record<string, string>) {
  return new Request("https://contractejar.com/api/order", { method: "POST", headers });
}

describe("internal API route guards (regression: 64d3638)", () => {
  it("accepts same-origin and rejects cross-site posts", () => {
    expect(isSameOriginRequest(post({ host: "contractejar.com", origin: "https://contractejar.com" }))).toBe(true);
    expect(isSameOriginRequest(post({ host: "contractejar.com", origin: "https://evil.example" }))).toBe(false);
    expect(isSameOriginRequest(post({ host: "contractejar.com", "sec-fetch-site": "cross-site" }))).toBe(false);
  });

  it("limits per key", () => {
    const limited = createRateLimiter(2, 60_000);
    expect([limited("a"), limited("a"), limited("a"), limited("b")]).toEqual([false, false, true, false]);
  });

  it("checks the real file type, not the name", async () => {
    const jpeg = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0])], "deed.jpg");
    const pdf = new File([new TextEncoder().encode("%PDF-1.7\n...")], "deed.pdf");
    const exeNamedJpg = new File([new TextEncoder().encode("MZ\x90\x00")], "deed.jpg", { type: "image/jpeg" });
    const html = new File([new TextEncoder().encode("<html><script>")], "x.png", { type: "image/png" });
    expect(await sniffAllowedDocumentType(jpeg)).toBe("image/jpeg");
    expect(await sniffAllowedDocumentType(pdf)).toBe("application/pdf");
    expect(await sniffAllowedDocumentType(exeNamedJpg)).toBeNull();
    expect(await sniffAllowedDocumentType(html)).toBeNull();
  });
});
