/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./hero-visual.module.css";

type HeroVisualProps = {
  alt: string;
  imageUrl: string;
};

/**
 * Animated hero visual: a floating 3D iPhone showing a documented Ejar/REGA
 * tenancy contract, with an in-screen success confirmation and floating
 * trust chips. Shown first on phones (lighter motion) and beside the copy on desktop.
 *
 * The whole scene is authored at a fixed 760x700 design size and scaled to the
 * container width, so the 3D transforms stay crisp at any column width.
 * Motion is pure CSS and fully disabled under `prefers-reduced-motion`.
 */
export default function HeroVisual({ alt }: HeroVisualProps) {
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

                <img className={styles.contract} src="/images/hero-contract.webp" alt="" />

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
                    <b>تم إصدار العقد بنجاح</b>
                    <span>موثّق رسميًا لدى إيجار</span>
                  </div>
                </div>

                <div className={styles.scrFoot}>
                  <button type="button" className={styles.cta} tabIndex={-1} aria-hidden="true">
                    إصدار العقد الآن
                  </button>
                  <div className={styles.home} />
                </div>

                <div className={styles.sheen} />
              </div>
            </div>
          </div>

          <div className={`${styles.fc} ${styles.chip} ${styles.c2}`}>
            <img src="/images/general-authority.png" alt="" />
            <span>مرخّص من الهيئة</span>
          </div>
          <div className={`${styles.fc} ${styles.chip} ${styles.c3}`}>
            <img src="/images/ejar.png" alt="" />
            <span>موثّق رسميًا</span>
          </div>
          <div className={`${styles.pill} ${styles.p1}`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>خلال ٣٠ دقيقة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
