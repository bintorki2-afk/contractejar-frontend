import { getTranslations } from "next-intl/server";

import MyPropertiesPageContent from "@/features/my-properties/components/my-properties-page-content";
import { getMyProperties } from "@/features/my-properties/services/get-my-properties";
import type { MyPropertyCardData } from "@/features/my-properties/types/property-card";
import type {
  MyPropertiesHowItWorksStep,
  MyPropertiesLabels,
} from "@/features/my-properties/types/my-properties-labels";
import { mapRealEstateToCard } from "@/features/my-properties/utils/map-real-estate-to-card";

export default async function MyPropertiesPage() {
  const [t, properties] = await Promise.all([
    getTranslations("myProperties"),
    getMyProperties().catch(() => [] as Awaited<ReturnType<typeof getMyProperties>>),
  ]);
  const labels: MyPropertiesLabels = {
    backLabel: t("backLabel"),
    pageTitle: t("pageTitle"),
    pageSubtitle: t("pageSubtitle"),
    pageBadge: t("pageBadge"),
    propertiesCountLabel: "",
    emptyStateTitle: t("emptyStateTitle"),
    emptyStateDescription: t("emptyStateDescription"),
    addProperty: t("addProperty"),
    howItWorks: {
      title: t("howItWorks.title"),
      subtitle: t("howItWorks.subtitle"),
      steps: t.raw("howItWorks.steps") as MyPropertiesHowItWorksStep[],
    },
    onboarding: {
      title: t("onboarding.title"),
      progressTemplate: t.raw("onboarding.progress") as string,
      back: t("onboarding.back"),
      next: t("onboarding.next"),
      start: t("onboarding.start"),
      dontShowAgain: t("onboarding.dontShowAgain"),
    },
    contractTypes: {
      housing: t("contractTypes.housing"),
      commercial: t("contractTypes.commercial"),
    },
  };

  const items: MyPropertyCardData[] = properties.map((property) =>
    mapRealEstateToCard(property, labels.contractTypes),
  );

  labels.propertiesCountLabel = t("propertiesCount", { count: items.length });

  return <MyPropertiesPageContent labels={labels} items={items} />;
}
