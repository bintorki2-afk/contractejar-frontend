"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const LOGOS = [
  "ejar",
  "general-authority",
  "saudi-center",
  "hesab",
  "daman",
  "tegara",
  "najez",
];

/**
 * Trusted-authorities strip. Logos scroll right -> left and blend into the
 * section background (no card). Each logo is dim + monochrome at the edges —
 * white in dark theme, grey in light theme — and, as it crosses the centre,
 * smoothly scales up and turns full, boosted colour (a moving spotlight).
 * rAF-driven, with a static coloured fallback under prefers-reduced-motion.
 */
export default function HeroMarquee() {
  const t = useTranslations("hero");
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;

    const slots = Array.from(
      track.querySelectorAll<HTMLElement>("[data-slot]")
    );
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      slots.forEach((s) => {
        s.querySelectorAll<HTMLElement>("[data-dim]").forEach(
          (d) => (d.style.opacity = "0")
        );
        const c = s.querySelector<HTMLElement>("[data-c]");
        if (c) c.style.opacity = "1";
      });
      return;
    }

    const measure = () => {
      const a = slots[0];
      const b = slots[LOGOS.length];
      return a && b ? b.offsetLeft - a.offsetLeft : 0;
    };

    let setWidth = measure();
    let offset = 0;
    let last = performance.now();
    let raf = 0;
    const SPEED = 40; // px per second

    const onResize = () => {
      setWidth = measure();
    };
    window.addEventListener("resize", onResize);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      offset -= SPEED * dt;
      if (setWidth > 0 && offset <= -setWidth) offset += setWidth;
      track.style.transform = `translate3d(${offset}px,0,0)`;

      const sr = strip.getBoundingClientRect();
      const cx = sr.left + sr.width / 2;
      const half = sr.width / 2 || 1;

      for (const s of slots) {
        const r = s.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - cx) / half; // 0 centre .. 1 edge
        const k = Math.max(0, 1 - d / 0.4); // spotlight width
        const e = k * k * (3 - 2 * k); // smoothstep
        s.style.transform = `scale(${(1 + 0.5 * e).toFixed(3)})`;

        const c = s.querySelector<HTMLElement>("[data-c]");
        if (c) c.style.opacity = e.toFixed(3);
        s.querySelectorAll<HTMLElement>("[data-dim]").forEach((dm) => {
          const base = Number(dm.dataset.base || "0.45");
          dm.style.opacity = (base * (1 - e)).toFixed(3);
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="w-full">
      <div ref={stripRef} className="relative">
        <p className="mb-4 text-center text-sm font-bold text-[#0a6b57] lg:text-start dark:text-[#8ff0d3]">
          {t("compliantWith")}
        </p>

        <div className="relative h-16 overflow-hidden" dir="ltr">
          <div
            ref={trackRef}
            className="absolute inset-y-0 left-0 flex items-center gap-10 will-change-transform"
          >
            {[0, 1].map((setIdx) =>
              LOGOS.map((name) => (
                <div
                  key={`${setIdx}-${name}`}
                  data-slot
                  className="flex h-16 w-[120px] shrink-0 items-center justify-center will-change-transform"
                >
                  <span className="relative block h-9 w-[110px]">
                    {/* dim — white in dark theme */}
                    <img
                      data-dim
                      data-base="0.45"
                      src={`/images/logos-white/${name}.png`}
                      alt=""
                      className="absolute inset-0 m-auto hidden max-h-9 w-auto max-w-full object-contain dark:block"
                      style={{ opacity: 0.45 }}
                    />
                    {/* dim — grey in light theme */}
                    <img
                      data-dim
                      data-base="0.55"
                      src={`/images/${name}.png`}
                      alt=""
                      className="absolute inset-0 m-auto max-h-9 w-auto max-w-full object-contain grayscale dark:hidden"
                      style={{ opacity: 0.55 }}
                    />
                    {/* full, boosted colour */}
                    <img
                      data-c
                      src={`/images/${name}.png`}
                      alt=""
                      className="absolute inset-0 m-auto max-h-9 w-auto max-w-full object-contain [filter:saturate(1.35)_contrast(1.06)]"
                      style={{ opacity: 0 }}
                    />
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 [background:linear-gradient(to_right,#e9fbf5,transparent)] dark:[background:linear-gradient(to_right,#16352f,transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 [background:linear-gradient(to_left,#e9fbf5,transparent)] dark:[background:linear-gradient(to_left,#16352f,transparent)]" />
        </div>
      </div>
    </div>
  );
}
