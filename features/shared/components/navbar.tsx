"use client";

import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import NavbarMain from "@/features/shared/components/navbar-main";
// import NavbarTopBar from "@/features/shared/components/navbar-top-bar"; // top utility bar hidden by request
import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";
import type { StartWithAqdiDialogLabels } from "@/features/start-with-aqdi/types/start-with-aqdi-dialog-labels";
import { cn } from "@/lib/utils";

type NavbarProps = {
  dialogLabels: StartWithAqdiDialogLabels;
};

const SCROLL_THRESHOLD_PX = 80;

export default function Navbar({ dialogLabels }: NavbarProps) {
  const t = useTranslations("navbar");
  const whatsappHref = useWhatsappHref();
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    let frameId = 0;
    let stopAt = 0;

    const syncHeight = () => {
      setHeaderHeight(header.getBoundingClientRect().height);
    };

    const tick = (now: number) => {
      syncHeight();

      if (now < stopAt) {
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      frameId = 0;
    };

    const trackTransition = () => {
      stopAt = performance.now() + 320;
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    syncHeight();
    trackTransition();

    const resizeObserver = new ResizeObserver(() => {
      syncHeight();
    });
    resizeObserver.observe(header);
    window.addEventListener("resize", syncHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncHeight);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [scrolled]);

  useEffect(() => {
    let frameId = 0;
    let lastScrolled = false;

    function updateScrolled() {
      frameId = 0;
      const nextScrolled = window.scrollY > SCROLL_THRESHOLD_PX;

      if (nextScrolled === lastScrolled) {
        return;
      }

      lastScrolled = nextScrolled;
      setScrolled(nextScrolled);
    }

    function handleScroll() {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateScrolled);
    }

    // Sync the initial scroll position (e.g. restored on reload) on the next frame.
    frameId = window.requestAnimationFrame(updateScrolled);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 isolate bg-brand-background-green py-4",
          scrolled && "shadow-sm",
        )}
      >
        <div className="container">
          {/* Top utility bar hidden by request (about/blog/faq still available in the main navbar). */}
          {/* <NavbarTopBar
            aboutUs={t("topBar.aboutUs")}
            blog={t("topBar.blog")}
            faq={t("topBar.faq")}
            httpsSecurity={t("topBar.httpsSecurity")}
            httpfor={t("topBar.httpfor")}
            officialLinks={t("topBar.officialLinks")}
            endWith={t("topBar.endWith")}
            whatsappService={t("topBar.whatsappService")}
            whatsappHref={whatsappHref}
            scrolled={scrolled}
          /> */}
          <NavbarMain
            aboutUs={t("topBar.aboutUs")}
            blog={t("topBar.blog")}
            faq={t("topBar.faq")}
            httpsSecurity={t("topBar.httpsSecurity")}
            httpfor={t("topBar.httpfor")}
            officialLinks={t("topBar.officialLinks")}
            endWith={t("topBar.endWith")}
            whatsappService={t("topBar.whatsappService")}
            brandName={t("brand.name")}
            brandTagline={t("brand.tagline")}
            home={t("nav.home")}
            myProperties={t("nav.myProperties")}
            requests={t("nav.requests")}
              cta={t("cta")}
            profile={t("profile")}
            menu={t("menu")}
            myAccount={t("myAccount")}
            notifications={t("notifications")}
            dialogLabels={dialogLabels}
          />
        </div>
      </header>

      <div
        aria-hidden="true"
        className="shrink-0"
        style={{ height: headerHeight || undefined }}
      />
    </>
  );
}
