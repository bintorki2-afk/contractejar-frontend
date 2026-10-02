"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type AnimatedStatProps = {
  /** e.g. "+8M" / "+2M" — the M value is expanded and counted up to in full */
  value: string;
  text: string;
};

/** Parse "+8M" → 8_000_000, "+2.5M" → 2_500_000, "120K" → 120_000. */
function parseTarget(value: string): number | null {
  const m = value.match(/(\d+(?:\.\d+)?)\s*([MK])/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const mult = m[2].toUpperCase() === "M" ? 1_000_000 : 1_000;
  return Math.round(n * mult);
}

const DURATION = 1900; // ms
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedStat({ value, text }: AnimatedStatProps) {
  const target = parseTarget(value);
  const hasPlus = value.trim().startsWith("+") || value.trim().endsWith("+");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 → 1
  const started = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || target == null) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const current = target == null ? null : Math.round(target * progress);
  const display =
    current == null
      ? value
      : `${hasPlus ? "+" : ""}${current.toLocaleString("en-US")}`;

  // Ejar logo "builds up" from the bottom as the count climbs.
  const reveal = target == null ? 1 : progress;

  return (
    <div ref={wrapRef} className="mt-1">
      <p
        className="text-3xl font-bold text-brand tabular-nums"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {display}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-xs text-black dark:text-white/90">{text}</p>
        <span
          className="block w-10 overflow-hidden"
          style={{
            clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
          }}
        >
          <Image
            src="/images/ejar.png"
            alt="إيجار"
            width={50}
            height={50}
            className="w-10 object-contain"
          />
        </span>
      </div>
    </div>
  );
}
