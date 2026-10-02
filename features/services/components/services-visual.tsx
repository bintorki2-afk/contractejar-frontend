"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./services-visual.module.css";

type ServicesVisualProps = {
  alt: string;
  /** Phone screen heading, e.g. "إنشاء عقد إيجار سكني" */
  heading: string;
  /** Short chip tabs shown under the heading */
  tabs: string[];
  /** Row title + subtitle inside the screen */
  rowTitle: string;
  rowSubtitle: string;
  /** Success popup texts */
  successTitle: string;
  successSubtitle: string;
  /** Floating price pill */
  priceValue: string;
  priceCurrency: string;
  priceLabel: string;
  priceSub: string;
};

/**
 * Live, CSS-built visual for a service showcase — same design language as the
 * hero (floating 3D phone, glow, rings, floating pills) so the sections read as
 * one system. Replaces the old flat PNG whose elements were scattered.
 *
 * Authored at a fixed 760x700 design size and scaled to the container width.
 * All motion is pure CSS and disabled under `prefers-reduced-motion`.
 */
export default function ServicesVisual({
  alt,
  heading,
  tabs,
  rowTitle,
  rowSubtitle,
  successTitle,
  successSubtitle,
  priceValue,
  priceCurrency,
  priceLabel,
  priceSub,
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
                    <svg viewBox="0 0 20 14" width="18" height="12" fill="#111">
                      <rect x="0" y="9" width="3" height="5" rx="1" />
                      <rect x="5" y="6" width="3" height="8" rx="1" />
                      <rect x="10" y="3" width="3" height="11" rx="1" />
                      <rect x="15" y="0" width="3" height="14" rx="1" />
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

                <div className={styles.tabs}>
                  {tabs.map((tab) => (
                    <span key={tab}>{tab}</span>
                  ))}
                </div>

                <p className={styles.lead}>{rowSubtitle}</p>

                <div className={styles.prow}>
                  <span className={styles.pdot}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0e6a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </span>
                  <span>
                    <b>{rowTitle}</b>
                    <span>{rowSubtitle}</span>
                  </span>
                </div>

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

                <div className={styles.scrFoot}>
                  <div className={styles.home} />
                </div>

                <div className={styles.sheen} />
              </div>
            </div>
          </div>

          {/* floating price pill — replaces the old stray card */}
          <div className={`${styles.price} ${styles.pr1}`}>
            <span className={styles.pv}>
              {priceValue} <small>{priceCurrency}</small>
            </span>
            <span className={styles.pl}>
              <b>{priceLabel}</b>
              <span>{priceSub}</span>
            </span>
          </div>

          <div className={`${styles.pill} ${styles.p1}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>موثّق رسميًا</span>
          </div>
        </div>
      </div>
    </div>
  );
}
