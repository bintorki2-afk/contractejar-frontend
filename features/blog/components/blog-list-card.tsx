import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Clock, Eye, Timer } from "lucide-react";

import type { BlogPost } from "@/features/blog/types/blog-post";

type BlogListCardProps = {
  post: BlogPost;
};

export default function BlogListCard({ post }: BlogListCardProps) {
  return (
    <article className="group flex items-center gap-4  pb-4 last:pb-0">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-2xl md:h-30 md:w-32"
      >
        <Image
          src={post.imageSrc}
          alt={post.listTitle}
          fill
          sizes="128px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </Link>

      <div className="min-w-0 flex-1 space-y-2 text-start">
        <p className="text-xs font-semibold text-muted-foreground md:text-sm">
          {post.listCategory}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="block text-base font-extrabold leading-7 text-brand transition-colors hover:text-brand-secondary md:text-lg"
        >
          {post.listTitle}
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="size-3.5" aria-hidden="true" />
            {post.readTime}
          </span>
          {post.views ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" aria-hidden="true" />
              {post.views}
            </span>
          ) : null}
        </div>
      </div>

      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.listTitle}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-brand/10"
      >
        <ArrowUpLeft className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
