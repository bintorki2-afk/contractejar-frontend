import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import JsonLd from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/page-metadata";

import { getContentPageSeo } from "@/features/content-pages/services/get-content-pages";
import { resolveContentPageMetadata } from "@/features/content-pages/utils/resolve-content-page-metadata";
import FaqPageSection from "@/features/faq/components/faq-page-section";
import SupportSection from "@/features/support/components/support-section";
import { faqKeys } from "@/features/faq/query-keys";
import { getCommonQuestions } from "@/features/faq/services/get-common-questions";
import type { CommonQuestion } from "@/features/faq/types/common-question";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, t] = await Promise.all([
    getContentPageSeo("faq"),
    getTranslations("site"),
  ]);

  return resolveContentPageMetadata(pageSeo, {
    title: t("faqTitle"),
    description: t("faqDescription"),
    canonical: "/faq",
  });
}

export default async function FaqPage() {
  const queryClient = getQueryClient();
  const t = await getTranslations("site");

  await queryClient.prefetchQuery({
    queryKey: faqKeys.list(),
    queryFn: getCommonQuestions,
  });

  // FAQPage structured data (JSON-LD): يمكّن قوقل ومحرّكات AI من اقتباس
  // الأسئلة والأجوبة مباشرة في النتائج والردود.
  const questions =
    queryClient.getQueryData<CommonQuestion[]>(faqKeys.list()) ?? [];

  return (
    <>
      <JsonLd data={faqJsonLd(questions.map((q) => ({ q: q.question, a: q.answer })))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("homeTitle"), path: "/" },
          { name: t("faqTitle"), path: "/faq" },
        ])}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FaqPageSection />
      </HydrationBoundary>
      <SupportSection />
    </>
  );
}
