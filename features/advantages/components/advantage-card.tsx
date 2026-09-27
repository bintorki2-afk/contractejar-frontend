import { Clock, Headphones, Shield, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  AdvantageIcon,
  AdvantageTheme,
} from "@/features/advantages/types/advantage";

type AdvantageCardProps = {
  title: string;
  description: string;
  icon: AdvantageIcon;
  theme: AdvantageTheme;
};

const iconMap: Record<AdvantageIcon, LucideIcon> = {
  shield: Shield,
  clock: Clock,
  headphones: Headphones,
};

const themeStyles: Record<
  AdvantageTheme,
  { iconWrap: string; icon: string }
> = {
  teal: {
    iconWrap: "bg-brand-background-green",
    icon: "text-brand-secondary",
  },
  blue: {
    iconWrap: "bg-[#eff6ff] dark:bg-[#16233a]",
    icon: "text-[#2563eb] dark:text-[#60a5fa]",
  },
  purple: {
    iconWrap: "bg-[#faf5ff] dark:bg-[#241a34]",
    icon: "text-[#7c3aed] dark:text-[#a78bfa]",
  },
};

export default function AdvantageCard({
  title,
  description,
  icon,
  theme,
}: AdvantageCardProps) {
  const Icon = iconMap[icon];
  const styles = themeStyles[theme];

  return (
    <div className="group flex flex-col items-start gap-4 px-4 text-center md:px-6">
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
          styles.iconWrap
        )}
      >
        <Icon className={cn("size-5", styles.icon)} aria-hidden="true" />
      </span>
      <h3 className="text-xl font-bold text-brand">{title}</h3>
      <p className="max-w-xs text-lg leading-relaxed text-start text-gray-600 dark:text-white/60">
        {description}
      </p>
    </div>
  );
}
