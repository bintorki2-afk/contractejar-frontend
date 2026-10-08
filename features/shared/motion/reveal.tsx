"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** Vertical offset (px) the element rises from. */
  y?: number;
};

/**
 * Fades + slides its children up when they scroll into view (once).
 *
 * Ambient, low-key motion that makes the page feel alive without distracting.
 * Implemented with IntersectionObserver + a CSS transition (no animation
 * library on the critical path — the previous `motion` build added ~120 KB of
 * JS to every marketing page). Users with `prefers-reduced-motion`, and
 * browsers without IntersectionObserver, get the content immediately.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "1";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal-on-scroll", shown && "is-revealed", className)}
      style={{
        transitionDelay: delay ? `${delay}s` : undefined,
        ["--reveal-y" as string]: `${y}px`,
      }}
    >
      {children}
    </div>
  );
}
