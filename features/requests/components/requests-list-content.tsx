"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import RequestsFiltersDialog, {
  type RequestTypeFilter,
  type RequestsFiltersValue,
} from "@/features/requests/components/requests-filters-dialog";
import RequestsGrid from "@/features/requests/components/requests-grid";
import RequestsHowItWorks from "@/features/requests/components/requests-how-it-works";
import RequestsOnboardingDialog from "@/features/requests/components/requests-onboarding-dialog";
import type { RequestCardData } from "@/features/requests/types/request";
import type { RequestLabels } from "@/features/requests/types/request-labels";

type RequestsListContentProps = {
  labels: RequestLabels;
  items: RequestCardData[];
};

function matchesRequestType(
  item: RequestCardData,
  requestType: RequestTypeFilter,
) {
  if (requestType === "all") {
    return true;
  }

  const statusText = [
    item.statusName,
    item.journeyStatusLabel,
    item.paymentStatusLabel,
    item.statusCode,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isCancelled =
    statusText.includes("ملغي") ||
    statusText.includes("cancelled") ||
    statusText.includes("canceled");

  if (requestType === "cancelled") {
    return isCancelled;
  }

  if (isCancelled) {
    return false;
  }

  if (requestType === "completed") {
    return item.paymentSuccessful || item.status === "completed";
  }

  if (requestType === "incomplete") {
    return item.isIncompleteDraft;
  }

  if (requestType === "draft-contract") {
    return !item.paymentSuccessful && item.step === 7;
  }

  return true;
}

export default function RequestsListContent({
  labels,
  items,
}: RequestsListContentProps) {
  const t = useTranslations("requests");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<RequestsFiltersValue>({
    contractType: "all",
    requestType: "all",
  });

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesContractType =
        filters.contractType === "all" ||
        item.contractType === filters.contractType;
      const matchesType = matchesRequestType(item, filters.requestType);
      const matchesSearch =
        query.length === 0 || item.searchText.includes(query);

      return matchesContractType && matchesType && matchesSearch;
    });
  }, [filters, items, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <header className="min-w-0 space-y-2">
          <h1 className="text-3xl font-extrabold text-brand md:text-4xl dark:text-[#00a880]">
            {labels.pageTitle}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[#7a7a7a] md:text-base dark:text-[#a3adac]">
            {labels.pageSubtitle}
          </p>
        </header>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
          <span className="inline-flex h-11 shrink-0 items-center rounded-full bg-brand-background-green px-3.5 text-sm font-bold text-brand dark:bg-[#0e312a] dark:text-[#00a880]">
            {t("requestsCount", { count: filteredItems.length })}
          </span>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-[#ececec] bg-white px-4 text-sm font-bold text-[#555555] transition-colors hover:bg-[#fafafa] dark:border-[#262d2c] dark:bg-[#151c1b] dark:text-white dark:hover:bg-[#1a2221]"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {labels.filtersLabel}
          </button>

          <div className="relative min-w-0 flex-1 lg:w-72">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#b0b0b0] dark:text-[#a3adac]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-11 w-full rounded-2xl border border-[#ececec] bg-white pe-3 ps-10 text-sm text-[#333333] outline-none transition-colors placeholder:text-[#b0b0b0] focus:border-brand/40 dark:border-[#262d2c] dark:bg-[#1a2221] dark:text-white dark:placeholder:text-[#a3adac]"
            />
          </div>
        </div>
      </div>

      <RequestsFiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        value={filters}
        onApply={setFilters}
        labels={{
          title: labels.filtersDialog.title,
          close: labels.filtersDialog.close,
          contractTypeLabel: labels.filtersDialog.contractTypeLabel,
          requestTypeLabel: labels.filtersDialog.requestTypeLabel,
          all: labels.filtersDialog.all,
          residential: labels.tabs.residential,
          commercial: labels.tabs.commercial,
          allTypes: labels.filtersDialog.allTypes,
          completed: labels.filtersDialog.completed,
          draftContract: labels.filtersDialog.draftContract,
          incomplete: labels.filtersDialog.incomplete,
          cancelled: labels.filtersDialog.cancelled,
          showResults: labels.filtersDialog.showResults,
        }}
      />

      {filteredItems.length === 0 ? (
        <p className="rounded-3xl bg-white px-6 py-12 text-center text-sm text-muted-foreground shadow-sm dark:border dark:border-[#262d2c] dark:bg-[#151c1b] dark:text-[#a3adac] dark:shadow-none">
          {labels.emptyState}
        </p>
      ) : (
        <RequestsGrid items={filteredItems} labels={labels.card} />
      )}

      <RequestsHowItWorks
        title={labels.howItWorks.title}
        subtitle={labels.howItWorks.subtitle}
        steps={labels.howItWorks.steps}
      />

      {items.length === 0 ? (
        <RequestsOnboardingDialog
          steps={labels.howItWorks.steps}
          labels={labels.onboarding}
        />
      ) : null}
    </div>
  );
}
