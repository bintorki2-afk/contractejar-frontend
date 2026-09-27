import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type ReviewStarsProps = {
  rating: number;
  className?: string;
  size?: number;
};

/** Row of 5 stars, filled up to `rating`. */
export default function ReviewStars({ rating, className, size = 16 }: ReviewStarsProps) {
  const rounded = Math.round(rating);

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${rounded} / 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          aria-hidden="true"
          className={
            i < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}
