import { Check } from "lucide-react";
import Image from "next/image";

import type { ContractType } from "@/features/start-with-aqdi/types/contract-type";
import { cn } from "@/lib/utils";

type StartWithAqdiContractCardProps = {
  type: ContractType;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  selected: boolean;
  onSelect: (type: ContractType) => void;
};

export default function StartWithAqdiContractCard({
  type,
  title,
  description,
  imageSrc,
  imageAlt,
  selected,
  onSelect,
}: StartWithAqdiContractCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={cn(
        "flex h-full flex-col items-center rounded-2xl  lg:rounded-[50px]   p-4 text-center transition-all",
        selected
          ? " bg-brand-background-green shadow-sm"
          : " bg-brand-background"
      )}
    >
      <div className="mb-4 flex h-28 w-full items-center justify-center">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={140}
          height={112}
          className="h-auto max-h-28 w-auto object-contain"
        />
      </div>

      <h3
        className={cn(
          "text-sm font-bold leading-snug",
          selected ? "text-brand" : "text-foreground"
        )}
      >
        {title}
      </h3>

      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>

      <span
        className={cn(
          "mt-4 flex size-6 items-center justify-center rounded-full border-2",
          selected
            ? "border-brand-secondary  bg-brand-secondary  text-white shadow-xl shadow-brand-secondary"
            : "border-[#d1d5db] bg-white dark:border-[#262d2c] dark:bg-[#151c1b]"
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}
