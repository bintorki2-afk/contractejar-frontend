"use client";

import {
  Building2,
  FileText,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogListingPagination from "@/features/blog/components/blog-listing-pagination";
import BlogPostGrid from "@/features/blog/components/blog-post-grid";
import { BLOG_TAB_CONFIG } from "@/features/blog/data/blog-post-config";
import { useBlogListing } from "@/features/blog/hooks/use-blog-listing";
import type { BlogTabId } from "@/features/blog/types/blog-category";
import type { BlogListingLabels } from "@/features/blog/types/blog-listing-labels";
import type { BlogGridPost } from "@/features/blog/types/blog-post";
import { cn } from "@/lib/utils";

const TAB_ICONS: Record<Exclude<BlogTabId, "all">, LucideIcon> = {
  "property-management": Building2,
  contracts: FileText,
  "real-estate-market": TrendingUp,
};

type BlogCategoryTabsProps = {
  labels: BlogListingLabels;
  posts: BlogGridPost[];
};

export default function BlogCategoryTabs({
  labels,
  posts,
}: BlogCategoryTabsProps) {
  const {
    activeTab,
    currentPage,
    totalPages,
    paginatedPosts,
    selectTab,
    selectPage,
  } = useBlogListing(posts);

  return (
    <div className="min-w-0 space-y-8">
      <Tabs
        value={activeTab}
        onValueChange={(value) => selectTab(value as BlogTabId)}
        className="min-w-0 gap-0"
      >
        <div className="max-w-full min-w-0 ">
          <TabsList className=" h-fit! w-full flex flex-wrap items-center justify-start gap-3 rounded-none bg-transparent p-0">
          {BLOG_TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id;
            const isAllTab = tab.id === "all";
            const Icon = !isAllTab ? TAB_ICONS[tab.id] : null;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "inline-flex h-14 shrink-0 items-center justify-center rounded-full border-0 p-0 text-sm font-bold leading-none shadow-none transition-colors",
                  "after:hidden flex-none whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand/30",
                  isAllTab ? "px-6" : "gap-2 ps-1.5 pe-4",
                  isActive
                    ? "bg-brand text-white hover:bg-brand data-active:bg-brand data-active:text-white"
                    : "bg-muted text-foreground hover:bg-muted/80 data-active:bg-muted data-active:text-foreground",
                )}
              >
                {Icon ? (
                  <span
                    className={cn(
                      "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                      isActive
                        ? "bg-white text-brand"
                        : "bg-white text-brand-secondary dark:bg-[#151c1b]",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
                <span>{labels.tabs[tab.labelKey]}</span>
              </TabsTrigger>
            );
          })}
          </TabsList>
        </div>
      </Tabs>

      <BlogPostGrid
        posts={paginatedPosts}
        readMoreLabel={labels.post.readMore}
      />

      <BlogListingPagination
        currentPage={currentPage}
        totalPages={totalPages}
        previousLabel={labels.pagination.previous}
        nextLabel={labels.pagination.next}
        onPageChange={selectPage}
      />
    </div>
  );
}
