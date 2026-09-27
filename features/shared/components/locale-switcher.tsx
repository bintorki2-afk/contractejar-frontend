"use client";

import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  className?: string;
};

/**
 * Header language toggle (Arabic ⇄ English).
 *
 * Stores the choice in the NEXT_LOCALE cookie and reloads so the server
 * re-renders in the chosen language and direction (RTL/LTR). No URL change.
 */
export default function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const nextLocale = locale === "ar" ? "en" : "ar";
  // Label shows the language you'd switch TO.
  const label = nextLocale === "en" ? "English" : "العربية";
  const shortLabel = nextLocale === "en" ? "EN" : "ع";

  function switchLocale() {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    // Full reload guarantees <html lang/dir> and all server text update cleanly.
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={`${label}`}
      title={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-bold transition-colors",
        "border-[#e4e4e4] bg-white text-brand hover:bg-brand-background",
        "dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#16352f]",
        className,
      )}
    >
      <span aria-hidden className="leading-none">
        {shortLabel}
      </span>
    </button>
  );
}
