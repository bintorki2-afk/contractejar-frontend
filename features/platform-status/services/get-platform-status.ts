"use server";

import {
  normalizeHealthPayload,
  normalizeStatusPayload,
  unreachableStatus,
  type PlatformStatus,
} from "@/features/platform-status/utils/normalize-platform-status";
import { BASE_URL } from "@/lib/api/constants";

const TIMEOUT_MS = 8000;

async function fetchJson(path: string): Promise<{ ok: boolean; status: number; body: unknown } | null> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      // The API caches the gateway probe 5 min; the page itself must be live.
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, body };
  } catch {
    return null;
  }
}

/**
 * Public, unauthenticated platform status for `/status` (no token, no
 * visitor data). `GET /status` first; an older API without it → `/health`.
 */
export async function getPlatformStatus(): Promise<PlatformStatus> {
  const status = await fetchJson("/status");
  if (status && status.status !== 404) {
    const normalized = normalizeStatusPayload(status.body);
    if (normalized) {
      return normalized;
    }
  }

  const health = await fetchJson("/health");
  if (health) {
    return normalizeHealthPayload(health.body, health.ok);
  }

  return unreachableStatus();
}
