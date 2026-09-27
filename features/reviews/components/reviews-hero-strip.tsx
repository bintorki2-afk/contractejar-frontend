import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import ReviewStars from "@/features/reviews/components/review-stars";
import { reviewsSummary } from "@/features/reviews/data/reviews";

/** Slim trust bar shown just below the hero: rating + count, links to /reviews. */
export default async function ReviewsHeroStrip() {
  const t = await getTranslations("reviews");

  return (
    <div className="container -mt-4 flex justify-center pb-2">
      <Link
        href="/reviews"
        className="group inline-flex items-center gap-3 rounded-full border border-border/60 bg-white/70 px-5 py-2.5 shadow-sm backdrop-blur-sm transition hover:border-brand/40 hover:shadow-md dark:bg-white/[0.05]"
      >
        <span className="text-lg font-extrabold text-brand">
          {reviewsSummary.average.toFixed(1)}
        </span>
        <ReviewStars rating={reviewsSummary.average} size={15} />
        <span className="text-sm font-semibold text-muted-foreground">
          {t("heroStrip", { count: reviewsSummary.total })}
        </span>
        <ArrowLeft
          className="size-4 text-brand transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
