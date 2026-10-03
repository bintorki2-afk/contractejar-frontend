import CustomIcon from "@/features/shared/components/custom-icon";
import MyPropertiesAddButton from "@/features/my-properties/components/my-properties-add-button";

type MyPropertiesEmptyStateProps = {
  title: string;
  description: string;
  addPropertyLabel: string;
};

export default function MyPropertiesEmptyState({
  title,
  description,
  addPropertyLabel,
}: MyPropertiesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-black/5 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-[#151c1b] sm:px-10 sm:py-14">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
        <CustomIcon src="/icons/home.svg" size={32} className="text-current" />
      </div>

      <h2 className="mb-2 text-xl font-extrabold text-brand dark:text-white sm:text-2xl">
        {title}
      </h2>
      <p className="mb-8 max-w-md text-sm leading-7 text-[#5b5b5b] dark:text-white/65 sm:text-base">
        {description}
      </p>

      <MyPropertiesAddButton label={addPropertyLabel} />
    </div>
  );
}
