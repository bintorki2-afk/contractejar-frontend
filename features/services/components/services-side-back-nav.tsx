"use client";

import { ArrowRight, Home, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { useServicesPageMeta } from "@/features/services/components/services-page-provider";
import { useTheme } from "@/features/shared/theme/theme-provider";
import { setServicesFlowDarkMode } from "@/lib/ui/set-services-flow-dark-mode";
import { cn } from "@/lib/utils";

const pillBaseClassName =
  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition-colors";

export default function ServicesSideBackNav() {
  const { meta } = useServicesPageMeta();
  const router = useRouter();
  const t = useTranslations("services.nav");
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    setServicesFlowDarkMode({
      enabled: isDarkMode,
      shellClass: "services-dark-shell",
    });

    return () => {
      setServicesFlowDarkMode({
        enabled: false,
        shellClass: "services-dark-shell",
      });
    };
  }, [isDarkMode]);

  if (!meta || meta.hideBack) {
    return null;
  }

  const pageMeta = meta;
  const backHref = pageMeta.backHref ?? "/";
  const isHomeLink =
    !pageMeta.useRouterBack && (backHref === "/" || backHref === "");
  const homeLabel = isHomeLink ? t("home") : pageMeta.backLabel;
  const hasTrailing = Boolean(pageMeta.pageBadge || pageMeta.pageAction);

  function renderBackControl() {
    const className = cn(
      pillBaseClassName,
      "bg-brand-background-green text-brand hover:bg-brand-background-green/80 dark:bg-[#0e312a] dark:text-[#00a880] dark:hover:bg-[#124038]",
    );

    const icon = isHomeLink ? (
      <Home className="size-4 shrink-0" aria-hidden="true" />
    ) : (
      <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
    );

    if (pageMeta.useRouterBack) {
      return (
        <button
          type="button"
          aria-label={pageMeta.backLabel}
          onClick={() => router.back()}
          className={className}
        >
          {icon}
          {homeLabel}
        </button>
      );
    }

    return (
      <Link
        href={backHref}
        aria-label={pageMeta.backLabel}
        className={className}
      >
        {icon}
        {homeLabel}
      </Link>
    );
  }

  return (
    <aside className="mb-4 sm:mb-5">
      <div className="flex w-full flex-wrap items-center gap-2 rounded-full bg-white p-2 shadow-sm dark:border dark:border-[#262d2c] dark:bg-[#151c1b]">
        {renderBackControl()}

        {pageMeta.pageTitle ? (
          <span
            className={cn(
              pillBaseClassName,
              "max-w-[min(100%,14rem)] truncate bg-[#fff1e6] text-[#e67e22] sm:max-w-xs dark:border dark:border-[#6b4e2e] dark:bg-[#2a2118] dark:text-[#c4a574]",
            )}
            title={pageMeta.pageTitle}
          >
            {pageMeta.pageTitle}
          </span>
        ) : null}

        {hasTrailing ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {pageMeta.pageBadge ? (
              <span className="truncate text-xs font-semibold text-brand sm:text-sm dark:text-[#00a880]">
                {pageMeta.pageBadge}
              </span>
            ) : null}

            {pageMeta.pageAction ? (
              <Link
                href={pageMeta.pageAction.href}
                className={cn(
                  pillBaseClassName,
                  "bg-brand text-white hover:bg-brand/90",
                )}
              >
                {pageMeta.pageAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          aria-label={isDarkMode ? t("light") : t("dark")}
          aria-pressed={isDarkMode}
          onClick={toggleTheme}
          className={cn(
            pillBaseClassName,
            "ms-auto border border-[#e4e4e4] bg-white text-brand hover:bg-brand-background",
            isDarkMode &&
              "border-[#00a880] bg-[#00a880] text-white hover:bg-[#00a880]/90",
          )}
        >
          {isDarkMode ? (
            <Sun className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <Moon className="size-4 shrink-0" aria-hidden="true" />
          )}
          {isDarkMode ? t("light") : t("dark")}
        </button>
      </div>
    </aside>
  );
}
