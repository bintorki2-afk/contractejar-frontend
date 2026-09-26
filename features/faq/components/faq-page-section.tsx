"use client";

import { useTranslations } from "next-intl";

import FaqAccordionList from "@/features/faq/components/faq-accordion-list";
import { useCommonQuestions } from "@/features/faq/hooks/use-common-questions";

export default function FaqPageSection() {
  const t = useTranslations("faq");
  const { data, isLoading, isError } = useCommonQuestions();

  return (
    <section className="min-h-screen bg-white dark:bg-[#151c1b] py-16 md:py-24">
      <div className="container">
        <div className="grid items-start gap-10 lg:grid-cols-[380px_1fr] lg:gap-16">
          <div className="space-y-4 lg:text-start">
            <span className="inline-flex items-center rounded-full border bg-brand-background-green px-4 py-1.5 text-sm font-bold text-foreground">
              {t("badge")}
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-brand md:text-5xl">
              {t("title")}
            </h1>
            <p className="text-sm leading-8 text-muted-foreground md:text-base">
              {t("description")}
            </p>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : null}

          {isError ? (
            <p className="text-sm text-destructive">{t("error")}</p>
          ) : null}

          {!isLoading && !isError && data?.length ? (
            <FaqAccordionList items={data} variant="page" />
          ) : null}

          {!isLoading && !isError && !data?.length ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
