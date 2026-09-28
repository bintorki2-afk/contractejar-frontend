import type { MetadataRoute } from "next";

// PWA manifest — يجعل الموقع قابلًا للتثبيت كتطبيق على الجوال والكمبيوتر.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "عقد إيجار",
    short_name: "عقد إيجار",
    description: "جهّز عقد إيجارك السكني أو التجاري بسهولة وسرعة.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    categories: ["business", "productivity", "utilities"],
    background_color: "#ffffff",
    theme_color: "#0db38b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Quick actions on long-press of the installed app icon.
    shortcuts: [
      {
        name: "توثيق عقد سكني",
        short_name: "سكني",
        url: "/service/residential",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "توثيق عقد تجاري",
        short_name: "تجاري",
        url: "/service/commercial",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
