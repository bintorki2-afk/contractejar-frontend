"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  /** The real final value to count up to. */
  value: number;
  /** Digits after the decimal point (e.g. 1 for 4.9). */
  decimals?: number;
  /** Rendered before the number (e.g. "+"). */
  prefix?: string;
  /** Rendered after the number (e.g. "%", "K"). */
  suffix?: string;
  /** Animation duration in ms. */
  durationMs?: number;
  className?: string;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts a real number up from zero the first time it scrolls into view.
 *
 * Feed it a genuine figure only — never a fabricated one. Users with
 * `prefers-reduced-motion` see the final value immediately.
 */
export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1600,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    let started = false;
    let raf = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / durationMs, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
