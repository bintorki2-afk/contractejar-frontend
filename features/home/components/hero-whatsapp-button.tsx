import { FaWhatsapp } from "react-icons/fa";

import WhatsappCtaLink from "@/features/analytics/components/whatsapp-cta-link";

type HeroWhatsappButtonProps = {
  label: string;
  href?: string;
};

export default function HeroWhatsappButton({
  label,
  href = "https://wa.me/",
}: HeroWhatsappButtonProps) {
  return (
    <WhatsappCtaLink
      placement="hero_floating"
      href={href}
      aria-label={label}
      className="fixed bottom-6 end-6 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 lg:absolute"
    >
      {/* Attention pulse ring toward the primary conversion channel. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring"
      />
      <FaWhatsapp className="relative size-7" aria-hidden="true" />
    </WhatsappCtaLink>
  );
}
