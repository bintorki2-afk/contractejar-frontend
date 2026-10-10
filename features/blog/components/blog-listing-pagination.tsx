"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type BlogListingPaginationProps = {
  currentPage: number;
  totalPages: number;
  previousLabel: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
};

type VisiblePage = number | "ellipsis";

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): VisiblePage[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage, "ellipsis", totalPages];
}

export default function BlogListingPagination({
  currentPage,
  totalPages,
  previousLabel,
  nextLabel,
  onPageChange,
}: BlogListingPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="ترقيم الصفحات"
      className="flex max-w-full flex-wrap items-center justify-center gap-2 pt-4"
    >
      <button
        type="button"
        aria-label={previousLabel}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>

      {visiblePages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex size-10 items-center justify-center text-sm text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
              currentPage === page
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-brand/10 hover:text-brand",
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label={nextLabel}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-brand/10 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
