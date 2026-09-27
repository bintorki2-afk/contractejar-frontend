import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Clock, Eye, Timer } from "lucide-react";

import type { BlogGridPost } from "@/features/blog/types/blog-post";

type BlogPostGridCardProps = {
  post: BlogGridPost;
  readMoreLabel: string;
};

export default function BlogPostGridCard({
  post,
  readMoreLabel,
}: BlogPostGridCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-4/3 w-full overflow-hidden"
      >
        <Image
          src={post.imageSrc}
          alt={post.listTitle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 rounded-[35px] "
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 text-start">
        <p className="text-xs font-semibold text-muted-foreground md:text-sm">
          {post.listCategory}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="text-lg font-extrabold leading-8 text-brand transition-colors hover:text-brand-secondary"
        >
          {post.listTitle}
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3" aria-hidden="true" />
            {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="size-3" aria-hidden="true" />
            {post.readTime}
          </span>
          {post.views ? (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3" aria-hidden="true" />
              {post.views}
            </span>
          ) : null}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex items-center gap-2  font-bold text-brand-secondary transition-colors hover:text-brand"
        >
          {readMoreLabel}
          <ArrowUpLeft className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
