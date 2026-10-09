import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";

import { buildInvoiceDialogLabels } from "@/features/requests/utils/invoice-dialog-labels";
import TrackOrderForm from "@/features/track-order/components/track-order-form";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trackPage");
  // Transactional page: reachable, but kept out of the index.
  return buildPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/track",
    noindex: true,
  });
}

/**
 * Order tracking without an account: order number + the mobile used on the
 * order. The backend only answers when both match, and returns the status
 * summary only (no identity data, no attachments).
 */
export default async function TrackOrderPage() {
  const [t, tInvoice] = await Promise.all([
    getTranslations("trackPage"),
    getTranslations("requests.card.invoiceDialog"),
  ]);
  const invoiceLabels = buildInvoiceDialogLabels(tInvoice);

  return (
    <main className="py-14 md:py-20">
      <div className="container flex flex-col gap-10">
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
              <Search className="size-4" aria-hidden="true" />
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

        <TrackOrderForm invoiceLabels={invoiceLabels} />
      </div>
    </main>
  );
}
