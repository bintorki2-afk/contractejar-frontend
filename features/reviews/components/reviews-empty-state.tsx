import Link from "next/link";
import { MessageSquareHeart, Star } from "lucide-react";

type ReviewsEmptyStateProps = {
  title: string;
  description: string;
  cta: string;
  ctaHref: string;
};

/** Shown when there are no reviews yet — an invitation, not a blank space. */
export default function ReviewsEmptyState({
  title,
  description,
  cta,
  ctaHref,
}: ReviewsEmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl border border-dashed border-brand/25 bg-white/60 px-6 py-12 text-center shadow-sm backdrop-blur-sm dark:bg-white/[0.03]">
      <span className="relative flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <MessageSquareHeart className="size-8" aria-hidden="true" />
        <span className="absolute -end-1 -top-1 flex size-6 items-center justify-center rounded-full bg-amber-400 text-white">
          <Star className="size-3.5 fill-current" aria-hidden="true" />
        </span>
      </span>

      <div className="flex flex-col gap-2">
        <p className="text-xl font-extrabold text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <Link
        href={ctaHref}
        className="inline-flex items-center justify-center rounded-full bg-brand px-7 py-3 text-sm font-bold text-white shadow-md transition hover:brightness-110"
      >
        {cta}
      </Link>
    </div>
  );
}
