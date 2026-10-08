"use client";

import IntentLink from "@/components/navigation/intent-link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type NavbarMoreItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavbarMoreMenuProps = {
  label: string;
  items: NavbarMoreItem[];
};

/**
 * "المزيد" — a smart dropdown that opens on hover (with a small close delay so
 * the cursor can travel to the panel) and toggles on click, and closes on
 * outside-click, Escape, or route change. Keyboard and screen-reader friendly.
 */
export default function NavbarMoreMenu({ label, items }: NavbarMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Close whenever the route changes (a menu item was followed).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click or Escape while open.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  function cancelClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  }

  const anyActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-1 font-bold outline-none transition-colors hover:text-brand focus-visible:text-brand",
          open || anyActive ? "text-brand" : "text-black dark:text-white/85",
        )}
      >
        <span className="leading-none">{label}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-300",
            open ? "rotate-180" : "",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Wrapper starts flush under the button; its transparent top padding
          bridges the visual gap so hover doesn't drop between button and panel. */}
      <div
        className={cn(
          "absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3",
          open ? "visible" : "pointer-events-none invisible",
        )}
      >
        <div
          role="menu"
          className={cn(
            "origin-top overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-xl",
            "transition-all duration-200 ease-out dark:border-white/10 dark:bg-[#151c1b]",
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-1 scale-95 opacity-0",
          )}
        >
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <IntentLink
                key={item.href}
                href={item.href}
                role="menuitem"
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]"
                    : "text-foreground hover:bg-brand-background-green/60 hover:text-brand dark:hover:bg-[#16352f]",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
                  {item.icon}
                </span>
                <span className="leading-none">{item.label}</span>
              </IntentLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
