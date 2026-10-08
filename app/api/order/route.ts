import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSameOriginRequest } from "@/lib/security/request-guards";

// Order intake → multi-channel delivery. Public route (middleware excludes /api).
// No auth, no payment, no OTP. Defense-in-depth so an order is never lost:
//   1. Telegram notification (with one retry)   — env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   2. Durable store on the business backend     — env: ORDER_INTAKE_URL (+ optional ORDER_INTAKE_TOKEN)
//   3. Email backup                              — env: RESEND_API_KEY, ORDER_EMAIL_TO, ORDER_EMAIL_FROM
// Any channel that is not configured is skipped. The request succeeds if AT LEAST
// one channel accepted the order; otherwise it fails so the UI can show the
// "contact us on WhatsApp" fallback.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Abuse hardening (public endpoint) ---------------------------------------
// This route has no auth/OTP, so it is rate-limited and size-capped to blunt
// floods (Telegram/email bombing) and oversized payloads. The limiter is
// in-memory and therefore best-effort on serverless (per-instance); a shared
// store (e.g. Upstash/Redis) is the production-grade follow-up for a hard limit.
const MAX_BODY_BYTES = 100 * 1024; // 100 KB — an order is small text/JSON.
const RATE_LIMIT_MAX = 5; // requests…
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // …per IP per minute.
const MAX_SECTIONS = 40;
const MAX_FIELDS_PER_SECTION = 60;
const MAX_STRING_LEN = 2000;

const rateBuckets = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// Returns true when the caller is over the limit.
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );
  hits.push(now);
  rateBuckets.set(ip, hits);

  // Opportunistic cleanup so the map does not grow unbounded.
  if (rateBuckets.size > 5000) {
    for (const [key, ts] of rateBuckets) {
      if (ts.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) rateBuckets.delete(key);
    }
  }

  return hits.length > RATE_LIMIT_MAX;
}

function clip(value: unknown): string {
  return String(value ?? "").slice(0, MAX_STRING_LEN);
}

// Coerce arbitrary parsed JSON into a bounded, well-typed OrderPayload. Anything
// unexpected is dropped rather than trusted, so a hostile body cannot blow up the
// outbound messages or the map.
function sanitizeOrder(raw: unknown): OrderPayload {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const rawSections = Array.isArray(input.sections) ? input.sections : [];
  const sections: OrderSection[] = rawSections
    .slice(0, MAX_SECTIONS)
    .map((section) => {
      const s = (section && typeof section === "object" ? section : {}) as Record<string, unknown>;
      const rawFields = Array.isArray(s.fields) ? s.fields : [];
      const fields: OrderField[] = rawFields
        .slice(0, MAX_FIELDS_PER_SECTION)
        .map((field) => {
          const f = (field && typeof field === "object" ? field : {}) as Record<string, unknown>;
          return { label: clip(f.label), value: clip(f.value) };
        });
      return { title: clip(s.title), fields };
    });

  return {
    orderNumber: input.orderNumber != null ? clip(input.orderNumber) : undefined,
    contractType: input.contractType != null ? clip(input.contractType) : undefined,
    whatsappNumber: input.whatsappNumber != null ? clip(input.whatsappNumber) : undefined,
    notes: input.notes != null ? clip(input.notes) : undefined,
    sections,
  };
}

type OrderField = { label: string; value: string };
type OrderSection = { title: string; fields: OrderField[] };
type OrderPayload = {
  orderNumber?: string;
  contractType?: string;
  whatsappNumber?: string;
  sections?: OrderSection[];
  notes?: string;
};

function buildMessage(order: OrderPayload): string {
  const lines: string[] = ["🆕 طلب جديد — عقد إيجار"];

  if (order.orderNumber) lines.push(`رقم الطلب: ${order.orderNumber}`);
  if (order.contractType) lines.push(`نوع العقد: ${order.contractType}`);
  if (order.whatsappNumber) lines.push(`📱 واتساب للتواصل: ${order.whatsappNumber}`);

  for (const section of order.sections ?? []) {
    const fields = (section.fields ?? []).filter(
      (field) => field?.value != null && String(field.value).trim() !== "",
    );
    if (fields.length === 0) continue;
    lines.push("");
    lines.push(`— ${section.title} —`);
    for (const field of fields) {
      lines.push(`• ${field.label}: ${String(field.value)}`);
    }
  }

  if (order.notes && order.notes.trim() !== "") {
    lines.push("");
    lines.push(`📝 ${order.notes}`);
  }

  return lines.join("\n");
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1) Telegram — one retry on failure.
async function notifyTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        },
      );
      if (response.ok) return true;
      const detail = await response.text().catch(() => "");
      console.error("[api/order] Telegram error", response.status, detail);
    } catch (error) {
      console.error("[api/order] Telegram request failed", error);
    }
    if (attempt === 0) await delay(600);
  }
  return false;
}

// 2) Durable store on the business backend (source of truth).
async function storeOnBackend(
  order: OrderPayload,
  createdAt: string,
): Promise<boolean> {
  const url = process.env.ORDER_INTAKE_URL;
  if (!url) return false;

  const token = process.env.ORDER_INTAKE_TOKEN;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...order, createdAt, source: "web" }),
    });
    if (response.ok) return true;
    const detail = await response.text().catch(() => "");
    console.error("[api/order] Backend store error", response.status, detail);
  } catch (error) {
    console.error("[api/order] Backend store failed", error);
  }
  return false;
}

// 3) Email backup (Resend HTTP API — no extra dependency).
async function emailBackup(order: OrderPayload, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !to || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((address) => address.trim()),
        subject: `طلب جديد${order.orderNumber ? ` — ${order.orderNumber}` : ""}`,
        text,
      }),
    });
    if (response.ok) return true;
    const detail = await response.text().catch(() => "");
    console.error("[api/order] Email backup error", response.status, detail);
  } catch (error) {
    console.error("[api/order] Email backup failed", error);
  }
  return false;
}

export async function POST(request: NextRequest) {
  // 0) Same-origin JSON only: a cross-site page could otherwise make visitors'
  //    browsers post fake orders (text/plain bodies parse as JSON) — each from
  //    a different IP, bypassing the per-IP limit below.
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
    return NextResponse.json({ ok: false, error: "unsupported_media_type" }, { status: 415 });
  }

  // 1) Rate limit (best-effort, per instance).
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // 2) Reject oversized bodies early (declared length, then actual bytes).
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  // 3) Parse + sanitize into a bounded shape.
  let order: OrderPayload;
  try {
    order = sanitizeOrder(JSON.parse(rawBody));
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const createdAt = new Date().toISOString();
  const text = buildMessage(order);

  const telegramConfigured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
  const anyChannelConfigured =
    telegramConfigured ||
    Boolean(process.env.ORDER_INTAKE_URL) ||
    Boolean(process.env.RESEND_API_KEY);

  const [telegram, stored, emailed] = await Promise.all([
    notifyTelegram(text),
    storeOnBackend(order, createdAt),
    emailBackup(order, text),
  ]);

  const delivered = telegram || stored || emailed;
  const channels = { telegram, stored, emailed };

  if (!delivered) {
    console.error("[api/order] No delivery channel succeeded", {
      anyChannelConfigured,
      channels,
    });
    return NextResponse.json(
      {
        ok: false,
        error: anyChannelConfigured ? "delivery_failed" : "server_not_configured",
        channels,
      },
      { status: anyChannelConfigured ? 502 : 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderNumber: order.orderNumber ?? null,
    channels,
  });
}
