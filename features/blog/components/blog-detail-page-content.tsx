import BlogArticleCta from "@/features/blog/components/blog-article-cta";
import BlogDetailArticleBody from "@/features/blog/components/blog-detail-article-body";
import BlogDetailCommentsSection from "@/features/blog/components/blog-detail-comments-section";
import BlogDetailFeaturedImage from "@/features/blog/components/blog-detail-featured-image";
import BlogDetailMeta from "@/features/blog/components/blog-detail-meta";
import BlogDetailShareBar from "@/features/blog/components/blog-detail-share-bar";
import BlogDetailSources from "@/features/blog/components/blog-detail-sources";
import BlogRelatedArticles, {
  type RelatedArticle,
} from "@/features/blog/components/blog-related-articles";
import type { ArticleSource } from "@/features/blog/types/article";
import type { BlogDetailCommentsLabels } from "@/features/blog/types/blog-detail-comments";
import type {
  BlogDetailLabels,
  BlogDetailPost,
} from "@/features/blog/types/blog-detail";

type BlogDetailPageContentProps = {
  post: BlogDetailPost;
  labels: BlogDetailLabels;
  commentsLabels: BlogDetailCommentsLabels;
  sources?: ArticleSource[];
  sourcesLabel?: string;
  relatedArticles?: RelatedArticle[];
  relatedTitle?: string;
  relatedReadMoreLabel?: string;
};

export default function BlogDetailPageContent({
  post,
  labels,
  commentsLabels,
  sources,
  sourcesLabel,
  relatedArticles,
  relatedTitle,
  relatedReadMoreLabel,
}: BlogDetailPageContentProps) {
  return (
    <section className="bg-white py-10 md:py-14 dark:bg-[#151c1b]">
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <BlogDetailMeta post={post} />

          <BlogDetailShareBar labels={labels} title={post.title} />

          <BlogDetailFeaturedImage
            imageSrc={post.imageSrc}
            imageAlt={post.imageAlt}
          />

          <BlogDetailArticleBody sections={post.sections} />

          {sources && sources.length > 0 && sourcesLabel ? (
            <BlogDetailSources title={sourcesLabel} sources={sources} />
          ) : null}

          <BlogArticleCta />

          {relatedArticles && relatedTitle && relatedReadMoreLabel ? (
            <BlogRelatedArticles
              title={relatedTitle}
              readMoreLabel={relatedReadMoreLabel}
              articles={relatedArticles}
            />
          ) : null}

          <BlogDetailCommentsSection labels={commentsLabels} />
        </div>
      </div>
    </section>
  );
}
