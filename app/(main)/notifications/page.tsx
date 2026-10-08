import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import NotificationsPageContent from "@/features/notifications/components/notifications-page-content";
import { getAccountNotifications } from "@/features/notifications/services/account-notifications";
import type { NotificationsPageLabels } from "@/features/notifications/types/notifications-page-labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notificationsPage");

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function NotificationsPage() {
  const [t, account] = await Promise.all([
    getTranslations("notificationsPage"),
    // Server-stored notifications of the account (the page used to show only
    // push messages received in this browser — «لا توجد إشعارات» even when
    // the account had «تم استلام دفعتك»).
    getAccountNotifications().catch(() => ({ ok: false as const, status: 0 })),
  ]);

  const labels: NotificationsPageLabels = {
    title: t("title"),
    subtitle: t("subtitle"),
    emptyTitle: t("emptyTitle"),
    emptyDescription: t("emptyDescription"),
    clearAll: t("clearAll"),
    enableTitle: t("enableTitle"),
    enableDescription: t("enableDescription"),
    enableDenied: t("enableDenied"),
    enableUnsupported: t("enableUnsupported"),
    enableAction: t("enableAction"),
    enableLoading: t("enableLoading"),
  };

  return (
    <NotificationsPageContent
      labels={labels}
      accountItems={account.ok ? account.items : []}
      accountLoadFailed={!account.ok}
    />
  );
}
