import { Quote } from "lucide-react";

import ReviewStars from "@/features/reviews/components/review-stars";
import type { Review } from "@/features/reviews/types/review";

type ReviewCardProps = {
  review: Review;
  /** Localized label for the contract type, if any. */
  contractTypeLabel?: string;
};

/** Return an "initials" avatar seed (first non-space grapheme). */
function firstLetter(name: string) {
  const trimmed = name.trim();
  return trimmed ? Array.from(trimmed)[0] : "?";
}

export default function ReviewCard({ review, contractTypeLabel }: ReviewCardProps) {
  return (
    <figure className="flex h-full w-80 max-w-[85vw] shrink-0 flex-col gap-4 rounded-3xl border border-black/[0.06] bg-white p-6 text-start shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:ring-white/[0.03]">
      <div className="flex items-center justify-between">
        <ReviewStars rating={review.rating} />
        <Quote
          className="size-6 text-brand-secondary/25"
          aria-hidden="true"
        />
      </div>

      <blockquote className="grow text-sm leading-relaxed text-foreground/90">
        {review.text}
      </blockquote>

      <figcaption className="flex items-center gap-3 border-t border-border/50 pt-4">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-base font-extrabold text-brand"
          aria-hidden="true"
        >
          {firstLetter(review.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">
            {review.name}
          </span>
          {(review.city || contractTypeLabel) && (
            <span className="block truncate text-xs text-muted-foreground">
              {[review.city, contractTypeLabel].filter(Boolean).join(" · ")}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
