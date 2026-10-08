import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

import JsonLd from "@/components/json-ld";
import GuideTutorialsSection from "@/features/guide/components/guide-tutorials-section";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/page-metadata";
import OrderJourneySteps from "@/features/requests/components/order-journey-steps";
import { buildNeutralJourney } from "@/features/requests/data/order-journey";

type Step = { title: string; desc: string };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("guidePage");
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/guide",
  });
}

export default async function GuidePage() {
  const t = await getTranslations("guidePage");
  const steps = t.raw("steps") as Step[];
  const docs = t.raw("docs") as string[];
  const tips = t.raw("tips") as string[];

  return (
    <main className="py-14 md:py-20">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumbHome"), path: "/" },
          { name: t("breadcrumb"), path: "/guide" },
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
              <BookOpen className="size-4" aria-hidden="true" />
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

        {/* Steps */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-foreground">
            {t("stepsTitle")}
          </h2>
          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-3xl border border-border/60 bg-white p-6 shadow-sm dark:bg-white/[0.03]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold text-foreground">
                    {step.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* رحلة الطلب بعد الإرسال (ف2) — نفس الخطوات الست التي يراها العميل في التتبّع */}
        <section className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-white p-7 shadow-sm dark:bg-white/[0.03]">
          <div className="flex flex-col gap-2">
            <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
              <CheckCircle2 className="size-6 text-brand" aria-hidden="true" />
              {t("journeyTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("journeySubtitle")}</p>
          </div>
          <OrderJourneySteps steps={buildNeutralJourney()} showSentence neutral />
        </section>

        {/* Docs + Tips */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-white p-7 shadow-sm dark:bg-white/[0.03]">
            <h2 className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
              <FileText className="size-5 text-brand" aria-hidden="true" />
              {t("docsTitle")}
            </h2>
            <ul className="flex flex-col gap-3">
              {docs.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-brand-background p-7 shadow-sm dark:bg-white/[0.03]">
            <h2 className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
              <Lightbulb className="size-5 text-brand" aria-hidden="true" />
              {t("tipsTitle")}
            </h2>
            <ul className="flex flex-col gap-3">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Tutorials (config: features/guide/tutorials.ts) */}
        <GuideTutorialsSection
          labels={{
            title: t("tutorials.title"),
            subtitle: t("tutorials.subtitle"),
            comingSoon: t("tutorials.comingSoon"),
            watch: t("tutorials.watch"),
          }}
        />

        {/* CTA */}
        <section className="flex flex-col items-center gap-5 rounded-3xl bg-brand px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-extrabold md:text-3xl">{t("ctaTitle")}</h2>
          <p className="max-w-xl text-white/85">{t("ctaDesc")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create-contract"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-brand shadow-md transition hover:brightness-95"
            >
              {t("ctaButton")}
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {t("supportButton")}
            </Link>
          </div>
        </section>

        {/* FAQ link */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="inline-flex items-center gap-2 text-lg font-bold text-foreground">
            <HelpCircle className="size-5 text-brand" aria-hidden="true" />
            {t("faqTitle")}
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-bold text-brand transition hover:border-brand hover:bg-brand-background"
          >
            {t("faqButton")}
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
