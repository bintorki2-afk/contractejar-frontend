"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import AppNotificationToaster from "@/features/notifications/components/app-notification-toaster";
import { PUSH_ENABLED_EVENT } from "@/features/notifications/constants/push-enabled-event";
import { useNotificationsInboxStore } from "@/features/notifications/stores/use-notifications-inbox-store";
import { useContractsLiveStore } from "@/features/requests/stores/use-contracts-live-store";
import { runWhenIdle } from "@/lib/perf/run-when-idle";

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

/**
 * Firebase on the website is deferred (#27):
 *  - Analytics initialises on the first interaction (or a few seconds after
 *    load), when the browser is idle.
 *  - Messaging (foreground listener, service worker, token refresh) starts
 *    only when the customer already granted notifications, or right after
 *    they opt in via «فعّل التنبيهات» (ف11) — never on page load for new
 *    visitors, and it never prompts by itself.
 */
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
    let messagingStarted = false;

    async function startMessaging(refreshToken: boolean) {
      if (messagingStarted || cancelled) return;
      messagingStarted = true;

      try {
        const [
          { getFirebaseMessagingAsync, onForegroundMessage },
          { registerFirebaseServiceWorker },
          { showAppNotification },
          { parseContractStatusFirebasePayload },
        ] = await Promise.all([
          import("@/features/notifications/services/firebase-client"),
          import("@/features/notifications/services/get-fcm-token"),
          import("@/features/notifications/services/show-app-notification"),
          import("@/features/requests/utils/parse-contract-status-firebase-payload"),
        ]);

        if (cancelled) return;

        void registerFirebaseServiceWorker();

        const messaging = await getFirebaseMessagingAsync();
        if (!messaging || cancelled) return;

        // Permission already granted (customer or guest who enabled pushes
        // earlier): refresh the token and re-register it so the backend always
        // holds a live token for this browser. Never prompts.
        if (refreshToken) {
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
      } catch {
        // Firebase is optional: never break the page.
      }
    }

    const cancelIdle = runWhenIdle(() => {
      if (cancelled) return;

      void import("@/features/notifications/services/firebase-client")
        .then(({ initFirebaseAnalytics }) => initFirebaseAnalytics())
        .catch(() => null);

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        void startMessaging(true);
      }
    });

    // Opt-in from the notifications page: start listening right away (the
    // token was already registered by `useFcm`).
    const onPushEnabled = () => void startMessaging(false);
    window.addEventListener(PUSH_ENABLED_EVENT, onPushEnabled);

    return () => {
      cancelled = true;
      cancelIdle();
      window.removeEventListener(PUSH_ENABLED_EVENT, onPushEnabled);
      unsubscribe();
    };
  }, [addNotification, applyFirebasePatch]);

  return <AppNotificationToaster />;
}
