"use client";

import { useEffect } from "react";

// يسجّل service worker الخاص بالـ PWA بعد تحميل الصفحة (بدون تعطيل أي شيء).
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* تجاهل الأخطاء بصمت — التسجيل غير حرج */
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
