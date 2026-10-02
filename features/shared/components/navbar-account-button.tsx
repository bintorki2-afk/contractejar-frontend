"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import UserSheet from "@/features/auth/components/user-sheet";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { getUserInitials } from "@/features/auth/utils/get-user-initials";
import { cn } from "@/lib/utils";

type NavbarAccountButtonProps = {
  className?: string;
};

/**
 * Header account control: a "login" pill when signed out, or the customer's
 * initials avatar (linking to their profile) when signed in. Auth state comes
 * from the persisted store, so it's gated on mount to avoid hydration flicker.
 */
export default function NavbarAccountButton({
  className,
}: NavbarAccountButtonProps) {
  const t = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Intentional mount gate: render the signed-out markup on the first client
    // paint (matching SSR) before reflecting the persisted auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (mounted && user) {
    const displayName = user.name || user.full_name || user.fname || "";

    return (
      <UserSheet>
        <button
          type="button"
          aria-label={t("account")}
          title={displayName || t("account")}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-sm font-bold text-brand transition-colors hover:bg-brand-background-green/80 dark:bg-[#16352f] dark:text-[#48c0b8]",
            className,
          )}
        >
          {getUserInitials(displayName) || "٠"}
        </button>
      </UserSheet>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 rounded-full border border-brand/25 px-5 text-sm font-semibold text-brand transition-colors hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8] dark:hover:bg-[#16352f]",
        className,
      )}
    >
      <LogIn className="size-4" aria-hidden="true" />
      <span>{t("login")}</span>
    </Link>
  );
}
