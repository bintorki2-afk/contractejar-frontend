import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * QA WEB-14: a 404 must not carry the home page title/description — in search
 * results and analytics every dead link looked like the home page.
 */
export async function getNotFoundMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}
