"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "aqdi-cookie-consent";
const CONSENT_EVENT = "aqdi-cookie-consent-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getIsDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // localStorage unavailable (private mode, blocked cookies, etc.).
    return false;
  }
}

// Server + hydration render: treat as not-dismissed so the markup matches;
// the real localStorage value is read right after hydration via getSnapshot.
function getServerIsDismissed(): boolean {
  return false;
}

/**
 * Dismissible cookie / tracking notice (PDPL-friendly, Arabic RTL).
 *
 * Only shown when tracking is actually active (`NEXT_PUBLIC_GTM_ID` set).
 * Dismissal is remembered in localStorage; reads/writes are guarded so a
 * blocked or unavailable localStorage never breaks the page. `useSyncExternalStore`
 * keeps SSR and hydration in sync without touching the DOM before mount.
 */
// In the order/payment flows the bottom of the screen holds the primary
// buttons («لنبدأ / متابعة / إرسال الطلب / ادفع») — the notice goes on top there.
const FLOW_PATH_PREFIXES = ["/create-contract", "/lessor-change", "/payment", "/login", "/track", "/r"];

export default function CookieNotice() {
  const t = useTranslations("cookieNotice");
  const pathname = usePathname() ?? "";
  const onFlow = FLOW_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const dismissed = useSyncExternalStore(
    subscribe,
    getIsDismissed,
    getServerIsDismissed,
  );

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore write failures — the notice still closes for this session.
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }, []);

  if (!process.env.NEXT_PUBLIC_GTM_ID) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={
        onFlow
          ? "pointer-events-none fixed inset-x-0 top-0 z-[60] px-4 pt-4 sm:px-6 sm:pt-6"
          : "pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 pb-safe sm:px-6 sm:pb-6"
      }
    >
      <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-brand/20 bg-white p-4 shadow-lg shadow-black/5 sm:flex-row sm:items-center sm:gap-4 dark:border-[#2f403b] dark:bg-[#1a2421]">
        <p className="flex-1 text-sm leading-relaxed text-[#4a4a4a] dark:text-[#c9d6d1]">
          {t("message")}{" "}
          <Link
            href="/privacy"
            className="font-semibold text-brand underline-offset-4 transition hover:underline dark:text-[#48c0b8]"
          >
            {t("learnMore")}
          </Link>
        </p>

        <button
          type="button"
          onClick={accept}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-brand px-6 text-sm font-extrabold text-white transition-opacity hover:opacity-90 dark:bg-[#0f6b5c]"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
