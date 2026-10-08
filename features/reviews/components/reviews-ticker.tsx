import { Marquee } from "@/components/ui/marquee";
import ReviewCard from "@/features/reviews/components/review-card";
import type { Review, ReviewContractType } from "@/features/reviews/types/review";

const TICKER_SAMPLE_SIZE = 20;

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
  // #27: the strip is decorative — a varied sample of 20 cards (10 per row,
  // duplicated twice for the seamless loop) instead of all 90 × 4 repeats,
  // which produced ~360 cards and ~2 MB of HTML on the home page. The full
  // review base lives on /reviews.
  const sample = reviews.slice(0, TICKER_SAMPLE_SIZE);
  const useTwoRows = sample.length >= 6;
  const mid = Math.ceil(sample.length / 2);
  const rowOne = useTwoRows ? sample.slice(0, mid) : sample;
  const rowTwo = useTwoRows ? sample.slice(mid) : [];

  const renderRow = (items: Review[], reverse: boolean) => (
    <Marquee
      pauseOnHover
      reverse={reverse}
      repeat={2}
      className="[--duration:90s] [--gap:1.25rem] py-1"
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

  // Edge fade applied via inline CSS (reliable across browsers) so the strip
  // dissolves at both ends over any background instead of hard-clipping.
  const fade =
    "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)";

  return (
    <div
      // The marquee keyframe is authored for LTR; under dir="rtl" it slides the
      // whole row off-screen. Keep the strip LTR and let each card be RTL.
      dir="ltr"
      className="w-full overflow-hidden"
      style={{ WebkitMaskImage: fade, maskImage: fade }}
    >
      <div className="flex flex-col gap-4">
        {renderRow(rowOne, false)}
        {rowTwo.length > 0 && renderRow(rowTwo, true)}
      </div>
    </div>
  );
}
