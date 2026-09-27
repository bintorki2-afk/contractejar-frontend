import CustomIcon from "@/features/shared/components/custom-icon";

type AboutBeneficiaryCardProps = {
  icon: string;
  title: string;
  description: string;
};

export default function AboutBeneficiaryCard({
  icon,
  title,
  description,
}: AboutBeneficiaryCardProps) {
  return (
    <article className="group flex flex-col items-center gap-4 rounded-2xl bg-white dark:bg-[#151c1b] p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl md:p-7">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-background-green text-brand transition-transform duration-300 group-hover:scale-110">
        <CustomIcon src={icon} className="size-7" />
      </div>
      <h3 className="text-lg font-extrabold text-brand md:text-xl">{title}</h3>
      <p className="text-sm leading-7 text-foreground/60">{description}</p>
    </article>
  );
}
