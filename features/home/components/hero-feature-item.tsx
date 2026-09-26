import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";

type HeroFeatureItemProps = {
  label: string;
  image?: string;
};

export default function HeroFeatureItem({ label, image }: HeroFeatureItemProps) {
  return (
    <li className="flex items-center gap-3">
      <FaCircleCheck
        className="size-4 shrink-0 text-brand-secondary"
        aria-hidden="true"
      />
      <span className="min-w-0 shrink-0 text-sm font-semibold leading-snug text-black dark:text-white/90 md:text-base">
        {label}
      </span>
      {image ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center md:h-12 md:w-12">
          <Image
            src={image}
            alt=""
            width={48}
            height={48}
            className=" max-w-full object-contain"
            aria-hidden="true"
          />
        </span>
      ) : null}
    </li>
  );
}
