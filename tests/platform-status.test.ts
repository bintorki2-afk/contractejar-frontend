import { describe, expect, it } from "vitest";

import {
  normalizeHealthPayload,
  normalizeStatusPayload,
  toComponentState,
  unreachableStatus,
} from "@/features/platform-status/utils/normalize-platform-status";

const states = (s: ReturnType<typeof normalizeHealthPayload>) =>
  Object.fromEntries(s.components.map((c) => [c.key, c.state]));

describe("platform status (/status page)", () => {
  it("reads the checks object of GET /status", () => {
    const result = normalizeStatusPayload({
      status: "ok",
      checks: { api: "ok", db: "ok", scheduler: { status: "ok" }, gateway: true },
      checked_at: "2026-10-09T06:00:00+03:00",
    });
    expect(result?.overall).toBe("ok");
    expect(states(result!)).toEqual({ api: "ok", database: "ok", scheduler: "ok", gateway: "ok" });
    expect(result?.checkedAt).toBe("2026-10-09T06:00:00+03:00");
    expect(result?.source).toBe("status");
  });

  it("accepts flat keys and a data envelope", () => {
    const result = normalizeStatusPayload({
      data: { api: true, database: "ok", scheduler: "stale", payment_gateway: "unreachable" },
    });
    expect(states(result!)).toEqual({
      api: "ok",
      database: "ok",
      scheduler: "degraded",
      gateway: "down",
    });
    // One component down among healthy ones = degraded overall, not a full outage.
    expect(result?.overall).toBe("degraded");
  });

  it("never reports ok overall when a component is down", () => {
    const result = normalizeStatusPayload({ status: "ok", checks: { db: "error" } });
    expect(result?.overall).toBe("degraded");
  });

  it("falls back to /health (no gateway check)", () => {
    const result = normalizeHealthPayload({ status: "ok", db: "ok", scheduler_stale: false }, true);
    expect(states(result)).toEqual({ api: "ok", database: "ok", scheduler: "ok", gateway: "unknown" });
    expect(result.overall).toBe("ok");
    expect(normalizeHealthPayload({ db: "error" }, false).overall).toBe("degraded");
  });

  it("unreachable API = down", () => {
    expect(unreachableStatus().overall).toBe("down");
  });

  it("maps state words", () => {
    expect(toComponentState("operational")).toBe("ok");
    expect(toComponentState("warning")).toBe("degraded");
    expect(toComponentState("failed")).toBe("down");
    expect(toComponentState(undefined)).toBe("unknown");
  });
});
