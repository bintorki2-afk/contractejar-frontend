import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import ReviewCard from "@/features/reviews/components/review-card";
import ReviewStars from "@/features/reviews/components/review-stars";
import { allReviews, reviewCities } from "@/features/reviews/data/reviews-all";
import { reviewsSummary } from "@/features/reviews/data/reviews";
import type { ReviewContractType } from "@/features/reviews/types/review";

const PAGE_SIZE = 60;

type SearchParams = {
  type?: string;
  rating?: string;
  city?: string;
  page?: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reviewsPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/reviews" },
  };
}

/** Build a querystring, dropping empty values and resetting page on filter change. */
function buildHref(base: SearchParams, patch: Partial<SearchParams>) {
  const next = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.type) params.set("type", next.type);
  if (next.rating) params.set("rating", next.rating);
  if (next.city) params.set("city", next.city);
  if (next.page && next.page !== "1") params.set("page", next.page);
  const qs = params.toString();
  return qs ? `/reviews?${qs}` : "/reviews";
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("reviewsPage");
  const tr = await getTranslations("reviews");

  const typeFilter =
    sp.type === "residential" || sp.type === "commercial" ? sp.type : undefined;
  const ratingFilter =
    sp.rating && ["3", "4", "5"].includes(sp.rating)
      ? Number(sp.rating)
      : undefined;
  const cityFilter =
    sp.city && reviewCities.includes(sp.city) ? sp.city : undefined;

  const filtered = allReviews.filter(
    (r) =>
      (!typeFilter || r.contractType === typeFilter) &&
      (!ratingFilter || r.rating === ratingFilter) &&
      (!cityFilter || r.city === cityFilter),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(
    totalPages,
    Math.max(1, Number(sp.page) || 1),
  );
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const contractTypeLabels: Record<ReviewContractType, string> = {
    residential: tr("contractType.residential"),
    commercial: tr("contractType.commercial"),
  };

  return (
    <main className="py-14 md:py-20">
      <div className="container flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <nav className="mx-auto text-xs text-muted-foreground">
            <Link href="/" className="transition hover:text-brand">
              {t("breadcrumbHome")}
            </Link>
            <span className="px-2">/</span>
            <span className="text-foreground">{t("breadcrumb")}</span>
          </nav>

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-brand-secondary/10 p-2 text-sm font-bold text-brand">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
              <Star className="size-4 fill-current" aria-hidden="true" />
            </span>
            <span>{tr("badge")}</span>
          </div>

          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            {t("title")}
          </h1>

          <div className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur-sm dark:bg-white/[0.04]">
            <span className="text-3xl font-extrabold text-brand">
              {reviewsSummary.average.toFixed(1)}
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <ReviewStars rating={reviewsSummary.average} size={15} />
              <span className="text-xs font-semibold text-muted-foreground">
                {tr("summary", { count: reviewsSummary.total })}
              </span>
            </span>
          </div>
        </div>

        {/* Grid */}
        {pageItems.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                fullWidth
                contractTypeLabel={
                  review.contractType
                    ? contractTypeLabels[review.contractType]
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            {t("noResults")}
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3">
            {page > 1 ? (
              <Link
                href={buildHref(sp, { page: String(page - 1) })}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold transition hover:border-brand hover:text-brand"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
                {t("prev")}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/40 px-4 py-2 text-sm font-semibold text-muted-foreground/40">
                <ChevronRight className="size-4" aria-hidden="true" />
                {t("prev")}
              </span>
            )}

            <span className="text-sm font-bold text-foreground">
              {t("pageOf", { page, total: totalPages })}
            </span>

            {page < totalPages ? (
              <Link
                href={buildHref(sp, { page: String(page + 1) })}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 px-4 py-2 text-sm font-semibold transition hover:border-brand hover:text-brand"
              >
                {t("next")}
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border/40 px-4 py-2 text-sm font-semibold text-muted-foreground/40">
                {t("next")}
                <ChevronLeft className="size-4" aria-hidden="true" />
              </span>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
