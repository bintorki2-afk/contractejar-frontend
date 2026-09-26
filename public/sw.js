/* Service Worker — عقد إيجار PWA.
 * منفصل تمامًا عن firebase-messaging-sw.js (إشعارات فايربيس تسجّل نفسها بنطاقها).
 * يجعل الموقع قابلًا للتثبيت + سقوط بسيط لوضع عدم الاتصال لصفحات التصفح فقط.
 * لا يلمس طلبات الـ API أو تسجيل الدخول (GET فقط، ونفس الأصل، وتصفّح فقط). */
const CACHE = "ce-pwa-v1";
const OFFLINE_FALLBACK = "/";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // صفحات التصفّح: الشبكة أولًا، ومع عدم الاتصال نرجع لآخر نسخة مخزّنة.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(OFFLINE_FALLBACK)))
    );
  }
});
