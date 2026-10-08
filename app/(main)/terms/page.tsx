import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TERMS_AND_CONDITIONS } from "@/content/legal/terms";
import LegalDocumentPage from "@/features/settings/components/legal-document-page";
import { getAppSettings } from "@/features/settings/services/get-app-settings";
import { resolveFooterWhatsappHref } from "@/features/settings/utils/resolve-footer-contact";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/terms" },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url: "/terms" },
  };
}

export default async function TermsPage() {
  const [settings, t] = await Promise.all([
    getAppSettings(),
    getTranslations("legal"),
  ]);

  return (
    <LegalDocumentPage
      document={TERMS_AND_CONDITIONS}
      updatedAtLabel={t("updatedAt")}
      contactTitle={t("contact.title")}
      contactBody={t("contact.termsBody")}
      supportLabel={t("contact.support")}
      whatsappLabel={t("contact.whatsapp")}
      whatsappHref={resolveFooterWhatsappHref(settings)}
    />
  );
}
