"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/features/shared/theme/theme-provider";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  lightLabel?: string;
  darkLabel?: string;
};

/** Light/dark theme toggle for the public site header. */
export default function ThemeToggle({
  className,
  lightLabel = "الوضع الفاتح",
  darkLabel = "الوضع الداكن",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? lightLabel : darkLabel}
      title={isDark ? lightLabel : darkLabel}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors",
        "border-[#e4e4e4] bg-white text-brand hover:bg-brand-background",
        "dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#16352f]",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-[18px] shrink-0" aria-hidden />
      ) : (
        <Moon className="size-[18px] shrink-0" aria-hidden />
      )}
    </button>
  );
}
