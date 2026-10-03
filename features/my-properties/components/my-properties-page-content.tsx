import MyPropertiesAddButton from "@/features/my-properties/components/my-properties-add-button";
import MyPropertiesEmptyState from "@/features/my-properties/components/my-properties-empty-state";
import MyPropertiesGrid from "@/features/my-properties/components/my-properties-grid";
import MyPropertiesHowItWorks from "@/features/my-properties/components/my-properties-how-it-works";
import MyPropertiesOnboardingDialog from "@/features/my-properties/components/my-properties-onboarding-dialog";
import ServicesPageBackConfig from "@/features/services/components/services-page-back-config";
import type { MyPropertyCardData } from "@/features/my-properties/types/property-card";
import type { MyPropertiesLabels } from "@/features/my-properties/types/my-properties-labels";

type MyPropertiesPageContentProps = {
  labels: MyPropertiesLabels;
  items: MyPropertyCardData[];
};

export default function MyPropertiesPageContent({
  labels,
  items,
}: MyPropertiesPageContentProps) {
  return (
    <>
      <ServicesPageBackConfig
        backLabel={labels.backLabel}
        backHref="/"
      />

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <header className="min-w-0 space-y-2">
          <h1 className="text-3xl font-extrabold text-brand dark:text-white md:text-4xl">
            {labels.pageTitle}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[#5b5b5b] dark:text-white/65 md:text-base">
            {labels.pageSubtitle}
          </p>
        </header>

        {/* Count + add control only once there are properties — the empty state
            carries its own single call to action, so nothing is duplicated. */}
        {items.length > 0 ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-brand-background-green px-3.5 py-1.5 text-sm font-bold text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
              {labels.propertiesCountLabel}
            </span>
            <MyPropertiesAddButton label={labels.addProperty} />
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <MyPropertiesGrid items={items} />
      ) : (
        <MyPropertiesEmptyState
          title={labels.emptyStateTitle}
          description={labels.emptyStateDescription}
          addPropertyLabel={labels.addProperty}
        />
      )}

      <MyPropertiesHowItWorks
        title={labels.howItWorks.title}
        subtitle={labels.howItWorks.subtitle}
        steps={labels.howItWorks.steps}
      />

      {items.length === 0 ? (
        <MyPropertiesOnboardingDialog
          steps={labels.howItWorks.steps}
          labels={labels.onboarding}
        />
      ) : null}
    </>
  );
}
