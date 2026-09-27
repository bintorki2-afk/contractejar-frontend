import AnimatedStatValue from "@/features/about/components/animated-stat-value";
import CustomIcon from "@/features/shared/components/custom-icon";

type NumbersStatCardProps = {
  icon: string;
  value: string;
  label: string;
};

export default function NumbersStatCard({
  icon,
  value,
  label,
}: NumbersStatCardProps) {
  return (
    <article className="group flex flex-col  gap-4 rounded-[2rem] bg-brand-background-green/80 px-4 py-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl md:px-6 md:py-16">
      <CustomIcon src={icon} size={40} className="text-brand-secondary self-start mb-8 transition-transform duration-300 group-hover:scale-110" />
      <AnimatedStatValue
        value={value}
        className="text-3xl font-extrabold text-brand md:text-4xl"
      />
      <p className="text-sm leading-relaxed text-black dark:text-white/90 font-semibold md:text-base">
        {label}
      </p>
    </article>
  );
}
