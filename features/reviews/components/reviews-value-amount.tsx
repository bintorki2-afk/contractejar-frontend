"use client";

import { useEffect, useRef, useState } from "react";

type ReviewsValueAmountProps = {
  /** Full label, e.g. "+7 مليار ريال" or "SAR 7B+". The first number counts up. */
  text: string;
  className?: string;
};

const DURATION = 1700; // ms
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Renders the value label, animating the first number from 0 to its target
 *  when it scrolls into view. Falls back to the plain text if parsing fails. */
export default function ReviewsValueAmount({
  text,
  className,
}: ReviewsValueAmountProps) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  const target = match ? parseFloat(match[1]) : null;
  const decimals = match && match[1].includes(".")
    ? match[1].split(".")[1].length
    : 0;

  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || target == null) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) {
        setProgress(1);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / DURATION, 1);
        setProgress(easeOut(p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  if (target == null || !match) {
    return <span className={className}>{text}</span>;
  }

  const current = (target * progress).toFixed(decimals);
  const display =
    text.slice(0, match.index) + current + text.slice(match.index! + match[1].length);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}
