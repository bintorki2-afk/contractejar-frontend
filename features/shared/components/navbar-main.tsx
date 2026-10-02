"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpLeft, Info, HelpCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CustomIcon from "@/features/shared/components/custom-icon";
import NavbarAccountButton from "@/features/shared/components/navbar-account-button";
import NavbarMobileSheet from "@/features/shared/components/navbar-mobile-sheet";
import LocaleSwitcher from "@/features/shared/components/locale-switcher";
import NavbarNavLink from "@/features/shared/components/navbar-nav-link";
import ThemeToggle from "@/features/shared/theme/theme-toggle";
import StartWithAqdiDialog from "@/features/start-with-aqdi/components/start-with-aqdi-dialog";
import type { StartWithAqdiDialogLabels } from "@/features/start-with-aqdi/types/start-with-aqdi-dialog-labels";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  external?: boolean;
  scrollToSectionId?: string;
  isActive?: boolean;
};

type NavbarMainProps = {
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

export default function NavbarMain({
  aboutUs,
  blog,
  faq,
  httpsSecurity,
  httpfor,
  officialLinks,
  endWith,
  whatsappService,
  brandName,
  brandTagline,
  home,
  myProperties,
  requests,
  cta,
  profile,
  menu,
  myAccount,
  notifications,
  dialogLabels,
}: NavbarMainProps) {
  const navItems: NavItem[] = [
    {
      href: "/",
      label: home,
      icon: <CustomIcon src="/icons/home.svg" size={16} />,
    },
    {
      href: "/about",
      label: aboutUs,
      icon: <Info className="size-4" aria-hidden="true" />,
    },
    {
      href: "/blog",
      label: blog,
      icon: <CustomIcon src="/icons/news-letter.svg" size={16} />,
    },
    {
      href: "/faq",
      label: faq,
      icon: <HelpCircle className="size-4" aria-hidden="true" />,
    },
  ];

  return (
    <div className="lg:py-4">
      <div
        className={cn(
          "flex items-center justify-between gap-4 lg:rounded-full rounded-2xl bg-white px-5 py-3",
          "md:px-8 md:py-4",
          "dark:bg-[#151c1b] dark:border dark:border-[#232b2a]",
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt=""
            width={100}
            height={100}
            className="w-8 object-contain"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1">
            <p className="text-xl font-bold leading-tight text-brand">
              {brandName}
            </p>
            <p className="truncate text-sm font-medium text-gray-600 dark:text-white/55">
              {brandTagline}
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
        >
          {navItems.map((item) => (
            <NavbarNavLink key={item.label} {...item} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher className="h-12" />
          <ThemeToggle className="size-12" />
          <NavbarAccountButton />
          <StartWithAqdiDialog labels={dialogLabels}>
            <Button className="group h-12 gap-3 rounded-full bg-brand px-5 pe-2 text-sm font-semibold text-white hover:bg-brand/90">
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

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <ThemeToggle />
          <NavbarMobileSheet
            aboutUs={aboutUs}
          blog={blog}
          faq={faq}
          httpsSecurity={httpsSecurity}
          httpfor={httpfor}
          officialLinks={officialLinks}
          endWith={endWith}
          whatsappService={whatsappService}
          brandName={brandName}
          brandTagline={brandTagline}
          home={home}
          myProperties={myProperties}
          requests={requests}
          cta={cta}
          profile={profile}
          menu={menu}
          myAccount={myAccount}
          notifications={notifications}
          dialogLabels={dialogLabels}
          />
        </div>
      </div>
    </div>
  );
}
