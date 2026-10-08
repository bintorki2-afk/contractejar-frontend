import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowLeft, Clock, LifeBuoy, Phone } from "lucide-react";

import JsonLd from "@/components/json-ld";
import WhatsappCtaLink from "@/features/analytics/components/whatsapp-cta-link";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/page-metadata";
import FooterSocialLinks from "@/features/footer/components/footer-social-links";
import { getAppSettings } from "@/features/settings/services/get-app-settings";
import {
  resolveFooterPhone,
  resolveFooterPhoneHref,
  resolveFooterSocialLinks,
  resolveFooterWhatsappHref,
} from "@/features/settings/utils/resolve-footer-contact";

type Topic = { title: string; desc: string; href: string };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("supportPage");
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/support",
  });
}

export default async function SupportPage() {
  const [t, settings] = await Promise.all([
    getTranslations("supportPage"),
    getAppSettings(),
  ]);
  const topics = t.raw("topics") as Topic[];
  const socialLinks = resolveFooterSocialLinks(settings);
  // رقم الدعم من إعدادات الخادم (whatsapp_contact) مع القيمة الاحتياطية الموحّدة.
  const whatsappHref = resolveFooterWhatsappHref(settings);
  const phoneDisplay = resolveFooterPhone(settings, "+966 59 750 0014");
  const phoneHref = resolveFooterPhoneHref(settings) ?? whatsappHref;

  return (
    <main className="py-14 md:py-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumbHome"), path: "/" },
          { name: t("breadcrumb"), path: "/support" },
        ])}
      />
      <div className="container flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <nav className="mx-auto text-xs text-muted-foreground">
            <Link href="/" className="inline-flex min-h-10 items-center px-1 transition hover:text-brand">
              {t("breadcrumbHome")}
            </Link>
            <span className="px-2">/</span>
            <span className="text-foreground">{t("breadcrumb")}</span>
          </nav>
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-brand-secondary/10 p-2 text-sm font-bold text-brand">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <LifeBuoy className="size-4" aria-hidden="true" />
            </span>
            <span>{t("breadcrumb")}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Contact channels */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground">
            {t("channelsTitle")}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {/* WhatsApp */}
            <WhatsappCtaLink
              placement="support_page"
              href={whatsappHref}
              className="group flex flex-col gap-3 rounded-3xl border border-border/60 bg-white p-7 shadow-sm transition hover:border-brand/40 hover:shadow-md dark:bg-white/[0.03]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                <FaWhatsapp className="size-6" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-foreground">
                {t("whatsappTitle")}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {t("whatsappDesc")}
              </span>
              <span className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-brand">
                {t("whatsappAction")}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              </span>
            </WhatsappCtaLink>

            {/* Phone */}
            <a
              href={phoneHref}
              className="group flex flex-col gap-3 rounded-3xl border border-border/60 bg-white p-7 shadow-sm transition hover:border-brand/40 hover:shadow-md dark:bg-white/[0.03]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Phone className="size-6" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-foreground">
                {t("phoneTitle")}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {t("phoneDesc")}
              </span>
              <span className="mt-1 text-sm font-bold text-brand" dir="ltr">
                {phoneDisplay}
              </span>
            </a>

            {/* Hours */}
            <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-white p-7 shadow-sm dark:bg-white/[0.03]">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Clock className="size-6" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-foreground">
                {t("hoursTitle")}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {t("hoursWeekdays")}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {t("hoursSaturday")}
              </span>
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="rounded-3xl border border-border/60 bg-white p-6 dark:bg-white/[0.03]">
              <FooterSocialLinks label={t("socialTitle")} links={socialLinks} />
            </div>
          )}
        </section>

        {/* Help topics */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground">
            {t("topicsTitle")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {topics.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="group flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-white p-6 shadow-sm transition hover:border-brand/40 hover:shadow-md dark:bg-white/[0.03]"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold text-foreground">
                    {topic.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {topic.desc}
                  </span>
                </span>
                <ArrowLeft className="size-5 shrink-0 text-brand transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-5 rounded-3xl bg-brand px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-extrabold md:text-3xl">{t("ctaTitle")}</h2>
          <Link
            href="/create-contract"
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand shadow-md transition hover:brightness-95"
          >
            {t("ctaButton")}
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
