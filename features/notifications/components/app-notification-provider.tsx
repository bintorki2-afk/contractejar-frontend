"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import AppNotificationToaster from "@/features/notifications/components/app-notification-toaster";
import {
  ORDER_UPDATED_EVENT,
  type OrderUpdatedDetail,
} from "@/features/notifications/constants/order-updated-event";
import { PUSH_ENABLED_EVENT } from "@/features/notifications/constants/push-enabled-event";
import { useNotificationsInboxStore } from "@/features/notifications/stores/use-notifications-inbox-store";
import { useContractsLiveStore } from "@/features/requests/stores/use-contracts-live-store";
import { runWhenIdle } from "@/lib/perf/run-when-idle";
import {
  ORDER_AFFECTING_KINDS,
  resolveNotificationKind,
} from "@/features/notifications/utils/notification-kinds";

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
    kind?: string;
    type?: string;
    contract_id?: string;
    order_number?: string;
    contract_uuid?: string;
  };
};

/**
 * A push that changes an order (refund, discount, status…): tell open order
 * views to re-fetch, and refresh the server-rendered lists.
 */
function notifyOrderUpdated(payload: ForegroundPayload, refresh: () => void) {
  const data = payload.data ?? {};
  const kind = data.kind || data.type || "";
  const meta = resolveNotificationKind(kind);
  const isContractEvent = kind === "contract_status_changed" || kind === "contract_received";
  if (!ORDER_AFFECTING_KINDS.has(meta.key) && !isContractEvent) {
    return;
  }

  const contractId = Number(data.contract_id);
  const detail: OrderUpdatedDetail = {
    kind,
    contractId: Number.isFinite(contractId) && contractId > 0 ? contractId : undefined,
    orderNumber: data.order_number || data.contract_uuid || undefined,
  };
  window.dispatchEvent(new CustomEvent(ORDER_UPDATED_EVENT, { detail }));

  if (/^\/(requests|notifications|track|r\/)/.test(window.location.pathname)) {
    refresh();
  }
}

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
  const router = useRouter();
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
          notifyOrderUpdated(payload, () => router.refresh());

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
  }, [addNotification, applyFirebasePatch, router]);

  return <AppNotificationToaster />;
}
