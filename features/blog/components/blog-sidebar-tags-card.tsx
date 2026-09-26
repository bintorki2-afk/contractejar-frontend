type BlogSidebarTagsCardProps = {
  title: string;
  items: string[];
};

export default function BlogSidebarTagsCard({
  title,
  items,
}: BlogSidebarTagsCardProps) {
  return (
    <div className="rounded-[32px] bg-brand-background p-6 md:p-8">
      <h2 className="mb-5 text-start text-lg font-extrabold text-brand md:text-xl">
        {title}
      </h2>

      <div className="flex flex-wrap justify-start gap-2.5">
        {items.map((tag) => (
          <button
            key={tag}
            type="button"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#bdbdbd] shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_4px_rgba(255,255,255,0.9)] transition-colors hover:text-brand-secondary dark:bg-[#151c1b] dark:text-white/50"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
