import type { Metadata } from "next";

import type { ContentPageSeo } from "@/features/content-pages/types/content-page-seo";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

type ContentPageMetadataDefaults = {
  /** Hardcoded fallback title (i18n). Used when API `meta_title` is empty. */
  title: string;
  /** Hardcoded fallback description (i18n). Used when API `meta_description` is empty. */
  description: string;
  /** Self-referencing canonical path (e.g. "/blog"). Resolved absolute via metadataBase. */
  canonical: string;
  /** Home page: the default title is used verbatim (no brand suffix). */
  absoluteTitle?: boolean;
};

function normalizeMetaField(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/**
 * Merge CMS SEO over page defaults: non-empty `meta_title` / `meta_description`
 * win (title used verbatim so the root template doesn't double-suffix it).
 * Open Graph / Twitter / canonical / image are always filled.
 */
export function resolveContentPageMetadata(
  page: ContentPageSeo | null | undefined,
  defaults: ContentPageMetadataDefaults,
): Metadata {
  const apiTitle = normalizeMetaField(page?.meta_title);
  const apiDescription = normalizeMetaField(page?.meta_description);

  return buildPageMetadata({
    title: apiTitle || defaults.title,
    description: apiDescription || defaults.description,
    path: defaults.canonical,
    absoluteTitle: apiTitle ? true : Boolean(defaults.absoluteTitle),
  });
}
