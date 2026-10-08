import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Landmark } from "lucide-react";

import ReviewStars from "@/features/reviews/components/review-stars";
import ReviewsValueAmount from "@/features/reviews/components/reviews-value-amount";
import { reviewsSummary } from "@/features/reviews/data/reviews";

/**
 * Slim, single-line trust row shown under the hero CTAs: rating (links to
 * /reviews) and the total documented-contract value — quiet by design so it
 * supports the primary actions instead of competing with them.
 */
export default async function ReviewsHeroStrip() {
  const t = await getTranslations("reviews");

  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground lg:justify-start">
      <Link
        href="/reviews"
        className="group inline-flex min-h-10 items-center gap-2 transition hover:text-foreground"
      >
        <span className="text-base font-extrabold text-brand">
          {reviewsSummary.average.toFixed(1)}
        </span>
        <ReviewStars rating={reviewsSummary.average} size={13} />
        <span className="font-semibold">{t("trustLabel")}</span>
      </Link>

      <span aria-hidden="true" className="text-muted-foreground/40">
        •
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Landmark className="size-3.5 text-brand" aria-hidden="true" />
        <ReviewsValueAmount
          text={t("valueAmount")}
          className="font-extrabold text-brand"
        />
        <span className="font-semibold">{t("valueLabel")}</span>
      </span>
    </div>
  );
}
