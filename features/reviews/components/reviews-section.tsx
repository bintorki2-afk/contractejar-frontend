import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Star } from "lucide-react";

import ReviewStars from "@/features/reviews/components/review-stars";
import ReviewsEmptyState from "@/features/reviews/components/reviews-empty-state";
import ReviewsTicker from "@/features/reviews/components/reviews-ticker";
import { reviews, reviewsSummary } from "@/features/reviews/data/reviews";
import type { ReviewContractType } from "@/features/reviews/types/review";

export default async function ReviewsSection() {
  const t = await getTranslations("reviews");

  // Summary reflects the full review base; the ticker shows a varied sample.
  const count = reviewsSummary.total || reviews.length;
  const average =
    reviewsSummary.average ||
    (reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0);

  const contractTypeLabels: Record<ReviewContractType, string> = {
    residential: t("contractType.residential"),
    commercial: t("contractType.commercial"),
  };

  return (
    <section className="py-16 md:py-20">
      <div className="container flex flex-col gap-10 md:gap-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-brand-secondary/10 p-2 text-sm font-bold text-brand">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <Star className="size-4 fill-current" aria-hidden="true" />
            </span>
            <span>{t("badge")}</span>
          </div>

          <h2 className="text-3xl font-bold leading-tight md:text-4xl 2xl:text-5xl">
            <span className="text-black dark:text-white/90">
              {t("titlePrefix")}
            </span>{" "}
            <span className="text-brand-secondary">{t("titleAccent")}</span>
          </h2>

          <p className="text-base leading-relaxed text-gray-600 dark:text-white/60">
            {t("description")}
          </p>

          {count > 0 && (
            <div className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-sm dark:bg-white/[0.04]">
              <span className="text-3xl font-extrabold text-brand">
                {average.toFixed(1)}
              </span>
              <span className="flex flex-col items-start gap-0.5">
                <ReviewStars rating={average} size={15} />
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("summary", { count })}
                </span>
              </span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <>
            <ReviewsTicker
              reviews={reviews}
              contractTypeLabels={contractTypeLabels}
            />
            <div className="flex justify-center">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-bold text-brand transition hover:border-brand hover:bg-brand-background"
              >
                {t("viewAll")}
                <ArrowLeft className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <ReviewsEmptyState
            title={t("empty.title")}
            description={t("empty.description")}
            cta={t("empty.cta")}
            ctaHref="/create-contract"
          />
        )}
      </div>
    </section>
  );
}
