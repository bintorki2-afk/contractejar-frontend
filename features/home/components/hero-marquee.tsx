"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { runWhenIdle } from "@/lib/perf/run-when-idle";
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
 * rAF-driven (pure arithmetic per frame — geometry measured once), paused
 * off-screen / in background tabs, with a static coloured fallback under
 * prefers-reduced-motion.
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
    const colours = slots.map((s) => s.querySelector<HTMLElement>("[data-c]"));
    const dims = slots.map((s) =>
      Array.from(s.querySelectorAll<HTMLElement>("[data-dim]")).map((dm) => ({
        el: dm,
        base: Number(dm.dataset.base || "0.45"),
      }))
    );
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      slots.forEach((s, i) => {
        dims[i].forEach((d) => (d.el.style.opacity = "0"));
        const c = colours[i];
        if (c) c.style.opacity = "1";
      });
      return;
    }

    // Geometry is measured once (and on resize) — never inside the frame loop,
    // so each frame is pure arithmetic + style writes (no forced layout).
    let stripWidth = 0;
    let setWidth = 0;
    let slotWidth = 0;
    let slotStep = 0;
    const measure = () => {
      stripWidth = strip.clientWidth;
      const a = slots[0];
      const b = slots[1];
      const c = slots[LOGOS.length];
      slotWidth = a ? a.offsetWidth : 120;
      slotStep = a && b ? b.offsetLeft - a.offsetLeft : 160;
      setWidth = a && c ? c.offsetLeft - a.offsetLeft : LOGOS.length * slotStep;
    };

    let offset = 0;
    let last = performance.now();
    let raf = 0;
    let running = false;
    const SPEED = 40; // px per second
    const lastOpacity = new Array<number>(slots.length).fill(-1);

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      offset -= SPEED * dt;
      if (setWidth > 0 && offset <= -setWidth) offset += setWidth;
      track.style.transform = `translate3d(${offset}px,0,0)`;

      const cx = stripWidth / 2;
      const half = stripWidth / 2 || 1;
      for (let i = 0; i < slots.length; i++) {
        const centre = offset + i * slotStep + slotWidth / 2;
        const d = Math.abs(centre - cx) / half; // 0 centre .. 1 edge
        const k = Math.max(0, 1 - d / 0.4); // spotlight width
        const e = k * k * (3 - 2 * k); // smoothstep
        // Skip untouched slots (far from the spotlight) — most of them per frame.
        if (e === 0 && lastOpacity[i] === 0) continue;
        lastOpacity[i] = e;
        slots[i].style.transform = `scale(${(1 + 0.5 * e).toFixed(3)})`;
        const c = colours[i];
        if (c) c.style.opacity = e.toFixed(3);
        for (const dm of dims[i]) {
          dm.el.style.opacity = (dm.base * (1 - e)).toFixed(3);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    // Only animate while the strip is on screen, the tab is visible, and the
    // page has settled (first interaction or ~3 s after load, see below).
    let inView = true;
    let settled = false;
    const maybeStart = () => {
      if (settled && inView && document.visibilityState === "visible") start();
      else stop();
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        maybeStart();
      },
      { threshold: 0 }
    );
    io.observe(strip);
    const onVisibility = () => maybeStart();
    document.addEventListener("visibilitychange", onVisibility);

    measure();
    // Paint the strip static first (spotlight on the centre logo), then start
    // sliding once the page has settled / the visitor interacts.
    frame(performance.now());
    stop();
    const cancelIdle = runWhenIdle(() => {
      settled = true;
      maybeStart();
    }, { maxDelayMs: 3000 });

    return () => {
      cancelIdle();
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
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
                    <Image
                      data-dim
                      data-base="0.45"
                      src={`/images/logos-white/${name}.png`}
                      alt=""
                      width={110}
                      height={36}
                      sizes="110px"
                      className="absolute inset-0 m-auto hidden h-auto max-h-9 w-auto max-w-full object-contain dark:block"
                      style={{ opacity: 0.45 }}
                    />
                    {/* dim — grey in light theme */}
                    <Image
                      data-dim
                      data-base="0.55"
                      src={`/images/${name}.png`}
                      alt=""
                      width={110}
                      height={36}
                      sizes="110px"
                      className="absolute inset-0 m-auto h-auto max-h-9 w-auto max-w-full object-contain grayscale dark:hidden"
                      style={{ opacity: 0.55 }}
                    />
                    {/* full, boosted colour */}
                    <Image
                      data-c
                      src={`/images/${name}.png`}
                      alt=""
                      width={110}
                      height={36}
                      sizes="110px"
                      className="absolute inset-0 m-auto h-auto max-h-9 w-auto max-w-full object-contain [filter:saturate(1.35)_contrast(1.06)]"
                      style={{ opacity: 0 }}
                    />
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 [background:linear-gradient(to_right,var(--color-brand-background-green),transparent)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 [background:linear-gradient(to_left,var(--color-brand-background-green),transparent)]" />
        </div>
      </div>
    </div>
  );
}
