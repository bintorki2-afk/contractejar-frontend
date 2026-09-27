"use client";

import { useEffect, useRef } from "react";

/**
 * Global ambient background that lives behind every page.
 *
 * Replaces the flat, "dead" solid fill with layered depth:
 *  - a soft brand-tinted gradient base (theme-aware),
 *  - slow-drifting brand glow orbs,
 *  - a faint dot grid (precise / technical feel),
 *  - a barely-there film grain (premium, non-digital feel),
 *  - a subtle scroll-parallax nudge on the orbs.
 *
 * Everything is decorative (aria-hidden, pointer-events-none), kept very low
 * contrast so text stays fully legible, and fully disabled for users who
 * prefer reduced motion.
 */
export default function SiteBackground() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        // Small parallax offset so the depth reacts gently to scrolling.
        const offset = Math.min(window.scrollY * 0.04, 60);
        node.style.setProperty("--bg-scroll", `${offset}px`);
        raf = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="site-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="site-bg-base absolute inset-0" />
      <div className="site-bg-glow site-bg-glow-1" />
      <div className="site-bg-glow site-bg-glow-2" />
      <div className="site-bg-glow site-bg-glow-3" />
      <div className="site-bg-grid absolute inset-0" />
      <div className="site-bg-grain absolute inset-0" />
    </div>
  );
}
