"use client";
import IntentLink from "@/components/navigation/intent-link";
import type { MouseEvent, ReactNode } from "react";
import { ArrowUpLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollToSection } from "@/features/shared/utils/scroll-to-section";

type NavbarNavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  scrollToSectionId?: string;
  isActive?: boolean;
};

export default function NavbarNavLink({
  href,
  label,
  icon,
  external = false,
  scrollToSectionId,
  isActive,
}: NavbarNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const active = isActive ?? pathname === href;
  const showArrow = external || Boolean(scrollToSectionId);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!scrollToSectionId) {
      return;
    }

    if (scrollToSection(scrollToSectionId)) {
      event.preventDefault();
      window.history.replaceState(null, "", `#${scrollToSectionId}`);
      return;
    }

    if (pathname !== "/") {
      event.preventDefault();
      router.push("/");
    }
  }

  const className = cn(
    "inline-flex items-center gap-2 font-bold text-black dark:text-white/85 transition-colors hover:text-brand",
    active ? "text-brand" : "",
  );

  const content = (
    <>
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="leading-none">{label}</span>
      {showArrow ? (
        <ArrowUpLeft
          className="size-4 text-brand-secondary"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <IntentLink href={href} onClick={handleClick} className={className}>
      {content}
    </IntentLink>
  );
}
