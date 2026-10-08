import { NextResponse } from "next/server";

import { getAndroidFingerprints, getAndroidPackage } from "@/lib/app-links/config";

export const dynamic = "force-dynamic";

/**
 * Android App Links (`/.well-known/assetlinks.json`).
 * 404 until `ANDROID_SHA256_FINGERPRINTS` is configured. The intent filter in
 * the app (`autoVerify`) must claim the same host and paths (/r, /track,
 * /lessor-change).
 */
export function GET() {
  const fingerprints = getAndroidFingerprints();
  if (fingerprints.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: getAndroidPackage(),
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
