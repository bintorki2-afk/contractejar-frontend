import type { Analytics } from "firebase/analytics";
import type { FirebaseApp } from "firebase/app";
import type { MessagePayload, Messaging } from "firebase/messaging";

import {
  getFirebaseClientConfig,
  isFirebaseConfigured,
} from "@/features/notifications/services/firebase-config";

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;
let messagingSupport: boolean | null = null;
let onMessageFn:
  | ((
      messagingInstance: Messaging,
      callback: (payload: MessagePayload) => void,
    ) => () => void)
  | null = null;

async function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!app) {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    app =
      getApps().length === 0
        ? initializeApp(getFirebaseClientConfig())
        : getApp();
  }

  return app;
}

export async function initFirebaseAnalytics() {
  if (typeof window === "undefined" || analytics) {
    return analytics;
  }

  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  try {
    const { getAnalytics, getGoogleAnalyticsClientId, isSupported } =
      await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    analytics = getAnalytics(firebaseApp);

    // `getAnalytics` starts an internal, non-awaited initialisation (dynamic
    // config + installations fetches to *.googleapis.com). When those hosts
    // are blocked (ad blockers, offline, strict proxies) that promise rejects
    // with nobody listening → "Uncaught (in promise) TypeError: Failed to
    // fetch" and a noise event in Sentry. The SDK exposes no handle on that
    // promise, but `getGoogleAnalyticsClientId` awaits it synchronously, so
    // attaching a catch here observes the rejection and keeps analytics
    // best-effort. (If gtag never loads the derived promise simply stays
    // pending; it is never awaited.)
    void getGoogleAnalyticsClientId(analytics).catch(() => {});

    return analytics;
  } catch {
    // Offline / blocked (ad blockers, proxies): analytics is best-effort and
    // must never surface as an unhandled rejection.
    return null;
  }
}

export async function getFirebaseMessagingAsync(): Promise<Messaging | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (messaging) {
    return messaging;
  }

  const { getMessaging, isSupported, onMessage } = await import(
    "firebase/messaging"
  );

  if (messagingSupport === null) {
    messagingSupport = await isSupported();
  }

  if (!messagingSupport) {
    return null;
  }

  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  onMessageFn = onMessage;
  messaging = getMessaging(firebaseApp);
  return messaging;
}

export const getFirebaseMessaging = (): Messaging | null => messaging;

export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void,
) => {
  const messagingInstance = getFirebaseMessaging();
  if (messagingInstance && onMessageFn) {
    return onMessageFn(messagingInstance, callback);
  }

  return () => {};
};
