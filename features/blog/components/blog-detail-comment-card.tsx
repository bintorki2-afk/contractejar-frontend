import Image from "next/image";
import { Heart, Share2 } from "lucide-react";

import BlogDetailCommentStarRating from "@/features/blog/components/blog-detail-comment-star-rating";
import { BLOG_COMMENT_USER_IMAGE } from "@/features/blog/data/blog-post-config";
import type {
  BlogDetailComment,
  BlogDetailCommentsLabels,
} from "@/features/blog/types/blog-detail-comments";
import { cn } from "@/lib/utils";

type BlogDetailCommentCardProps = {
  comment: BlogDetailComment;
  labels: Pick<
    BlogDetailCommentsLabels,
    "likeAriaLabel" | "shareAriaLabel" | "authorImageAlt"
  >;
};

function QuoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-7 fill-[#10b981]"
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Z" />
    </svg>
  );
}

export default function BlogDetailCommentCard({
  comment,
  labels,
}: BlogDetailCommentCardProps) {
  return (
    <article className="rounded-[32px] bg-[#f9f9f9] p-6 md:p-8 dark:bg-[#141d1a]">
      <div className="flex items-start justify-between gap-4">
        <BlogDetailCommentStarRating rating={comment.rating} />
        <QuoteIcon />
      </div>

      <p className="mt-5 text-start text-base leading-8 text-foreground/90 md:text-[17px]">
        {comment.content}
      </p>
<div className="flex items-center justify-between gap-3">
      <div className="mt-4 flex items-center justify-start gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
          <Image
            src={BLOG_COMMENT_USER_IMAGE}
            alt={labels.authorImageAlt}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <span className="text-sm font-semibold text-foreground md:text-base">
          {comment.authorName}
        </span>
      </div>
      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground/75 dark:bg-[#151c1b]">
            {comment.role}
          </span>
</div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="flex items-center gap-5 text-sm font-semibold text-foreground/80">
          <button
            type="button"
            aria-label={labels.likeAriaLabel}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
          >
            <Heart
              className={cn(
                "size-4",
                comment.isLiked
                  ? "fill-[#ef4444] text-[#ef4444]"
                  : "text-foreground/70",
              )}
              aria-hidden="true"
            />
            <span>{comment.likes}</span>
          </button>

          <button
            type="button"
            aria-label={labels.shareAriaLabel}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
          >
            <Share2 className="size-4 text-foreground/70" aria-hidden="true" />
            <span>{comment.shares}</span>
          </button>
        </div>

        <div className="flex flex-col items-end gap-1.5">

          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
        </div>
      </div>
    </article>
  );
}
