import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Landmark } from "lucide-react";

import ReviewStars from "@/features/reviews/components/review-stars";
import { reviewsSummary } from "@/features/reviews/data/reviews";

/**
 * Slim trust bar shown just below the hero: a rating pill (links to /reviews)
 * and a headline scale stat (total value of documented contracts).
 */
export default async function ReviewsHeroStrip() {
  const t = await getTranslations("reviews");

  return (
    <div className="container -mt-4 flex flex-wrap items-center justify-center gap-3 pb-2">
      {/* Rating + trust — links to the reviews page */}
      <Link
        href="/reviews"
        className="group inline-flex items-center gap-2.5 rounded-full border border-border/60 bg-white/70 px-5 py-2.5 shadow-sm backdrop-blur-sm transition hover:border-brand/40 hover:shadow-md dark:bg-white/[0.05]"
      >
        <span className="text-lg font-extrabold text-brand">
          {reviewsSummary.average.toFixed(1)}
        </span>
        <ReviewStars rating={reviewsSummary.average} size={14} />
        <span className="text-sm font-semibold text-muted-foreground">
          {t("trustLabel")}
        </span>
        <ArrowLeft
          className="size-4 text-brand transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      {/* Scale stat — total documented contract value */}
      <div className="inline-flex items-center gap-3 rounded-full border border-border/60 bg-white/70 px-5 py-2.5 shadow-sm backdrop-blur-sm dark:bg-white/[0.05]">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Landmark className="size-4" aria-hidden="true" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-extrabold text-brand">
            {t("valueAmount")}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            {t("valueLabel")}
          </span>
        </span>
      </div>
    </div>
  );
}
