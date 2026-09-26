import { ClipboardList } from "lucide-react";

type BlogSidebarCategoriesCardProps = {
  title: string;
  items: {
    id: string;
    label: string;
    count: string;
  }[];
};

export default function BlogSidebarCategoriesCard({
  title,
  items,
}: BlogSidebarCategoriesCardProps) {
  return (
    <div className="rounded-[32px] bg-brand-background p-6 md:p-8">
      <h2 className="mb-5 text-start text-lg font-extrabold text-brand md:text-xl">
        {title}
      </h2>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-full bg-white px-4 py-3.5 transition-colors hover:bg-white/90 dark:bg-[#151c1b]"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[#757575] dark:text-white/60">
                <ClipboardList
                  className="size-4 shrink-0 text-[#9e9e9e] dark:text-white/50"
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>

              <span className=" size-6 bg-brand-background rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-brand-secondary">
                {item.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
