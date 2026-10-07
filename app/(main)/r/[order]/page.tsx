import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";

import TrackOrderForm from "@/features/track-order/components/track-order-form";

type Props = { params: Promise<{ order: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { order } = await params;
  const t = await getTranslations("trackPage");
  return {
    title: t("smartLinkTitle", { order }),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

/**
 * Smart order link: `/r/{orderNumber}`. On a phone with the app installed the
 * OS opens the app instead (Universal / App Links via `.well-known`); here on
 * the web the order number is prefilled and only the mobile is asked for.
 */
export default async function SmartOrderLinkPage({ params }: Props) {
  const { order } = await params;
  const t = await getTranslations("trackPage");
  const safeOrder = decodeURIComponent(order).replace(/[^0-9A-Za-z-]/g, "").slice(0, 64);

  return (
    <main className="py-14 md:py-20">
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-brand-secondary/10 p-2 text-sm font-bold text-brand">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <Search className="size-4" aria-hidden="true" />
            </span>
            <span>{t("breadcrumb")}</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {t("smartLinkHeading")}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t("smartLinkSubtitle", { order: safeOrder })}
          </p>
        </div>

        <TrackOrderForm initialOrder={safeOrder} autoSubmitWhenReady />
      </div>
    </main>
  );
}
