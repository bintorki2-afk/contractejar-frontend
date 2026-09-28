"use client";

import { useTranslations } from "next-intl";

import FaqAccordionList from "@/features/faq/components/faq-accordion-list";
import { useCommonQuestions } from "@/features/faq/hooks/use-common-questions";

export default function FaqSection() {
  const t = useTranslations("faq");
  const { data, isLoading, isError } = useCommonQuestions();

  return (
    <section className="bg-brand dark:bg-transparent py-16 md:py-20">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          <header className="space-y-3 text-center text-white lg:text-start">
            <h2 className="text-3xl font-extrabold md:text-4xl">{t("title")}</h2>
            <p className="text-sm text-white/80 md:text-base">{t("description")}</p>
          </header>

          {isLoading ? (
            <p className="text-center text-sm text-white/80 lg:text-start">
              {t("loading")}
            </p>
          ) : null}

          {isError ? (
            <p className="text-center text-sm text-white/80 lg:text-start">
              {t("error")}
            </p>
          ) : null}

          {!isLoading && !isError && data?.length ? (
            <FaqAccordionList items={data} variant="section" limit={3} />
          ) : null}

          {!isLoading && !isError && !data?.length ? (
            <p className="text-center text-sm text-white/80 lg:text-start">
              {t("empty")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
