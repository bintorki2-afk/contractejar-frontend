/**
 * صفحة حالة المنصة (`/status`) — تطبيع رد `GET /api/v2/status` (B20).
 *
 * الشكل المتوقع من الخادم (مرن عمداً، لأن النقطة جديدة):
 *   { status: "ok" | "degraded" | "down",
 *     checks?: { api, database|db, scheduler, gateway|payment_gateway },
 *     checked_at?: ISO }
 * كل فحص قد يكون `"ok"` / `true` / `{ status: "ok" }` / `"error"` / `false`.
 * عند غياب `/status` (خادم أقدم) نشتق من `GET /health`.
 */

export type ComponentState = "ok" | "degraded" | "down" | "unknown";

export type PlatformComponentKey = "api" | "database" | "scheduler" | "gateway";

export type PlatformComponent = {
  key: PlatformComponentKey;
  label: string;
  description: string;
  state: ComponentState;
};

export type PlatformStatus = {
  overall: ComponentState;
  components: PlatformComponent[];
  checkedAt: string | null;
  /** `status` = the dedicated endpoint, `health` = derived fallback, `none` = unreachable. */
  source: "status" | "health" | "none";
};

export const COMPONENT_COPY: Record<PlatformComponentKey, { label: string; description: string }> = {
  api: { label: "خدمة الطلبات (API)", description: "إنشاء العقود وتتبّع الطلبات" },
  database: { label: "قاعدة البيانات", description: "حفظ الطلبات والبيانات" },
  scheduler: { label: "الإشعارات المجدولة", description: "التذكيرات والإشعارات التلقائية" },
  gateway: { label: "بوابة الدفع", description: "الدفع الإلكتروني عبر ميسر" },
};

export const STATE_COPY: Record<ComponentState, string> = {
  ok: "تعمل بشكل طبيعي",
  degraded: "أداء متأثر",
  down: "متوقفة",
  unknown: "غير معروف",
};

export const OVERALL_COPY: Record<ComponentState, string> = {
  ok: "كل الأنظمة تعمل بشكل طبيعي",
  degraded: "بعض الخدمات متأثرة — نعمل على إصلاحها",
  down: "يوجد عطل حالياً — نعمل على إصلاحه",
  unknown: "تعذّر التحقق من حالة المنصة الآن",
};

const ORDER: PlatformComponentKey[] = ["api", "database", "scheduler", "gateway"];

const ALIASES: Record<PlatformComponentKey, string[]> = {
  api: ["api", "app"],
  database: ["database", "db"],
  scheduler: ["scheduler", "cron", "queue"],
  gateway: ["gateway", "payment_gateway", "payments", "moyasar"],
};

export function toComponentState(value: unknown): ComponentState {
  if (value === true) return "ok";
  if (value === false) return "down";
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    if ("status" in row) return toComponentState(row.status);
    if ("ok" in row) return toComponentState(row.ok);
    if ("state" in row) return toComponentState(row.state);
    return "unknown";
  }
  if (typeof value !== "string") return "unknown";

  const text = value.trim().toLowerCase();
  if (["ok", "up", "healthy", "operational", "reachable", "pass", "true"].includes(text)) return "ok";
  if (["degraded", "slow", "stale", "warn", "warning", "partial"].includes(text)) return "degraded";
  if (["down", "error", "fail", "failed", "unreachable", "outage", "false"].includes(text)) return "down";
  return "unknown";
}

function worst(states: ComponentState[]): ComponentState {
  const known = states.filter((state) => state !== "unknown");
  if (known.length === 0) return "unknown";
  if (known.includes("down")) return known.every((s) => s === "down") ? "down" : "degraded";
  if (known.includes("degraded")) return "degraded";
  return "ok";
}

function buildComponents(states: Partial<Record<PlatformComponentKey, ComponentState>>): PlatformComponent[] {
  return ORDER.map((key) => ({
    key,
    label: COMPONENT_COPY[key].label,
    description: COMPONENT_COPY[key].description,
    state: states[key] ?? "unknown",
  }));
}

function asIso(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Normalizes the `/status` body (or its `data` envelope). */
export function normalizeStatusPayload(raw: unknown): PlatformStatus | null {
  if (!raw || typeof raw !== "object") return null;
  let body = raw as Record<string, unknown>;
  if (body.data && typeof body.data === "object" && !Array.isArray(body.data)) {
    body = body.data as Record<string, unknown>;
  }

  const checks =
    body.checks && typeof body.checks === "object"
      ? (body.checks as Record<string, unknown>)
      : body.components && typeof body.components === "object" && !Array.isArray(body.components)
        ? (body.components as Record<string, unknown>)
        : body;

  const states: Partial<Record<PlatformComponentKey, ComponentState>> = {};
  for (const key of ORDER) {
    const alias = ALIASES[key].find((name) => name in checks);
    if (alias) states[key] = toComponentState(checks[alias]);
  }

  // A response at all means the API answered.
  if (!states.api || states.api === "unknown") states.api = "ok";

  const components = buildComponents(states);
  const declared = toComponentState(body.status);
  const computed = worst(components.map((c) => c.state));
  const overall =
    declared === "unknown" ? computed : declared === "ok" && computed !== "ok" ? computed : declared;

  return {
    overall,
    components,
    checkedAt: asIso(body.checked_at) ?? asIso(body.time) ?? asIso(body.cached_at),
    source: "status",
  };
}

/** Fallback from `GET /health` (no gateway check there). */
export function normalizeHealthPayload(raw: unknown, httpOk: boolean): PlatformStatus {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const database = toComponentState(body.db ?? body.database);
  const scheduler =
    body.scheduler_stale === true
      ? "degraded"
      : body.scheduler_stale === false
        ? "ok"
        : "unknown";

  const components = buildComponents({
    api: "ok",
    database: database === "unknown" ? (httpOk ? "ok" : "down") : database,
    scheduler,
    gateway: "unknown",
  });

  return {
    overall: worst(components.map((c) => c.state)),
    components,
    checkedAt: asIso(body.checked_at) ?? asIso(body.time),
    source: "health",
  };
}

export function unreachableStatus(): PlatformStatus {
  return {
    overall: "down",
    components: buildComponents({ api: "down" }),
    checkedAt: null,
    source: "none",
  };
}
