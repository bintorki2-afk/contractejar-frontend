import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://contractejar.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API, auth flows and per-user / transactional service routes: not
        // meaningful to index and often gated behind authentication.
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/forgot-password",
          "/verify-otp",
          "/reset-password",
          "/profile",
          "/notifications",
          "/requests",
          "/properties",
          "/create-contract",
          "/payment",
          "/lessor-change",
          "/maintenance",
          "/social-callback",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
