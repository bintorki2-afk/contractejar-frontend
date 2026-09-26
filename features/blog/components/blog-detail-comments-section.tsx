import BlogDetailAddCommentForm from "@/features/blog/components/blog-detail-add-comment-form";
import BlogDetailCommentCard from "@/features/blog/components/blog-detail-comment-card";
import type { BlogDetailCommentsLabels } from "@/features/blog/types/blog-detail-comments";

type BlogDetailCommentsSectionProps = {
  labels: BlogDetailCommentsLabels;
};

export default function BlogDetailCommentsSection({
  labels,
}: BlogDetailCommentsSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap justify-start gap-2.5">
        {labels.tags.map((tag) => (
          <span
            key={tag}
            className="text-sm font-semibold text-[#bdbdbd] dark:text-white/50"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2 className="text-start text-2xl font-extrabold text-brand md:text-3xl">
        {labels.title}
      </h2>

      <div className="space-y-4">
        {labels.comments.map((comment) => (
          <BlogDetailCommentCard
            key={comment.id}
            comment={comment}
            labels={labels}
          />
        ))}
      </div>

      <BlogDetailAddCommentForm
        formTitle={labels.formTitle}
        formPlaceholder={labels.formPlaceholder}
        submitLabel={labels.submitLabel}
        submitAriaLabel={labels.submitAriaLabel}
      />
    </section>
  );
}
