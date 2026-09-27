import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowUpLeft,
  Check,
  ChevronLeft,
  Clock,
  MessageCircle,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import ServiceTabs from "@/features/service-page/components/service-tabs";
import { getWhatsappHref } from "@/features/settings/services/get-whatsapp-href";

type ServiceType = "residential" | "commercial";

function resolveType(value: string): ServiceType | null {
  return value === "residential" || value === "commercial" ? value : null;
}

export function generateStaticParams() {
  return [{ type: "residential" }, { type: "commercial" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const key = resolveType(type);
  if (!key) return {};
  const t = await getTranslations("servicePage");
  return {
    title: t(`${key}.title`),
    description: t(`${key}.description`),
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const key = resolveType(type);
  if (!key) notFound();

  const [t, whatsappHref] = await Promise.all([
    getTranslations("servicePage"),
    getWhatsappHref(),
  ]);

  const features = t.raw(`${key}.features`) as string[];
  const steps = t.raw(`${key}.steps`) as string[];
  const requirements = t.raw(`${key}.requirements`) as string[];
  const faq = t.raw(`${key}.faq`) as { q: string; a: string }[];
  const createHref = `/create-contract?id=${key}`;

  const sidebarRows = [
    {
      icon: <Users className="size-4" aria-hidden="true" />,
      title: t("sidebar.eligibilityTitle"),
      value: t(`${key}.eligibility`),
    },
    {
      icon: <Clock className="size-4" aria-hidden="true" />,
      title: t("sidebar.responseTitle"),
      value: t(`${key}.responseTime`),
    },
    {
      icon: <Wallet className="size-4" aria-hidden="true" />,
      title: t("sidebar.feeTitle"),
      value: t(`${key}.fee`),
    },
  ];

  return (
    <main className="py-10 md:py-14">
      <div className="container">
        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="transition-colors hover:text-brand">
            {t("breadcrumbHome")}
          </Link>
          <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          <span className="font-semibold text-foreground">
            {t(`${key}.title`)}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* Main */}
          <div className="min-w-0 space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-background px-3 py-1.5 text-xs font-bold text-brand">
                <ShieldCheck className="size-4" aria-hidden="true" />
                {t("badge")}
              </span>
              <h1 className="text-3xl font-extrabold leading-tight text-brand md:text-4xl">
                {t(`${key}.title`)}
              </h1>
              <Link
                href={createHref}
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand/90 hover:shadow-lg hover:shadow-brand/25"
              >
                <span>{t(`${key}.cta`)}</span>
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
                {t("descTitle")}
              </h2>
              <p className="text-sm leading-8 text-muted-foreground md:text-base">
                {t(`${key}.description`)}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">
                {t("featuresTitle")}
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
                  steps: t("tabs.steps"),
                  requirements: t("tabs.requirements"),
                  faq: t("tabs.faq"),
                }}
                steps={steps}
                requirements={requirements}
                faq={faq}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-5 rounded-3xl border border-border/60 bg-white p-6 shadow-sm dark:bg-[#121a18]">
              {sidebarRows.map((row) => (
                <div key={row.title} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-background text-brand">
                    {row.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand">{row.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-foreground">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t border-border/60 pt-5">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand/20 bg-brand-background px-4 py-3 text-sm font-bold text-brand transition hover:bg-brand-background-green/60"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  {t("sidebar.channelValue")}
                </a>
              </div>

              <div className="border-t border-border/60 pt-5">
                <p className="mb-3 text-xs font-bold text-brand">
                  {t("sidebar.linksTitle")}
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/faq"
                      className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-brand"
                    >
                      <ChevronLeft
                        className="size-3.5 rtl:rotate-180"
                        aria-hidden="true"
                      />
                      {t("sidebar.linkFaq")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-brand"
                    >
                      <ChevronLeft
                        className="size-3.5 rtl:rotate-180"
                        aria-hidden="true"
                      />
                      {t("sidebar.linkTerms")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-brand"
                    >
                      <ChevronLeft
                        className="size-3.5 rtl:rotate-180"
                        aria-hidden="true"
                      />
                      {t("sidebar.linkBlog")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
