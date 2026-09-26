import CustomIcon from "@/features/shared/components/custom-icon";
import { ShieldCheck } from "lucide-react";

type TrustedEntitiesHeaderProps = {
  badge: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
};

export default function TrustedEntitiesHeader({
  badge,
  titlePrefix,
  titleAccent,
  description,
}: TrustedEntitiesHeaderProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-secondary/10 p-2 text-sm font-bold text-brand border">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white">
          <CustomIcon src="/icons/shiled-check.svg" size={16} />
        </span>
        <span>{badge}</span>
      </div>

      <h2 className="text-3xl font-bold leading-tight md:text-4xl 2xl:text-5xl">
        <span className="text-black dark:text-white/90">{titlePrefix}</span>{" "}
        <span className="text-brand-secondary">{titleAccent}</span>
      </h2>

      <p className="text-base leading-relaxed text-gray-600 dark:text-white/60">
        {description}
      </p>
    </div>
  );
}
