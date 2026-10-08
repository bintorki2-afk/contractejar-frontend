"use client";

import { useEffect, useState } from "react";

/**
 * App Router root error boundary. Reports the crash to Sentry and shows the
 * customer a friendly Arabic message plus the Sentry reference number, so a
 * customer can quote it to support and it can be looked up instantly.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    // Sentry is loaded on demand (kept out of the critical bundle, #27).
    let cancelled = false;
    const fallback = error.digest || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from the error prop
    setReference(fallback ? fallback.slice(0, 8).toUpperCase() : "");
    void import("@sentry/browser")
      .then((Sentry) => {
        if (cancelled) return;
        const id = Sentry.captureException(error) || "";
        const raw = id || fallback;
        setReference(raw ? raw.slice(0, 8).toUpperCase() : "");
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, Tahoma, sans-serif",
          background: "#f4f6f5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px 28px",
            maxWidth: 420,
            width: "90%",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: 44, lineHeight: 1 }}>⚠️</div>
          <h1 style={{ fontSize: 20, color: "#0f5132", margin: "16px 0 8px" }}>
            حدث خطأ غير متوقع
          </h1>
          <p
            style={{
              color: "#555",
              fontSize: 15,
              lineHeight: 1.8,
              margin: "0 0 20px",
            }}
          >
            نعتذر عن الإزعاج. تم إبلاغ فريقنا تلقائياً. يمكنك المحاولة مرة أخرى.
          </p>
          {reference ? (
            <div
              style={{
                background: "#f0f2f1",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 14,
                color: "#333",
              }}
            >
              الرقم المرجعي:{" "}
              <strong style={{ letterSpacing: 1 }}>{reference}</strong>
            </div>
          ) : null}
          <button
            onClick={() => reset()}
            style={{
              background: "#0f5132",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            حاول مرة أخرى
          </button>
        </div>
      </body>
    </html>
  );
}
