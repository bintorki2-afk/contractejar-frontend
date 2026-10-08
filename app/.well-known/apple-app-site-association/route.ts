import { NextResponse } from "next/server";

import {
  APP_LINK_PATHS,
  getAppleTeamId,
  getIosBundleId,
} from "@/lib/app-links/config";

export const dynamic = "force-dynamic";

/**
 * iOS Universal Links (`/.well-known/apple-app-site-association`).
 * Served as JSON with no redirect; 404 until `APPLE_TEAM_ID` is configured.
 * Covers the smart order links, order tracking and the lessor-change flow.
 */
export function GET() {
  const teamId = getAppleTeamId();
  if (!teamId) {
    return new NextResponse(null, { status: 404 });
  }

  const appID = `${teamId}.${getIosBundleId()}`;

  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appIDs: [appID],
            components: APP_LINK_PATHS.map((path) => ({ "/": path })),
            // Legacy key for iOS < 13.
            paths: [...APP_LINK_PATHS],
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
