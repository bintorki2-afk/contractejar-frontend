import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const MAX_UPLOAD_BODY_SIZE = 50 * 1024 * 1024; // 50 MB

// Enforced Content-Security-Policy. The directives cover every origin the app
// actually loads, so enforcing does not break functionality:
//   - frame-src: Moyasar payment page, the GTM <noscript> iframe, and the
//     same-origin / blob: / data: iframes used for PDF & image previews.
//   - worker-src: the PWA + Firebase-messaging service workers (same-origin + blob:).
//   - object-src 'none': no plugins/embeds.
// 'unsafe-inline'/'unsafe-eval' remain for now because GTM and the Next.js runtime
// rely on inline scripts; removing them requires per-request nonces (follow-up).
// Local development only: when the API runs on plain http (e.g.
// http://localhost:8010) the browser must be allowed to call it. Production
// uses https, so this adds nothing there.
const apiBase = process.env.NEXT_PUBLIC_BASE_URL || "";
const localApiOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiBase)
  ? new URL(apiBase).origin
  : "";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self' https://*.moyasar.com",
  // Signed deed/address previews (`/contracts/{id}/deed-image/…`) come from the
  // API origin — same local-only exception as connect-src.
  `img-src 'self' data: blob: https:${localApiOrigin ? ` ${localApiOrigin}` : ""}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // clarity.ms: Microsoft Clarity session recordings (features/analytics/clarity-script.tsx).
  // Ad pixels loaded from GTM (docs/ads-tracking.md): Google Ads conversion
  // (googleadservices / googleads.g.doubleclick), TikTok Pixel
  // (analytics.tiktok.com) and Snap Pixel (sc-static.net). Without these the
  // CSP silently blocks the tags and no conversion is recorded.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms https://www.googleadservices.com https://googleads.g.doubleclick.net https://analytics.tiktok.com https://sc-static.net",
  `connect-src 'self' https: wss:${localApiOrigin ? ` ${localApiOrigin}` : ""}`,
  // td.doubleclick.net: Google Ads conversion/remarketing iframe (docs/ads-tracking.md).
  "frame-src 'self' blob: data: https://*.moyasar.com https://www.googletagmanager.com https://td.doubleclick.net",
  "worker-src 'self' blob:",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Enforced (was report-only). The policy is scoped to the origins the app uses.
  { key: "Content-Security-Policy", value: CSP },
];

// Long-lived caching for the static assets under /public that are referenced
// by hashed or stable names. `/_next/static` is already immutable (Next.js).
const STATIC_CACHE_HEADERS = [
  { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
];

// Hosts allowed for next/image remote sources: the API's public storage.
const PRODUCTION_API_HOST = "aqdi-new-backend-main-production.up.railway.app";
const apiImageHost = (() => {
  try {
    const url = new URL(apiBase);
    return url.protocol === "https:" ? url.hostname : "";
  } catch {
    return "";
  }
})();
const IMAGE_REMOTE_PATTERNS = Array.from(
  new Set([PRODUCTION_API_HOST, apiImageHost].filter(Boolean)),
).flatMap((hostname) =>
  ["/storage/**", "/uploads/**", "/images/**"].map((pathname) => ({
    protocol: "https" as const,
    hostname,
    pathname,
  })),
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/images/:path*", headers: STATIC_CACHE_HEADERS },
      { source: "/icons/:path*", headers: STATIC_CACHE_HEADERS },
      { source: "/og-image.png", headers: STATIC_CACHE_HEADERS },
    ];
  },
  experimental: {
    serverActions: {
      // Avoid string parse issues at config load time
      bodySizeLimit: MAX_UPLOAD_BODY_SIZE,
    },
    // Proxy clones the request body and defaults to 10MB.
    // Large deed/sublease PDFs were truncated → "Unexpected end of form".
    proxyClientMaxBodySize: MAX_UPLOAD_BODY_SIZE,
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "radix-ui",
      "recharts",
      "leaflet",
      "react-leaflet",
      "firebase",
      "date-fns",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Backend storage only (صقر ١ on Railway + whatever host NEXT_PUBLIC_BASE_URL
    // points at). The legacy third-party image host was removed (batch D, W3).
    remotePatterns: IMAGE_REMOTE_PATTERNS,
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
