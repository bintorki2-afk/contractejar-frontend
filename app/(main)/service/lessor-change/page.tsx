import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeftRight,
  ArrowUpLeft,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Info,
  MessageCircle,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import ServiceTabs from "@/features/service-page/components/service-tabs";
import { getLessorChangeInfo } from "@/features/lessor-change/services/get-lessor-change-info";
import { FALLBACK_LESSOR_CHANGE_INFO } from "@/features/lessor-change/types/lessor-change";
import { getContractPricing } from "@/features/pricing/services/get-contract-pricing";
import { getWhatsappHref } from "@/features/settings/services/get-whatsapp-href";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lessorChange.landing");
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/service/lessor-change" },
  };
}

/** Fee from `/lessor-change/info`, then `/pricing.lessor_change_fee`, then the static fallback. */
async function resolveLessorChangeInfo() {
  const info = await getLessorChangeInfo().catch(() => null);
  if (info) {
    return info;
  }

  const pricing = await getContractPricing().catch(() => null);
  return {
    ...FALLBACK_LESSOR_CHANGE_INFO,
    fee: pricing?.lessor_change_fee ?? FALLBACK_LESSOR_CHANGE_INFO.fee,
  };
}

export default async function LessorChangeServicePage() {
  const [t, tService, whatsappHref, info] = await Promise.all([
    getTranslations("lessorChange.landing"),
    getTranslations("servicePage"),
    getWhatsappHref().catch(() => "https://wa.me/"),
    resolveLessorChangeInfo(),
  ]);

  const features = t.raw("features") as string[];
  const steps = t.raw("steps") as string[];
  const staticRequirements = t.raw("requirements") as string[];
  const requirements =
    info.required.length > 0 ? info.required.map((item) => item.label) : staticRequirements;
  const faq = t.raw("faq") as { q: string; a: string }[];
  const feeText = t("fee", { fee: info.fee.toLocaleString("en-US") });

  const sidebarRows = [
    {
      icon: <Users className="size-4" aria-hidden="true" />,
      title: tService("sidebar.eligibilityTitle"),
      value: t("eligibility"),
    },
    {
      icon: <Clock className="size-4" aria-hidden="true" />,
      title: tService("sidebar.responseTitle"),
      value: t("responseTime"),
    },
    {
      icon: <Wallet className="size-4" aria-hidden="true" />,
      title: tService("sidebar.feeTitle"),
      value: feeText,
    },
  ];

  return (
    <main className="py-10 md:py-14">
      <div className="container">
        <nav
          aria-label="breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-brand">
            {tService("breadcrumbHome")}
          </Link>
          <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          <span className="font-semibold text-foreground">{t("title")}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-background px-3 py-1.5 text-xs font-bold text-brand">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {tService("badge")}
              </span>
              <h1 className="flex items-center gap-3 text-3xl font-extrabold leading-tight text-brand md:text-4xl">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-background-green text-brand">
                  <ArrowLeftRight className="size-5" aria-hidden="true" />
                </span>
                {t("title")}
              </h1>
              <Link
                href="/lessor-change"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25"
              >
                <span>{t("cta")}</span>
                <span className="flex size-7 items-center justify-center rounded-full bg-white text-brand">
                  <ArrowUpLeft
                    className="size-4 transition-transform duration-300 group-hover:-rotate-45"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                {tService("descTitle")}
              </h2>
              <p className="text-sm leading-8 text-muted-foreground md:text-base">
                {t("description")}
              </p>
              <p className="flex items-start gap-2 rounded-2xl border border-[#f1e3c4] bg-[#fdf8ee] px-4 py-3 text-sm font-semibold leading-6 text-[#6f5b3d] dark:border-[#4a3a22] dark:bg-[#2b2316] dark:text-[#e5c892]">
                <Info className="mt-1 size-4 shrink-0 text-[#c9962e]" aria-hidden="true" />
                <span>{info.notice}</span>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                {tService("featuresTitle")}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-2xl border border-border/60 bg-white p-3.5 dark:bg-[#121a18]"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-background text-brand">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium leading-6 text-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-border/60 bg-white p-5 dark:bg-[#121a18] md:p-6">
              <ServiceTabs
                labels={{
                  steps: tService("tabs.steps"),
                  requirements: tService("tabs.requirements"),
                  faq: tService("tabs.faq"),
                }}
                steps={steps}
                requirements={requirements}
                faq={faq}
              />
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-5 rounded-3xl border border-border/60 bg-white p-6 shadow-sm dark:bg-[#121a18]">
              <div className="rounded-2xl bg-brand-background-green px-4 py-4 text-center">
                <p className="text-xs font-bold text-brand">{tService("sidebar.feeTitle")}</p>
                <p className="mt-1 text-3xl font-extrabold text-brand">{feeText}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("feeNote")}</p>
              </div>

              {sidebarRows.map((row) => (
                <div key={row.title} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-background text-brand">
                    {row.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand">{row.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-foreground">{row.value}</p>
                  </div>
                </div>
              ))}

              <div className="border-t border-border/60 pt-5">
                <Link
                  href="/lessor-change"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand/90"
                >
                  <FileText className="size-4" aria-hidden="true" />
                  {t("cta")}
                </Link>
              </div>

              <div className="border-t border-border/60 pt-5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand-background px-4 py-3 text-sm font-bold text-brand transition hover:bg-brand-background-green/60"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {tService("sidebar.channelValue")}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
