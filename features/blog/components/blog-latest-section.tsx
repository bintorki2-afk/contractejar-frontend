import { getLocale, getTranslations } from "next-intl/server";

import BlogFeaturedCard from "@/features/blog/components/blog-featured-card";
import BlogLatestHeader from "@/features/blog/components/blog-latest-header";
import BlogListCard from "@/features/blog/components/blog-list-card";
import {
  ARTICLE_CATEGORY_LABEL_KEY,
  BLOG_LIST_ITEMS_COUNT,
} from "@/features/blog/data/blog-post-config";
import { getAllArticles } from "@/features/blog/data/get-articles";
import type { Article } from "@/features/blog/types/article";
import type { BlogLatestLabels } from "@/features/blog/types/blog-labels";
import type { BlogPost } from "@/features/blog/types/blog-post";
import { formatArticleDate } from "@/features/blog/utils/format-article-date";

export default async function BlogLatestSection() {
  const t = await getTranslations("blog.latest");
  const tabsT = await getTranslations("blog.listing.tabs");
  const locale = await getLocale();

  const labels: BlogLatestLabels = {
    badge: t("badge"),
    title: t("title"),
    description: t("description"),
    share: t("share"),
    post: {
      featuredCategory: t("post.featuredCategory"),
      featuredTitle: t("post.featuredTitle"),
      listCategory: t("post.listCategory"),
      listTitle: t("post.listTitle"),
      description: t("post.description"),
      date: t("post.date"),
      readTime: t("post.readTime"),
      views: t("post.views"),
    },
  };

  const articles = await getAllArticles();

  const toPost = (article: Article): BlogPost => {
    const categoryLabel = tabsT(ARTICLE_CATEGORY_LABEL_KEY[article.categoryId]);
    const formattedDate = formatArticleDate(article.date, locale);

    return {
      slug: article.slug,
      imageSrc: article.coverImage,
      featuredCategory: categoryLabel,
      featuredTitle: article.title,
      listCategory: categoryLabel,
      listTitle: article.title,
      description: article.excerpt,
      date: formattedDate,
      readTime: article.readTime,
    };
  };

  const [featured, ...rest] = articles;
  const listItems = rest.slice(0, BLOG_LIST_ITEMS_COUNT).map(toPost);

  return (
    <section className="bg-white py-12 md:py-16 dark:bg-[#151c1b]">
      <div className="container min-w-0 space-y-10 md:space-y-12">
        <BlogLatestHeader
          badge={labels.badge}
          title={labels.title}
          description={labels.description}
          shareLabel={labels.share}
        />

        {featured ? (
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
            <BlogFeaturedCard post={toPost(featured)} />

            <div className="flex h-full flex-col gap-4">
              {listItems.map((item) => (
                <BlogListCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
