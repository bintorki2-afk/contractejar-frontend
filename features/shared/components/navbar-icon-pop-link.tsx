"use client";

import IntentLink from "@/components/navigation/intent-link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type NavbarIconPopLinkProps = {
  href: string;
  label: string;
  /** Colored icon that pops up above the word on hover/focus. */
  icon: ReactNode;
};

/**
 * A main-nav link where a colored icon emerges from above the word on hover
 * (and keyboard focus) with a springy pop. Used for العقارات / الطلبات.
 */
export default function NavbarIconPopLink({
  href,
  label,
  icon,
}: NavbarIconPopLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <IntentLink
      href={href}
      className={cn(
        "group relative inline-flex items-center font-bold outline-none transition-colors hover:text-brand focus-visible:text-brand",
        active ? "text-brand" : "text-black dark:text-white/85",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-3 left-1/2 flex size-7 -translate-x-1/2 translate-y-2 scale-50 items-center justify-center rounded-full bg-brand-background-green text-brand opacity-0 shadow-sm",
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group-hover:-top-7 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100",
          "group-focus-visible:-top-7 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100",
          "dark:bg-[#16352f] dark:text-[#48c0b8]",
        )}
      >
        {icon}
      </span>
      <span className="leading-none">{label}</span>
    </IntentLink>
  );
}
