"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import AppNotificationToaster from "@/features/notifications/components/app-notification-toaster";
import { useNotificationsInboxStore } from "@/features/notifications/stores/use-notifications-inbox-store";
import { useContractsLiveStore } from "@/features/requests/stores/use-contracts-live-store";

type ForegroundPayload = {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
  };
  data?: {
    title?: string;
    body?: string;
    icon?: string;
  };
};

function parseForegroundMessage(payload: ForegroundPayload) {
  return {
    title: payload.notification?.title || payload.data?.title || "إشعار جديد",
    body: payload.notification?.body || payload.data?.body || "",
    icon: payload.notification?.icon || payload.data?.icon,
  };
}

export function AppNotificationProvider() {
  const applyFirebasePatch = useContractsLiveStore(
    (state) => state.applyFirebasePatch,
  );
  const addNotification = useNotificationsInboxStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    void (async () => {
      const [
        { getFirebaseMessagingAsync, initFirebaseAnalytics, onForegroundMessage },
        { registerFirebaseServiceWorker },
        { showAppNotification },
        { parseContractStatusFirebasePayload },
      ] = await Promise.all([
        import("@/features/notifications/services/firebase-client"),
        import("@/features/notifications/services/get-fcm-token"),
        import("@/features/notifications/services/show-app-notification"),
        import("@/features/requests/utils/parse-contract-status-firebase-payload"),
      ]);

      if (cancelled) {
        return;
      }

      void initFirebaseAnalytics();
      void registerFirebaseServiceWorker();

      const messaging = await getFirebaseMessagingAsync();
      if (!messaging || cancelled) {
        return;
      }

      // Permission already granted (customer or guest who enabled pushes
      // earlier): refresh the token and re-register it so the backend always
      // holds a live token for this browser. Never prompts.
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        void (async () => {
          try {
            const [{ getFcmToken }, { registerFcmToken }] = await Promise.all([
              import("@/features/notifications/services/get-fcm-token"),
              import("@/features/notifications/services/register-fcm-token"),
            ]);
            const token = await getFcmToken({ requestPermission: false });
            if (token && !cancelled) {
              void registerFcmToken(token);
            }
          } catch {
            // Best-effort.
          }
        })();
      }

      unsubscribe = onForegroundMessage((payload) => {
        const message = parseForegroundMessage(payload);
        addNotification(message);

        const contractPatch = parseContractStatusFirebasePayload(payload);

        if (contractPatch) {
          applyFirebasePatch(contractPatch);

          if (contractPatch.status_label) {
            toast.success(contractPatch.status_label);
          } else {
            showAppNotification(message);
          }
          return;
        }

        showAppNotification(message);
      });
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [addNotification, applyFirebasePatch]);

  return <AppNotificationToaster />;
}
