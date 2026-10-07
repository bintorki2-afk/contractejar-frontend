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

// The contract wizard and the lessor-change flow are focused, full-attention
// flows: no footer at all (copyright / terms / privacy live inside the payment
// step's disclaimer).
function isFocusedFlowRoute(pathname: string): boolean {
  return (
    pathname === "/create-contract" ||
    pathname.startsWith("/create-contract/") ||
    pathname === "/lessor-change" ||
    pathname.startsWith("/lessor-change/")
  );
}

/** Renders its children on service flows EXCEPT the focused flows above. */
export function FlowRouteFooterOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return isAccountRoute(pathname) || isFocusedFlowRoute(pathname) ? null : (
    <>{children}</>
  );
}
