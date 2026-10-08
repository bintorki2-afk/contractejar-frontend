import { cn } from "@/lib/utils";

type ReviewStarsProps = {
  rating: number;
  className?: string;
  size?: number;
};

/**
 * Row of 5 stars, filled up to `rating`. Uses the shared SVG sprite
 * (`components/svg-sprite.tsx`) so each star is a tiny `<use>` reference —
 * the home ticker alone renders hundreds of them.
 */
export default function ReviewStars({ rating, className, size = 16 }: ReviewStarsProps) {
  const rounded = Math.round(rating);

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rounded} / 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          aria-hidden="true"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            i < rounded
              ? "fill-amber-400 stroke-amber-400"
              : "fill-transparent stroke-muted-foreground/30"
          }
        >
          <use href="#aqdi-star" />
        </svg>
      ))}
    </div>
  );
}
