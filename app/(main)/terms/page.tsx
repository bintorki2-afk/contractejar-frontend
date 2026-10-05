import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LegalDocumentPage from "@/features/settings/components/legal-document-page";
import { getAppSettings } from "@/features/settings/services/get-app-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const [settings, t] = await Promise.all([
    getAppSettings(),
    getTranslations("legal.terms"),
  ]);

  return (
    <LegalDocumentPage
      title={t("title")}
      html={settings?.terms.description ?? ""}
      emptyLabel={t("empty")}
    />
  );
}
