"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/features/shared/theme/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Light/dark theme toggle for the public site header.
 *
 * The visible icon is driven purely by the `.dark` class on <html> via CSS,
 * not by JS state, so the server-rendered markup and the first client render
 * are identical — this avoids the hydration mismatch that happens because the
 * server always assumes "light" while the client may already be "dark".
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="تبديل بين الوضع الفاتح والداكن"
      title="تبديل بين الوضع الفاتح والداكن"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors",
        "border-[#e4e4e4] bg-white text-brand hover:bg-brand-background",
        "dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#16352f]",
        className,
      )}
    >
      {/* Shown in light mode, hidden in dark mode (CSS-driven, no JS state) */}
      <Moon className="size-[18px] shrink-0 dark:hidden" aria-hidden />
      {/* Hidden in light mode, shown in dark mode */}
      <Sun className="hidden size-[18px] shrink-0 dark:block" aria-hidden />
    </button>
  );
}
