import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import LessorChangePageContent from "@/features/lessor-change/components/lessor-change-page-content";
import { lessorChangeKeys } from "@/features/lessor-change/query-keys";
import { getLessorChangeInfo } from "@/features/lessor-change/services/get-lessor-change-info";
import { contractPricingKeys } from "@/features/pricing/query-keys";
import { getContractPricing } from "@/features/pricing/services/get-contract-pricing";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lessorChange");
  return {
    title: t("flow.title"),
    description: t("landing.description"),
    robots: { index: false },
  };
}

export default async function LessorChangePage() {
  const queryClient = getQueryClient();

  const [t, tContract] = await Promise.all([
    getTranslations("lessorChange"),
    getTranslations("createContract"),
    queryClient
      .prefetchQuery({
        queryKey: lessorChangeKeys.info(),
        queryFn: () => getLessorChangeInfo(),
      })
      .catch(() => undefined),
    queryClient
      .prefetchQuery({
        queryKey: contractPricingKeys.detail(),
        queryFn: () => getContractPricing(),
      })
      .catch(() => undefined),
  ]);

  const deedImageLabels = {
    label: tContract("deed.deedImage.label"),
    clickHere: tContract("deed.deedImage.clickHere"),
    chooseFile: tContract("deed.deedImage.chooseFile"),
    acceptedFormats: tContract("deed.deedImage.acceptedFormats"),
    attached: tContract("deed.deedImage.attached"),
    preview: tContract("deed.deedImage.preview"),
    change: tContract("deed.deedImage.change"),
    delete: tContract("deed.deedImage.delete"),
    previewTitle: tContract("deed.deedImage.previewTitle"),
    closePreview: tContract("deed.deedImage.closePreview"),
  };

  const birthDateLabels = {
    label: tContract("owner.birthDate.label"),
    hijri: tContract("owner.birthDate.hijri"),
    gregorian: tContract("owner.birthDate.gregorian"),
    day: tContract("owner.birthDate.day"),
    month: tContract("owner.birthDate.month"),
    year: tContract("owner.birthDate.year"),
    dayPlaceholder: tContract("owner.birthDate.dayPlaceholder"),
    monthPlaceholder: tContract("owner.birthDate.monthPlaceholder"),
    yearPlaceholder: tContract("owner.birthDate.yearPlaceholder"),
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LessorChangePageContent
        backLabel={t("flow.back")}
        deedImageLabels={deedImageLabels}
        birthDateLabels={birthDateLabels}
      />
    </HydrationBoundary>
  );
}
