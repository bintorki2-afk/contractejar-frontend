import { NextResponse } from "next/server";

/**
 * Android App Links. Served only when the signing certificate fingerprint(s)
 * are configured (`ANDROID_SHA256_FINGERPRINTS`, comma-separated, in Vercel
 * env) — until then Android opens the website.
 */
export function GET() {
  const raw = process.env.ANDROID_SHA256_FINGERPRINTS?.trim();
  const packageName = process.env.ANDROID_PACKAGE_NAME?.trim() || "com.contractejar.app";

  const fingerprints = (raw ?? "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter((item) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(item));

  if (fingerprints.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageName,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
