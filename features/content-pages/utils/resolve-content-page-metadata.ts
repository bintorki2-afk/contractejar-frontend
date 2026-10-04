import type { Metadata } from "next";

import type { ContentPageSeo } from "@/features/content-pages/types/content-page-seo";

type ContentPageMetadataDefaults = {
  /** Hardcoded fallback title (i18n). Used when API `meta_title` is empty. */
  title?: Metadata["title"];
  /** Hardcoded fallback description (i18n). Used when API `meta_description` is empty. */
  description?: string;
  /** Self-referencing canonical path (e.g. "/blog"). Resolved absolute via metadataBase. */
  canonical?: string;
};

function normalizeMetaField(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/**
 * Merge CMS SEO over page defaults.
 * Non-empty `meta_title` / `meta_description` win and also set Open Graph.
 * Empty / missing API fields keep the provided hardcoded defaults unchanged.
 */
export function resolveContentPageMetadata(
  page: ContentPageSeo | null | undefined,
  defaults: ContentPageMetadataDefaults = {},
): Metadata {
  const apiTitle = normalizeMetaField(page?.meta_title);
  const apiDescription = normalizeMetaField(page?.meta_description);

  const metadata: Metadata = {};

  if (defaults.canonical) {
    metadata.alternates = { canonical: defaults.canonical };
  }

  if (defaults.title !== undefined) {
    metadata.title = defaults.title;
  }

  if (defaults.description !== undefined) {
    metadata.description = defaults.description;
  }

  if (!apiTitle && !apiDescription) {
    return metadata;
  }

  const openGraph: NonNullable<Metadata["openGraph"]> = {};

  if (apiTitle) {
    // Absolute so CMS titles are not double-suffixed by the root `%s | …` template.
    metadata.title = { absolute: apiTitle };
    openGraph.title = apiTitle;
  }

  if (apiDescription) {
    metadata.description = apiDescription;
    openGraph.description = apiDescription;
  }

  metadata.openGraph = openGraph;

  return metadata;
}
