import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import LegalDocumentPage from "@/features/settings/components/legal-document-page";
import { getAppSettings } from "@/features/settings/services/get-app-settings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const [settings, t] = await Promise.all([
    getAppSettings(),
    getTranslations("legal.privacy"),
  ]);

  return (
    <LegalDocumentPage
      title={t("title")}
      html={settings?.privacy.description ?? ""}
      emptyLabel={t("empty")}
    />
  );
}
