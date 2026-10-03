"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpLeft,
  BookOpen,
  Building2,
  ClipboardList,
  HelpCircle,
  Home,
  Info,
  LifeBuoy,
  LogIn,
  Menu,
  Newspaper,
  Star,
  User,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
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
import StartWithAqdiDialog from "@/features/start-with-aqdi/components/start-with-aqdi-dialog";
import type { StartWithAqdiDialogLabels } from "@/features/start-with-aqdi/types/start-with-aqdi-dialog-labels";
import { cn } from "@/lib/utils";

type MobileRow = {
  href: string;
  label: string;
  icon: ReactNode;
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
  properties: string;
  orders: string;
  more: string;
  reviews: string;
  guide: string;
  support: string;
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
  properties,
  orders,
  more,
  reviews,
  guide,
  support,
  cta,
  menu,
  dialogLabels,
}: NavbarMobileSheetProps) {
  const pathname = usePathname();
  const tNav = useTranslations("navbar");
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isSignedIn = mounted && Boolean(user);

  const primaryRows: MobileRow[] = [
    { href: "/", label: home, icon: <Home className="size-4" aria-hidden="true" /> },
    {
      href: "/properties/my-properties",
      label: properties,
      icon: <Building2 className="size-4" aria-hidden="true" />,
    },
    {
      href: "/requests",
      label: orders,
      icon: <ClipboardList className="size-4" aria-hidden="true" />,
    },
  ];

  const moreRows: MobileRow[] = [
    { href: "/faq", label: faq, icon: <HelpCircle className="size-4" aria-hidden="true" /> },
    { href: "/blog", label: blog, icon: <Newspaper className="size-4" aria-hidden="true" /> },
    { href: "/reviews", label: reviews, icon: <Star className="size-4" aria-hidden="true" /> },
    { href: "/about", label: aboutUs, icon: <Info className="size-4" aria-hidden="true" /> },
    { href: "/guide", label: guide, icon: <BookOpen className="size-4" aria-hidden="true" /> },
    { href: "/support", label: support, icon: <LifeBuoy className="size-4" aria-hidden="true" /> },
  ];

  function renderRow({ href, label, icon }: MobileRow) {
    const active = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <SheetClose asChild key={href}>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-2 text-base font-bold transition-colors hover:text-brand",
            active ? "text-brand" : "text-black dark:text-white/90",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
            {icon}
          </span>
          <span className="leading-none">{label}</span>
        </Link>
      </SheetClose>
    );
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

        <div className="flex flex-col gap-5 py-4">
          <nav aria-label="Main navigation" className="flex flex-col gap-1">
            {primaryRows.map(renderRow)}
          </nav>

          <div className="flex flex-col gap-1">
            <p className="px-2 pb-1 text-xs font-bold text-gray-400 dark:text-white/40">
              {more}
            </p>
            {moreRows.map(renderRow)}
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
