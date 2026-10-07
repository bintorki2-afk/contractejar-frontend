"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

type PermissionState = NotificationPermission | "unsupported" | null;

function subscribeToNothing() {
  return () => {};
}

function getPermissionSnapshot(): PermissionState {
  return "Notification" in window ? Notification.permission : "unsupported";
}

// Keep SSR and the hydration render identical — the real permission is read
// from the browser right after hydration.
function getServerPermissionSnapshot(): PermissionState {
  return null;
}

export function useFcm() {
  const [token, setToken] = useState<string | null>(null);
  const browserPermission = useSyncExternalStore(
    subscribeToNothing,
    getPermissionSnapshot,
    getServerPermissionSnapshot,
  );
  const [requestedPermission, setRequestedPermission] =
    useState<NotificationPermission | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications are not supported in this browser.");
      return;
    }

    setIsLoading(true);
    try {
      const { getFcmToken } = await import(
        "@/features/notifications/services/get-fcm-token"
      );
      const deviceToken = await getFcmToken({ requestPermission: true });
      setRequestedPermission(Notification.permission);
      setToken(deviceToken);

      // Hand the token to the backend so status pushes can reach this browser.
      if (deviceToken) {
        const { registerFcmToken } = await import(
          "@/features/notifications/services/register-fcm-token"
        );
        void registerFcmToken(deviceToken);
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    token,
    notificationPermission: requestedPermission ?? browserPermission,
    requestPermission,
    isLoading,
  };
}
