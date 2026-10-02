"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./services-visual.module.css";

type Stage = { key: string; label: string; title: string; state: "done" | "active" | "todo" };

type ServicesVisualProps = {
  alt: string;
  heading: string;
  /** Contract journey stages shown inside the phone */
  stages: Stage[];
  successTitle: string;
  successSubtitle: string;
  /** Floating price chip */
  priceValue: string;
  priceCurrency: string;
  priceLabel: string;
  priceSub: string;
  /** Floating verification chip */
  verifiedLabel: string;
};

/**
 * Live, CSS-built service visual — same design language as the hero (floating
 * 3D phone, glow, rings) but the in-screen content shows the CONTRACT JOURNEY
 * (stepper + stage cards), and the whole screen ADAPTS to the site theme
 * (light/dark) because it is built from live elements, not a flat image.
 *
 * Authored at a fixed 760x700 design size and scaled to the container width.
 */
export default function ServicesVisual({
  alt,
  heading,
  stages,
  successTitle,
  successSubtitle,
  priceValue,
  priceCurrency,
  priceLabel,
  priceSub,
  verifiedLabel,
}: ServicesVisualProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / 760);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stepCount = stages.length;

  return (
    <div className="w-full">
      <div ref={wrapRef} className={styles.wrap} role="img" aria-label={alt}>
        <div className={styles.stage} style={{ transform: `scale(${scale})` }}>
          <div className={styles.glow} />
          <div className={styles.ring} />
          <div className={`${styles.ring} ${styles.r2}`} />
          <span className={`${styles.spark} ${styles.s1}`}>✦</span>
          <span className={`${styles.spark} ${styles.s2}`}>✦</span>

          <div className={styles.persp}>
            <div className={styles.phone}>
              <div className={styles.rim} />
              <span className={`${styles.sb} ${styles.pw}`} />
              <span className={`${styles.sb} ${styles.ba}`} />
              <span className={`${styles.sb} ${styles.v1}`} />
              <span className={`${styles.sb} ${styles.v2}`} />
              <div className={styles.island} />

              <div className={styles.screen}>
                <div className={styles.sbar}>
                  <span>٩:٤١</span>
                  <span className={styles.ic}>
                    <svg viewBox="0 0 20 14" width="18" height="12">
                      <rect x="0" y="9" width="3" height="5" rx="1" fill="#111" />
                      <rect x="5" y="6" width="3" height="8" rx="1" fill="#111" />
                      <rect x="10" y="3" width="3" height="11" rx="1" fill="#111" />
                      <rect x="15" y="0" width="3" height="14" rx="1" fill="#111" />
                    </svg>
                    <svg viewBox="0 0 26 13" width="24" height="12">
                      <rect x="1" y="1" width="20" height="11" rx="3" fill="none" stroke="#111" strokeOpacity=".9" />
                      <rect x="3" y="3" width="15" height="7" rx="1.5" fill="#111" />
                      <rect x="22.5" y="4" width="2" height="5" rx="1" fill="#111" />
                    </svg>
                  </span>
                </div>

                <div className={styles.appHead}>
                  <b>{heading}</b>
                  <span className={styles.gdot} />
                </div>

                {/* contract-journey stepper */}
                <div className={styles.steps}>
                  {stages.map((s, i) => (
                    <div key={s.key} className={styles.step}>
                      {i < stepCount - 1 && (
                        <span
                          className={styles.sline}
                          style={{ right: "50%", width: "100%" }}
                        />
                      )}
                      <span
                        className={`${styles.sdot} ${
                          s.state === "done"
                            ? styles.done
                            : s.state === "active"
                              ? styles.active
                              : ""
                        }`}
                      >
                        {s.state === "done" ? (
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className={styles.slabel}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* stage cards */}
                <div className={styles.scards}>
                  {stages.map((s) => (
                    <div
                      key={s.key}
                      className={`${styles.scard} ${s.state === "active" ? styles.active : ""}`}
                    >
                      <span className={styles.cdot}>
                        {s.state === "done" ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1aa589" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0e6a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v4l2.5 2" />
                          </svg>
                        )}
                      </span>
                      <span className={styles.ctxt}>
                        <b>{s.title}</b>
                        <span>{s.state === "done" ? "مكتملة" : "قيد الإنجاز"}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.scrFoot} />

                <div className={styles.success}>
                  <div className={styles.cc}>
                    <svg className={styles.tick} viewBox="0 0 52 52">
                      <path
                        className={styles.tickp}
                        d="M16 27l6.5 6.5L37 19"
                        fill="none"
                        stroke="#0d7a68"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.tt}>
                    <b>{successTitle}</b>
                    <span>{successSubtitle}</span>
                  </div>
                </div>

                <div className={styles.sheen} />
              </div>
            </div>
          </div>

          {/* floating price chip — upper-left */}
          <div className={`${styles.price} ${styles.pr1}`}>
            <span className={styles.pv}>
              {priceValue} <small>{priceCurrency}</small>
            </span>
            <span className={styles.pl}>
              <b>{priceLabel}</b>
              <span>{priceSub}</span>
            </span>
          </div>

          {/* floating verified chip — lower, opposite corner */}
          <div className={`${styles.vpill} ${styles.vp1}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{verifiedLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
