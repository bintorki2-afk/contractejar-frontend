/* global self, importScripts, firebase */
// Keep in sync with NEXT_PUBLIC_FIREBASE_* env vars.

importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBGg6G-3NZb6-M-6gcjsLEY6IjIN3ixJII",
  authDomain: "aqdi-3d3ee.firebaseapp.com",
  projectId: "aqdi-3d3ee",
  storageBucket: "aqdi-3d3ee.firebasestorage.app",
  messagingSenderId: "834427823859",
  appId: "1:834427823859:web:9ad86ee9158753eac5f986",
  measurementId: "G-73D838TV0M",
});

const messaging = firebase.messaging();

// Only open pages of this site from a notification (smart links point at the
// public domain, e.g. https://contractejar.com/r/123456 → /r/123456).
function toSitePath(url) {
  try {
    const parsed = new URL(url, self.location.origin);
    return parsed.pathname + parsed.search;
  } catch (error) {
    return "/notifications";
  }
}

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.data?.title || payload.notification?.title || "عقد إيجار";
  const notificationOptions = {
    body:
      payload.data?.body ||
      payload.notification?.body ||
      "لديك تحديث جديد على طلبك.",
    icon: "/icons/icon-192.png",
    dir: "rtl",
    lang: "ar",
    data: { url: toSitePath(payload.data?.url || "/notifications") },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Tap on a notification → open (or focus) the order page it is about.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = toSitePath(event.notification?.data?.url || "/notifications");
  const target = new URL(path, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const client of windows) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            return client.navigate(target).then((c) => (c || client).focus());
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
