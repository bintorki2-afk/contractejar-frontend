"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { track } from "@/lib/analytics/track";

type WhatsappCtaLinkProps = ComponentProps<typeof Link> & {
  /** Where the button lives (`hero`, `support_section`, `support_page`, …). */
  placement: string;
};

/**
 * A WhatsApp link that reports `cta_whatsapp_click` to GTM. Use it for every
 * WhatsApp call-to-action so ad platforms can count contact intents.
 */
export default function WhatsappCtaLink({
  placement,
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: WhatsappCtaLinkProps) {
  return (
    <Link
      {...props}
      target={target}
      rel={rel}
      onClick={(event) => {
        track("cta_whatsapp_click", { placement });
        onClick?.(event);
      }}
    />
  );
}
