"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// "Account" pages (طلباتي / عقاراتي) should wear the full site chrome — the main
// navbar and footer — so they feel part of the site. The contract-creation flow
// and other service pages keep their focused, minimal chrome.
function isAccountRoute(pathname: string): boolean {
  return (
    pathname === "/requests" ||
    pathname.startsWith("/requests/") ||
    pathname === "/properties/my-properties" ||
    pathname.startsWith("/properties/my-properties/")
  );
}

/** Renders its children only on the account pages (طلباتي / عقاراتي). */
export function AccountRouteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isAccountRoute(pathname) ? <>{children}</> : null;
}

/** Renders its children everywhere EXCEPT the account pages. */
export function FlowRouteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isAccountRoute(pathname) ? null : <>{children}</>;
}
