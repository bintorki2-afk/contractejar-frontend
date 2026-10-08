import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PRIVACY_POLICY } from "@/content/legal/privacy";
import LegalDocumentPage from "@/features/settings/components/legal-document-page";
import { getAppSettings } from "@/features/settings/services/get-app-settings";
import { resolveFooterWhatsappHref } from "@/features/settings/utils/resolve-footer-contact";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/privacy" },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), url: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const [settings, t] = await Promise.all([
    getAppSettings(),
    getTranslations("legal"),
  ]);

  return (
    <LegalDocumentPage
      document={PRIVACY_POLICY}
      updatedAtLabel={t("updatedAt")}
      contactTitle={t("contact.title")}
      contactBody={t("contact.privacyBody")}
      supportLabel={t("contact.support")}
      whatsappLabel={t("contact.whatsapp")}
      whatsappHref={resolveFooterWhatsappHref(settings)}
    />
  );
}
