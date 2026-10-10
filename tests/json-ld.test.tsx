import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import JsonLd from "@/components/json-ld";

describe("JsonLd (regression: 944d81c — stored XSS via settings social links)", () => {
  it("never lets a value close the script tag", () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ sameAs: ["https://x.com/</script><script>alert(1)</script>"] }} />,
    );
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    expect(html).toContain("\\u003c/script>");
  });

  it("still produces valid JSON", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ name: "عقدي <1>" }} />);
    const json = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(json)).toEqual({ name: "عقدي <1>" });
  });
});
