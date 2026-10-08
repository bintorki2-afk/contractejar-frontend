"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, type ComponentProps } from "react";

type IntentLinkProps = ComponentProps<typeof Link>;

/**
 * `next/link` that prefetches on intent (hover / focus / touchstart) instead
 * of as soon as it scrolls into view. Used for the links that sit in the
 * first viewport of marketing pages (hero CTAs, navbar) so the wizard's
 * route bundles do not compete with the page's own first paint on mobile
 * (#27). Touchstart fires ~100 ms before the tap, so the prefetch still gets a
 * head start on phones.
 */
export default function IntentLink({
  href,
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...props
}: IntentLinkProps) {
  const router = useRouter();
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    const url = typeof href === "string" ? href : href.pathname ?? null;
    if (url && url.startsWith("/")) {
      try {
        router.prefetch(url);
      } catch {
        // Prefetch is best-effort.
      }
    }
  }, [href, router]);

  return (
    <Link
      {...props}
      href={href}
      prefetch={false}
      onPointerEnter={(event) => {
        prefetch();
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        prefetch();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        prefetch();
        onTouchStart?.(event);
      }}
    />
  );
}
