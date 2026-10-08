import {
  CreditCard,
  FileCheck2,
  Inbox,
  MessageCircle,
  PartyPopper,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ORDER_JOURNEY_TEMPLATE } from "@/features/requests/data/order-journey";

const STEP_ICONS: Record<string, LucideIcon> = {
  received: Inbox,
  paid: CreditCard,
  under_review: SearchCheck,
  whatsapp_draft: MessageCircle,
  draft_reviewed: FileCheck2,
  ejar_authenticated: PartyPopper,
};

type OrderJourneySectionProps = {
  /** Hide the CTA row (e.g. on the guide page where the CTA already exists). */
  showCta?: boolean;
  /** Section heading level — `h2` on home, `h2` inside the guide too. */
  className?: string;
};

/**
 * «رحلة طلبك» — the 6-step order journey (ف2) as a marketing strip. Shared by
 * the home page and the guide so the customer sees the same steps that the
 * tracking/order screens show after submission.
 */
export default async function OrderJourneySection({
  showCta = true,
  className,
}: OrderJourneySectionProps) {
  const t = await getTranslations("orderJourney");

  return (
    <section className={className ?? "py-16 md:py-20"} aria-labelledby="order-journey-title">
      <div className="container space-y-8 md:space-y-12">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="rounded-full border bg-brand-secondary/10 px-4 py-1.5 text-sm font-bold text-brand">
            {t("badge")}
          </span>
          <h2
            id="order-journey-title"
            className="text-3xl font-bold leading-tight md:text-4xl 2xl:text-5xl"
          >
            <span className="text-foreground">{t("titlePrefix")} </span>
            <span className="text-brand-secondary">{t("titleAccent")}</span>
          </h2>
          <p className="text-sm leading-relaxed md:text-base">{t("description")}</p>
        </header>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDER_JOURNEY_TEMPLATE.map((step, index) => {
            const Icon = STEP_ICONS[step.key] ?? Inbox;
            const isFinal = index === ORDER_JOURNEY_TEMPLATE.length - 1;

            return (
              <li
                key={step.key}
                className="relative flex gap-4 rounded-3xl border border-border/60 bg-white p-5 shadow-sm dark:bg-white/[0.03]"
              >
                <span className="absolute top-4 inset-e-4 text-xs font-extrabold text-brand/40 dark:text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={
                    isFinal
                      ? "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white"
                      : "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-brand-secondary/15 dark:text-brand-secondary"
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-1 pe-6 text-start">
                  <span className="text-base font-extrabold text-brand dark:text-brand-secondary">
                    {step.label}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-600 dark:text-white/60">
                    {step.description}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mx-auto max-w-3xl rounded-2xl border border-brand/15 bg-brand-background-green px-5 py-4 text-center text-sm font-semibold leading-7 text-brand md:text-base dark:border-[#2f403b] dark:text-[#9eb5af]">
          {t("sentence")}
        </p>

        {showCta ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create-contract"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-white shadow-md transition hover:bg-brand/90"
            >
              {t("cta")}
            </Link>
            <Link
              href="/track"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-brand/25 px-6 text-sm font-bold text-brand transition hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8]"
            >
              {t("trackCta")}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
