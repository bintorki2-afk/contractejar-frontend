import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contractejar.com";
export const SITE_NAME = "عقد إيجار";
export const SITE_TAGLINE = "منصة توثيق عقود الإيجار";
export const DEFAULT_OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` };

type PageMetadataInput = {
  /** Page title without the brand suffix (≤ 60 chars with the suffix). */
  title: string;
  /** ≤ 155 chars. */
  description: string;
  /** Canonical path, e.g. `/guide`. */
  path: string;
  /** Use the title verbatim (no `| عقد إيجار` suffix). */
  absoluteTitle?: boolean;
  /** `noindex, nofollow` for transactional / personal pages. */
  noindex?: boolean;
  type?: "website" | "article";
  /** Override the default social image (absolute or site-relative URL). */
  image?: { url: string; alt?: string; width?: number; height?: number };
  article?: { publishedTime?: string; modifiedTime?: string };
};

/**
 * One place for per-page SEO: title + description, canonical, Open Graph and
 * Twitter cards (with the default OG image), and optional noindex. Pages that
 * define `openGraph` themselves would otherwise drop the inherited image.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  type = "website",
  image,
  article,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ar_SA",
      images: [ogImage],
      ...(type === "article" && article ? article : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** `BreadcrumbList` JSON-LD for a page path. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** `Service` JSON-LD (contract documentation / lessor change). */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
  price?: number;
  priceLabel?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    serviceType: "توثيق عقود الإيجار",
    areaServed: { "@type": "Country", name: "SA" },
    inLanguage: "ar",
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(typeof input.price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: "SAR",
            ...(input.priceLabel ? { description: input.priceLabel } : {}),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}${input.path}`,
          },
        }
      : {}),
  };
}

/** `FAQPage` JSON-LD from Q/A pairs (empty list → null). */
export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  if (items.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
