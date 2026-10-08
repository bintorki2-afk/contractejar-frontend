/**
 * App deep-link configuration (iOS Universal Links / Android App Links).
 *
 * Read from env (Vercel → Project → Settings → Environment Variables):
 *   APPLE_TEAM_ID               Apple Team ID (10 chars)   — legacy alias: IOS_TEAM_ID
 *   IOS_BUNDLE_ID               default com.contractejar.app
 *   ANDROID_PACKAGE             default com.contractejar.app — legacy alias: ANDROID_PACKAGE_NAME
 *   ANDROID_SHA256_FINGERPRINTS comma-separated SHA-256 fingerprints of the release key
 *
 * Both `.well-known` files return 404 until their values are set, so the OS
 * keeps opening the website (no broken deep links before the app is signed).
 */
export const DEFAULT_IOS_BUNDLE_ID = "com.contractejar.app";
export const DEFAULT_ANDROID_PACKAGE = "com.contractejar.app";

/** Paths the app claims (kept identical in the app's entitlements/intent filter). */
export const APP_LINK_PATHS = ["/r/*", "/track*", "/lessor-change*"] as const;

function env(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

export function getAppleTeamId() {
  return env("APPLE_TEAM_ID") || env("IOS_TEAM_ID");
}

export function getIosBundleId() {
  return env("IOS_BUNDLE_ID") || DEFAULT_IOS_BUNDLE_ID;
}

export function getAndroidPackage() {
  return env("ANDROID_PACKAGE") || env("ANDROID_PACKAGE_NAME") || DEFAULT_ANDROID_PACKAGE;
}

export function getAndroidFingerprints(): string[] {
  return env("ANDROID_SHA256_FINGERPRINTS")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter((item) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(item));
}
