import type { Metadata } from "next";

import AccountDeleteContent from "@/features/auth/components/account-delete-content";

export const metadata: Metadata = {
  title: "حذف الحساب",
  description: "طلب حذف حساب عقد إيجار وبياناتك الشخصية.",
  robots: { index: false, follow: false },
};

/**
 * Web page for account deletion (App Store / Google Play "delete account"
 * link, PDPL right to erasure). Signed-out visitors are sent to /login first
 * by the middleware (`/account` is a protected prefix).
 */
export default function AccountDeletePage() {
  return (
    <main className="container py-12 md:py-16">
      <AccountDeleteContent />
    </main>
  );
}
