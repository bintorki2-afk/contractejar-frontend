import type { MetadataRoute } from "next";

// PWA manifest — يجعل الموقع قابلًا للتثبيت كتطبيق على الجوال والكمبيوتر.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "عقد إيجار",
    short_name: "عقد إيجار",
    description: "جهّز عقد إيجارك السكني أو التجاري بسهولة وسرعة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    background_color: "#ffffff",
    theme_color: "#0db38b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
