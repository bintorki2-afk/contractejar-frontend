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
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com",
  `connect-src 'self' https: wss:${localApiOrigin ? ` ${localApiOrigin}` : ""}`,
  "frame-src 'self' blob: data: https://*.moyasar.com https://www.googletagmanager.com",
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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aqid.subcodeco.com",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "aqid.subcodeco.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "aqid.subcodeco.com",
        pathname: "/images/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
