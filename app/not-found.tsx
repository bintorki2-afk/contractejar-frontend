import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * Custom 404 page. Rendered by Next.js for unmatched routes and explicit
 * notFound() calls (with a proper 404 status). Branded with the real shield
 * mark, RTL, light/dark aware, bilingual via next-intl.
 */
export default async function NotFound() {
  const [t, tNav] = await Promise.all([
    getTranslations("notFound"),
    getTranslations("navbar"),
  ]);

  const quickLinks = [
    { href: "/blog", label: t("linkBlog") },
    { href: "/faq", label: t("linkFaq") },
    { href: "/support", label: t("linkSupport") },
    { href: "/about", label: t("linkAbout") },
  ];

  return (
    <main className="relative flex min-h-[100svh] items-center justify-center px-5 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute start-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/5 blur-3xl dark:bg-brand/15" />
      </div>

      <section className="relative w-full max-w-lg rounded-3xl border border-border bg-card/85 px-6 py-10 text-center shadow-sm backdrop-blur-sm sm:px-12 sm:py-14">
        {/* Brand crest with a faint 404 watermark behind it */}
        <Link
          href="/"
          aria-label={tNav("brand.name")}
          className="group relative mx-auto mb-6 flex h-28 w-full flex-col items-center justify-center gap-3"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -top-2 text-[7.5rem] leading-none font-black text-brand/[0.06] select-none dark:text-white/[0.06]"
          >
            ٤٠٤
          </span>
          <span className="relative flex size-20 items-center justify-center rounded-2xl bg-brand-background-green ring-1 ring-brand/10 transition-transform group-hover:-translate-y-0.5">
            <Image
              src="/images/logo.png"
              alt=""
              width={120}
              height={184}
              className="h-11 w-auto object-contain"
              aria-hidden
            />
          </span>
          <span className="relative text-base font-bold text-brand">
            {tNav("brand.name")}
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-foreground sm:text-[1.75rem]">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {t("homeCta")}
          </Link>
          <Link
            href="/service/residential"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {t("createCta")}
          </Link>
        </div>

        <div className="mt-9 border-t border-border/70 pt-6">
          <p className="mb-3 text-xs text-muted-foreground">{t("linksTitle")}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-brand transition-colors hover:text-brand-secondary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
