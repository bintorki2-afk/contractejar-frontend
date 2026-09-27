import { Marquee } from "@/components/ui/marquee";
import ReviewCard from "@/features/reviews/components/review-card";
import type { Review, ReviewContractType } from "@/features/reviews/types/review";

type ReviewsTickerProps = {
  reviews: Review[];
  /** Localized labels for contract types. */
  contractTypeLabels: Record<ReviewContractType, string>;
};

/**
 * Moving strip of review cards. With enough reviews it shows two rows
 * drifting in opposite directions; with few, a single row. Pauses on hover.
 */
export default function ReviewsTicker({
  reviews,
  contractTypeLabels,
}: ReviewsTickerProps) {
  const useTwoRows = reviews.length >= 6;
  const mid = Math.ceil(reviews.length / 2);
  const rowOne = useTwoRows ? reviews.slice(0, mid) : reviews;
  const rowTwo = useTwoRows ? reviews.slice(mid) : [];

  const renderRow = (items: Review[], reverse: boolean) => (
    <Marquee
      pauseOnHover
      reverse={reverse}
      className="[--duration:60s] [--gap:1.25rem] py-1"
    >
      {items.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          contractTypeLabel={
            review.contractType
              ? contractTypeLabels[review.contractType]
              : undefined
          }
        />
      ))}
    </Marquee>
  );

  return (
    <div
      dir="rtl"
      className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_7%,black_93%,transparent)]"
    >
      <div className="flex flex-col gap-4">
        {renderRow(rowOne, false)}
        {rowTwo.length > 0 && renderRow(rowTwo, true)}
      </div>
    </div>
  );
}
