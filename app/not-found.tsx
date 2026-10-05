import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import NavbarLogo from "@/features/shared/components/navbar-logo";

/**
 * Custom 404 page. Rendered by Next.js for unmatched routes and explicit
 * notFound() calls, with a proper 404 status. Branded, RTL, light/dark aware,
 * and bilingual via next-intl. Lives at the app root so it also catches
 * top-level unknown URLs.
 */
export default async function NotFound() {
  const t = await getTranslations("notFound");

  const quickLinks = [
    { href: "/blog", label: t("linkBlog") },
    { href: "/faq", label: t("linkFaq") },
    { href: "/support", label: t("linkSupport") },
    { href: "/about", label: t("linkAbout") },
  ];

  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 py-16">
      {/* Soft brand glow behind the content */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl dark:bg-brand/25"
      />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2"
          aria-label="عقد إيجار"
        >
          <NavbarLogo />
          <span className="text-lg font-bold text-brand">عقد إيجار</span>
        </Link>

        <span className="mb-4 inline-flex items-center rounded-full bg-brand-background-green px-3 py-1 text-xs font-semibold text-brand">
          {t("eyebrow")}
        </span>

        <p
          aria-hidden
          className="bg-gradient-to-b from-brand to-brand-secondary bg-clip-text text-[6rem] leading-none font-black text-transparent select-none sm:text-[8rem]"
        >
          ٤٠٤
        </p>

        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          {t("description")}
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 text-sm font-medium text-white transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {t("homeCta")}
          </Link>
          <Button asChild size="lg" variant="outline" className="h-11 px-6">
            <Link href="/service/residential">{t("createCta")}</Link>
          </Button>
        </div>

        <div className="mt-10 w-full border-t border-border pt-6">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {t("linksTitle")}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-brand transition-colors hover:text-brand-secondary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
