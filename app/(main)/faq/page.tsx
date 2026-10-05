import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getContentPageSeo } from "@/features/content-pages/services/get-content-pages";
import { resolveContentPageMetadata } from "@/features/content-pages/utils/resolve-content-page-metadata";
import FaqPageSection from "@/features/faq/components/faq-page-section";
import SupportSection from "@/features/support/components/support-section";
import { faqKeys } from "@/features/faq/query-keys";
import { getCommonQuestions } from "@/features/faq/services/get-common-questions";
import type { CommonQuestion } from "@/features/faq/types/common-question";
import { getQueryClient } from "@/lib/react-query/get-query-client";

export async function generateMetadata(): Promise<Metadata> {
  const pageSeo = await getContentPageSeo("faq");

  // Empty API fields inherit root layout defaults (previous FAQ behavior).
  return resolveContentPageMetadata(pageSeo, { canonical: "/faq" });
}

export default async function FaqPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: faqKeys.list(),
    queryFn: getCommonQuestions,
  });

  // FAQPage structured data (JSON-LD): يمكّن قوقل ومحرّكات AI من اقتباس
  // الأسئلة والأجوبة مباشرة في النتائج والردود.
  const questions =
    queryClient.getQueryData<CommonQuestion[]>(faqKeys.list()) ?? [];
  const faqJsonLd =
    questions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: questions.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: { "@type": "Answer", text: q.answer },
          })),
        }
      : null;

  return (
    <>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FaqPageSection />
      </HydrationBoundary>
      <SupportSection />
    </>
  );
}
