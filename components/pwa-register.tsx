"use client";

import { useEffect } from "react";

import { runWhenIdle } from "@/lib/perf/run-when-idle";

// يسجّل service worker الخاص بالـ PWA بعد أول تفاعل (أو بعد ثوانٍ من التحميل)
// حتى لا ينافس تثبيت الـ SW عرض الصفحة الأول (#27). التسجيل غير حرج.
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    return runWhenIdle(() => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* تجاهل الأخطاء بصمت — التسجيل غير حرج */
      });
    });
  }, []);

  return null;
}
