"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./support-visual.module.css";

type ChatMessage = { from: "in" | "out"; text: string; time: string };

type SupportVisualProps = {
  alt: string;
  chatName: string;
  status: string;
  messages: ChatMessage[];
  inputPlaceholder: string;
  satisfaction: string;
  responseTime: string;
};

/** Normalize Western digits to Arabic-Indic for consistent, deduplicated chips. */
function toArabicDigits(s: string): string {
  return s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

/**
 * Live, CSS-built support visual — a floating 3D phone showing a WhatsApp
 * conversation that ADAPTS to the site theme (light/dark), replacing the flat
 * baked-in banner image. Only two floating chips, no duplicates.
 *
 * Authored at a fixed 760x700 design size and scaled to the container width.
 */
export default function SupportVisual({
  alt,
  chatName,
  status,
  messages,
  inputPlaceholder,
  satisfaction,
  responseTime,
}: SupportVisualProps) {
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
                {/* WhatsApp header */}
                <div className={styles.head}>
                  <span className={styles.avatar}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.6 14.3c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.3.1.6-.1 1.1Z" />
                    </svg>
                  </span>
                  <span className={styles.hmeta}>
                    <b>{chatName}</b>
                    <span>{status}</span>
                  </span>
                  <span className={styles.hdots}>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>

                {/* chat body */}
                <div className={styles.body}>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`${styles.msg} ${m.from === "in" ? styles.in : styles.out}`}
                    >
                      {m.text}
                      <time>{m.time}</time>
                    </div>
                  ))}
                </div>

                {/* input bar */}
                <div className={styles.inputBar}>
                  <span className={styles.inputField}>{inputPlaceholder}</span>
                  <span className={styles.sendBtn}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </span>
                </div>

                <div className={styles.sheen} />
              </div>
            </div>
          </div>

          {/* floating chips */}
          <div className={`${styles.chip} ${styles.c1}`}>
            <svg className={styles.star} viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="m12 2 3 6.3 6.9.9-5 4.8 1.2 6.8L12 17.8 5.9 20.8l1.2-6.8-5-4.8 6.9-.9Z" />
            </svg>
            {toArabicDigits(satisfaction.replace(/^⭐\s*/, ""))}
          </div>
          <div className={`${styles.chip} ${styles.c2}`}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {toArabicDigits(responseTime)}
          </div>
        </div>
      </div>
    </div>
  );
}
