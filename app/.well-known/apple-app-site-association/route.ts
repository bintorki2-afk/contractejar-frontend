import { NextResponse } from "next/server";

/**
 * iOS Universal Links. Served only when the Apple Team ID is configured
 * (`IOS_TEAM_ID` in Vercel env) — until then iOS falls back to the website.
 * Must be served as JSON with no redirect, at exactly this path.
 */
export function GET() {
  const teamId = process.env.IOS_TEAM_ID?.trim();
  const bundleId = process.env.IOS_BUNDLE_ID?.trim() || "com.contractejar.app";

  if (!teamId) {
    return new NextResponse(null, { status: 404 });
  }

  const appID = `${teamId}.${bundleId}`;

  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: [appID],
            components: [{ "/": "/r/*", comment: "smart order links" }],
            paths: ["/r/*"],
          },
        ],
      },
      webcredentials: { apps: [appID] },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
