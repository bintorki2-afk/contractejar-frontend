import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import BlogDetailPageContent from "@/features/blog/components/blog-detail-page-content";
import { ARTICLE_CATEGORY_LABEL_KEY } from "@/features/blog/data/blog-post-config";
import {
  getAllArticles,
  getArticleBySlug,
  getArticleSlugs,
} from "@/features/blog/data/get-articles";
import type { BlogDetailCommentsLabels } from "@/features/blog/types/blog-detail-comments";
import type { BlogDetailLabels, BlogDetailPost } from "@/features/blog/types/blog-detail";
import { formatArticleDate } from "@/features/blog/utils/format-article-date";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contractejar.com";

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {};
  }

  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.date,
      images: [{ url: article.coverImage, alt: article.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const t = await getTranslations("blog.detail");
  const tabsT = await getTranslations("blog.listing.tabs");
  const locale = await getLocale();

  const labels: BlogDetailLabels = {
    shareArticle: t("shareArticle"),
    shareOnX: t("shareOnX"),
    shareOnLinkedin: t("shareOnLinkedin"),
    shareGeneric: t("shareGeneric"),
  };

  const post: BlogDetailPost = {
    slug: article.slug,
    category: tabsT(ARTICLE_CATEGORY_LABEL_KEY[article.categoryId]),
    title: article.title,
    date: formatArticleDate(article.date, locale),
    readTime: article.readTime,
    imageSrc: article.coverImage,
    imageAlt: article.imageAlt,
    sections: article.sections,
  };

  // Real articles have no seeded comments: pass an empty list while keeping the
  // comments UI labels so the section still renders (tags, heading, form).
  const commentsLabels: BlogDetailCommentsLabels = {
    tags: t.raw("comments.tags") as string[],
    title: t("comments.title"),
    comments: [],
    authorImageAlt: t("comments.authorImageAlt"),
    formTitle: t("comments.form.title"),
    formPlaceholder: t("comments.form.placeholder"),
    submitLabel: t("comments.form.submit"),
    submitAriaLabel: t("comments.form.submitAriaLabel"),
    likeAriaLabel: t("comments.likeAriaLabel"),
    shareAriaLabel: t("comments.shareAriaLabel"),
  };

  // Related articles: same category first, then fill with the latest, max 3.
  const allArticles = await getAllArticles();
  const related = [
    ...allArticles.filter(
      (a) => a.slug !== article.slug && a.categoryId === article.categoryId,
    ),
    ...allArticles.filter(
      (a) => a.slug !== article.slug && a.categoryId !== article.categoryId,
    ),
  ]
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: tabsT(ARTICLE_CATEGORY_LABEL_KEY[a.categoryId]),
      readTime: a.readTime,
    }));

  // Article structured data (JSON-LD) for richer Google results.
  const pageUrl = `${SITE_URL}/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    image: `${SITE_URL}${article.coverImage}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    author: { "@type": "Organization", name: "عقد إيجار" },
    publisher: {
      "@type": "Organization",
      name: "عقد إيجار",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailPageContent
        post={post}
        labels={labels}
        commentsLabels={commentsLabels}
        sources={article.sources}
        sourcesLabel={t("sources")}
        relatedArticles={related}
        relatedTitle="مقالات ذات صلة"
        relatedReadMoreLabel="اقرأ المقال"
      />
    </>
  );
}
