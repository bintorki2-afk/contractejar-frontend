import type { Metadata } from "next";

import BlogLatestSection from "@/features/blog/components/blog-latest-section";
import BlogListingSection from "@/features/blog/components/blog-listing-section";
import Reveal from "@/features/shared/motion/reveal";
import { getContentPageSeo } from "@/features/content-pages/services/get-content-pages";
import { resolveContentPageMetadata } from "@/features/content-pages/utils/resolve-content-page-metadata";
import FaqSectionBoundary from "@/features/faq/components/faq-section-boundary";
import SupportSection from "@/features/support/components/support-section";

export async function generateMetadata(): Promise<Metadata> {
  const pageSeo = await getContentPageSeo("blogs");

  // Empty API fields inherit root layout defaults. Blog [slug] does not use this.
  return resolveContentPageMetadata(pageSeo);
}

export default function BlogPage() {
  return (
    <main className="overflow-x-hidden">
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
