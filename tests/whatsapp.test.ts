import { describe, expect, it } from "vitest";

import {
  buildWhatsappHref,
  DEFAULT_CONTACT_NUMBER,
  resolveSettingsWhatsappNumber,
} from "@/features/settings/utils/build-whatsapp-href";

describe("support WhatsApp number (rule ف18)", () => {
  it("falls back to 0597500014 without settings", () => {
    expect(resolveSettingsWhatsappNumber(null)).toBe(DEFAULT_CONTACT_NUMBER);
    expect(DEFAULT_CONTACT_NUMBER).toBe("966597500014");
  });

  it("ignores the demo placeholder", () => {
    expect(resolveSettingsWhatsappNumber({ whatsapp_contact: "0501234567" })).toBe("966597500014");
  });

  it("uses the dashboard value and normalises it", () => {
    const number = resolveSettingsWhatsappNumber({ whatsapp_contact: "0551112222" });
    expect(buildWhatsappHref(number)).toBe("https://wa.me/966551112222");
  });
});
