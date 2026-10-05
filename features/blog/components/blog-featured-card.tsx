import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

import type { BlogPost } from "@/features/blog/types/blog-post";

type BlogFeaturedCardProps = {
  post: BlogPost;
};

export default function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  // Per-article covers under /images/blog/ already have the title, excerpt,
  // category and brand baked into the image, so the featured card must NOT
  // overlay its own title/excerpt on top (that double-prints and overlaps).
  // The generic fallback photo (/images/blog.jpg) has no text, so it keeps the
  // text overlay.
  const hasDesignedCover = post.imageSrc.startsWith("/images/blog/");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative block h-full overflow-hidden rounded-3xl max-md:min-h-[420px]"
    >
      <Image
        src={post.imageSrc}
        alt={post.featuredTitle}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {hasDesignedCover ? (
        <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          <Clock className="size-4" aria-hidden="true" />
          <span>{post.date}</span>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
            <div className="min-w-0 space-y-3 text-start">
              <span className="inline-flex rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {post.featuredCategory}
              </span>
              <h2 className="max-w-xl text-2xl font-extrabold leading-snug text-white md:text-3xl">
                {post.featuredTitle}
              </h2>
              <p className="max-w-lg text-sm leading-7 text-white/85 md:text-base">
                {post.description}
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-white/90">
              <Clock className="size-4" aria-hidden="true" />
              <span>{post.date}</span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
