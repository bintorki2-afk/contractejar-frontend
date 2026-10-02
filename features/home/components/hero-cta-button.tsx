"use client";

import { ArrowUpLeft } from "lucide-react";

import CustomIcon from "@/features/shared/components/custom-icon";
import { cn } from "@/lib/utils";

type HeroCtaButtonProps = {
  label: string;
  iconSrc: string;
  featured?: boolean;
};

export default function HeroCtaButton({
  label,
  iconSrc,
  featured = false,
}: HeroCtaButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex h-12 w-full min-w-0 items-center gap-2.5 rounded-full bg-brand px-3 ps-4 pe-2.5 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25 active:translate-y-0 sm:h-14 sm:gap-3 sm:px-2 sm:pe-2 sm:ps-4 2xl:ps-5",
        // In dark mode the forest-green brand fill recedes into the deep
        // background, so use the brighter brand-secondary so the primary CTAs pop.
        "dark:bg-brand-secondary dark:text-[#06231c] dark:hover:bg-brand-secondary/90 dark:hover:shadow-brand-secondary/30",
        featured &&
          "shadow-[0_0_24px_rgba(13,179,139,0.35)] ring-1 ring-brand-secondary/50 dark:shadow-[0_0_28px_rgba(0,168,128,0.5)]"
      )}
    >
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full sm:size-6 lg:size-8 dark:bg-white/20 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:ring-1 dark:ring-inset dark:ring-white/40 dark:backdrop-blur-sm">
        <CustomIcon
          src={iconSrc}
          className="text-white dark:text-[#06231c] [&_svg]:size-4 sm:[&_svg]:size-3 lg:[&_svg]:size-4"
        />
      </span>

      <span className="min-w-0 flex-1 text-center text-sm font-semibold leading-tight sm:text-xs lg:text-sm">
        {label}
      </span>

      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white sm:size-6 lg:size-8 dark:bg-white/20 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:ring-1 dark:ring-inset dark:ring-white/40 dark:backdrop-blur-sm">
        <ArrowUpLeft
          className="size-4 text-brand dark:text-[#06231c] transition-transform duration-300 group-hover:-rotate-45 sm:size-3 lg:size-4"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
