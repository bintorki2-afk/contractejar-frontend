import Footer from "@/features/footer/components/footer";
import FooterBottomBar from "@/features/footer/components/footer-bottom-bar";
import { ServicesPageProvider } from "@/features/services/components/services-page-provider";
import {
  AccountRouteOnly,
  FlowRouteFooterOnly,
  FlowRouteOnly,
} from "@/features/services/components/services-route-chrome";
import ServicesSideBackNav from "@/features/services/components/services-side-back-nav";
import NavbarShell from "@/features/shared/components/navbar-shell";
import { getTranslations } from "next-intl/server";

import type { Metadata } from "next";

// Transactional / account pages: never indexed (robots.txt also disallows them).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ServicesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const footer = await getTranslations("footer");

  return (
    <div
      data-services-layout
      className="flex min-h-screen flex-col bg-brand-background"
    >
      <ServicesPageProvider>
        {/* طلباتي / عقاراتي wear the full site navbar; service flows keep the
            minimal back bar. */}
        <AccountRouteOnly>
          <NavbarShell />
        </AccountRouteOnly>

        <div className="relative flex-1">
          <div className="container pt-3 pb-6 lg:pb-8">
            <FlowRouteOnly>
              <ServicesSideBackNav />
            </FlowRouteOnly>
            <main className="mx-auto w-full">{children}</main>
          </div>
        </div>
      </ServicesPageProvider>

      {/* Full site footer on account pages; the compact bar on service flows
          (never inside the contract wizard). */}
      <AccountRouteOnly>
        <Footer />
      </AccountRouteOnly>
      <FlowRouteFooterOnly>
        <FooterBottomBar
          copyright={footer("copyright", {
            year: String(new Date().getFullYear()),
          })}
          terms={footer("terms")}
          privacy={footer("privacy")}
          termsHref={footer("termsHref")}
          privacyHref={footer("privacyHref")}
          className="container pb-6 pt-8"
        />
      </FlowRouteFooterOnly>
    </div>
  );
}
