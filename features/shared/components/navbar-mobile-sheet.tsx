"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { ArrowUpLeft, LogIn, Menu, User, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CustomIcon from "@/features/shared/components/custom-icon";
import { scrollToSection } from "@/features/shared/utils/scroll-to-section";
import StartWithAqdiDialog from "@/features/start-with-aqdi/components/start-with-aqdi-dialog";
import type { StartWithAqdiDialogLabels } from "@/features/start-with-aqdi/types/start-with-aqdi-dialog-labels";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  iconSrc: string;
  external?: boolean;
  scrollToSectionId?: string;
  isActive?: boolean;
};

type NavbarMobileSheetProps = {
  aboutUs: string;
  blog: string;
  faq: string;
  httpsSecurity: string;
  httpfor: string;
  officialLinks: string;
  endWith: string;
  whatsappService: string;
  brandName: string;
  brandTagline: string;
  home: string;
  myProperties: string;
  requests: string;
  cta: string;
  profile: string;
  menu: string;
  myAccount: string;
  notifications: string;
  dialogLabels: StartWithAqdiDialogLabels;
};

export default function NavbarMobileSheet({
  aboutUs,
  blog,
  faq,
  brandName,
  brandTagline,
  home,
  cta,
  menu,
  dialogLabels,
}: NavbarMobileSheetProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tNav = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isSignedIn = mounted && Boolean(user);

  const navItems: NavItem[] = [
    { href: "/", label: home, iconSrc: "/icons/home.svg" },
    {
      href: "/blog",
      label: blog,
      iconSrc: "/icons/news-letter.svg",
    },
  ];

  const topLinkClassName =
    "text-base font-bold text-black dark:text-white/90 transition-colors hover:text-brand";

  function handleNavItemClick(
    event: MouseEvent<HTMLAnchorElement>,
    scrollToSectionId?: string,
  ) {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon-lg"
          className="rounded-full  text-white bg-brand hover:border-brand/30  lg:hidden"
          aria-label={menu}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-y-auto p-4"
        showCloseButton={false}
      >
        <SheetHeader className="border-b border-border/60 pb-4 flex flex-row items-center justify-between">
          <SheetTitle className="sr-only">{menu}</SheetTitle>
          <div className="flex items-center gap-3 pe-8">
            <Image
              src="/images/logo.png"
              alt=""
              width={32}
              height={32}
              className="w-10 object-contain"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xl font-bold text-brand">{brandName}</p>
              <p className="truncate text-sm text-gray-600 dark:text-white/60 font-medium">
                {brandTagline}
              </p>
            </div>
          </div>
          <SheetClose className="bg-brand text-white size-7 flex items-center justify-center rounded-full ">
            <X className="size-4" aria-hidden="true" />
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4">
          <nav aria-label="Main navigation" className="flex flex-col gap-4">
            {navItems.map((item) => {
              const active = item.isActive ?? pathname === item.href;

              return (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href}
                    onClick={(event) =>
                      handleNavItemClick(event, item.scrollToSectionId)
                    }
                    className={cn(
                      "inline-flex items-center gap-2 font-bold transition-colors hover:text-brand text-base",
                      active ? "text-brand" : "text-black dark:text-white/90",
                    )}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    <span className="inline-flex size-4 shrink-0 items-center justify-center">
                      <CustomIcon src={item.iconSrc} size={16} />
                    </span>
                    <span className="leading-none">{item.label}</span>
                    {item.external || item.scrollToSectionId ? (
                      <ArrowUpLeft
                        className="size-4 text-brand-secondary"
                        aria-hidden="true"
                      />
                    ) : null}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3">
            <SheetClose asChild>
              <Link href="/about" className={topLinkClassName}>
                {aboutUs}
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link href="/faq" className={topLinkClassName}>
                {faq}
              </Link>
            </SheetClose>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-border/60 pt-4">
          <SheetClose asChild>
            <Link
              href={isSignedIn ? "/profile" : "/login"}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full border border-brand/25 text-sm font-semibold text-brand transition-colors hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8] dark:hover:bg-[#16352f]"
            >
              {isSignedIn ? (
                <User className="size-4" aria-hidden="true" />
              ) : (
                <LogIn className="size-4" aria-hidden="true" />
              )}
              <span>{isSignedIn ? tNav("account") : tNav("login")}</span>
            </Link>
          </SheetClose>

          <StartWithAqdiDialog labels={dialogLabels}>
            <Button className="group h-12 w-full gap-3 rounded-full bg-brand px-5 pe-2 text-sm font-semibold text-white hover:bg-brand/90">
              <span>{cta}</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-brand">
                <ArrowUpLeft
                  className="size-4 transition-transform duration-300 group-hover:-rotate-45"
                  aria-hidden="true"
                />
              </span>
            </Button>
          </StartWithAqdiDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
