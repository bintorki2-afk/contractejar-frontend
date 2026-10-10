"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./services-visual.module.css";

type Requirement = { key: string; label: string; icon: "people" | "deed" | "home" | "money" | "chat" };

type ServicesVisualProps = {
  alt: string;
  /** In-phone screen content */
  navActive: string;
  heading: string;
  subheading: string;
  hint: string;
  steps: string[];
  /** Index of the currently-active step (0-based) */
  activeStep: number;
  requirements: Requirement[];
  priceBoxLabel: string;
  startLabel: string;
  seeAllLabel: string;
  /** Floating price chip */
  priceValue: string;
  priceCurrency: string;
  priceLabel: string;
  priceSub: string;
  /** Floating verification chip */
  verifiedLabel: string;
};

function ReqIcon({ icon }: { icon: Requirement["icon"] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "people":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="m16 11 2 2 4-4" />
        </svg>
      );
    case "deed":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 7h6M9 11h6M9 15h3" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "money":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9.5 9.2c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.6-2.5 1.6-2.5.7-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 20.5l1.4-4.2A8.4 8.4 0 0 1 3.5 11 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />
        </svg>
      );
  }
}

/**
 * Live, CSS-built service visual — a floating 3D phone whose screen shows the
 * real "طلبات قبل أن نبدأ" (requirements before we start) flow. The whole
 * screen ADAPTS to the site theme (light/dark) because it is built from live
 * elements, not a flat image.
 *
 * Authored at a fixed 760x700 design size and scaled to the container width.
 */
export default function ServicesVisual({
  alt,
  navActive,
  heading,
  subheading,
  hint,
  steps,
  activeStep,
  requirements,
  priceBoxLabel,
  startLabel,
  seeAllLabel,
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
                {/* mini site top-nav */}
                <div className={styles.nav}>
                  <span className={styles.navR}>
                    <span className={styles.navPill}>{navActive}</span>
                    <span className={styles.navItem}>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10.5 12 4l9 6.5V20H3z" />
                      </svg>
                      الرئيسية
                    </span>
                  </span>
                  <span className={styles.navToggle}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                    فاتح
                  </span>
                </div>

                {/* stepper */}
                <div className={styles.steps}>
                  {steps.map((s, i) => (
                    <div key={s} className={styles.stepWrap}>
                      {i > 0 && <span className={styles.sline} />}
                      <span className={`${styles.step} ${i === activeStep ? styles.stepOn : ""}`}>
                        {s}
                      </span>
                    </div>
                  ))}
                  <span className={styles.stepLead}>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6z" />
                    </svg>
                    عقدي
                  </span>
                </div>

                {/* dashed hint */}
                <div className={styles.hint}>
                  <span className={styles.hdot} />
                  {hint}
                </div>

                {/* hand + title */}
                <div className={styles.hand}>✋</div>
                <div className={styles.title}>{heading}</div>
                <div className={styles.sub}>{subheading}</div>

                {/* requirements list */}
                <div className={styles.reqs}>
                  {requirements.map((r) => (
                    <div key={r.key} className={styles.req}>
                      <span className={styles.reqIco}>
                        <ReqIcon icon={r.icon} />
                      </span>
                      <span className={styles.reqTxt}>{r.label}</span>
                    </div>
                  ))}
                </div>

                {/* price box */}
                <div className={styles.pbox}>
                  <span className={styles.pboxVal}>
                    {priceValue} <small>ر.س</small>
                  </span>
                  <span className={styles.pboxLbl}>{priceBoxLabel}</span>
                </div>
                <div className={styles.seeAll}>{seeAllLabel} ↖</div>

                {/* start button */}
                <div className={styles.startBtn}>{startLabel}</div>

                <div className={styles.sheen} />
              </div>
            </div>
          </div>

          {/* floating price chip — upper-right, enlarged, pulsing edges */}
          <div className={`${styles.price} ${styles.pr1}`}>
            <span className={styles.pv}>
              {priceValue} <small>{priceCurrency}</small>
            </span>
            <span className={styles.pl}>
              <b>{priceLabel}</b>
              <span>{priceSub}</span>
            </span>
          </div>

          {/* floating verified chip — lower-left, opposite corner */}
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
