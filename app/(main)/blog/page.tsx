import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BlogLatestSection from "@/features/blog/components/blog-latest-section";
import BlogListingSection from "@/features/blog/components/blog-listing-section";
import Reveal from "@/features/shared/motion/reveal";
import { getContentPageSeo } from "@/features/content-pages/services/get-content-pages";
import { resolveContentPageMetadata } from "@/features/content-pages/utils/resolve-content-page-metadata";
import FaqSectionBoundary from "@/features/faq/components/faq-section-boundary";
import SupportSection from "@/features/support/components/support-section";
import JsonLd from "@/components/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, t] = await Promise.all([
    getContentPageSeo("blogs"),
    getTranslations("site"),
  ]);

  return resolveContentPageMetadata(pageSeo, {
    title: t("blogTitle"),
    description: t("blogDescription"),
    canonical: "/blog",
  });
}

export default async function BlogPage() {
  const t = await getTranslations("site");

  return (
    <main className="overflow-x-hidden">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("homeTitle"), path: "/" },
          { name: t("blogTitle"), path: "/blog" },
        ])}
      />
      <BlogLatestSection />
      <Reveal>
        <BlogListingSection />
      </Reveal>
      <Reveal>
        <SupportSection />
      </Reveal>
      <Reveal>
        <FaqSectionBoundary />
      </Reveal>
    </main>
  );
}
