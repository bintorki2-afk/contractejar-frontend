import { NextResponse } from "next/server";

// Best-effort forwarding of deed / document images that the customer attached
// in the wizard. This runs AFTER the order itself has already been recorded
// (see /api/order) — it is deliberately isolated so it can NEVER affect whether
// an order succeeds. If it fails (size limits, Telegram not configured, a
// dropped request), the images are simply collected later over WhatsApp, which
// is the existing fallback.
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (same as /api/order).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Keep well under Telegram's 50MB bot limit and typical host body limits.
const MAX_FILES = 15;
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file
const MAX_TOTAL_BYTES = 30 * 1024 * 1024; // 30MB per submission

async function sendDocument(
  token: string,
  chatId: string,
  file: File,
  caption: string,
): Promise<boolean> {
  try {
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("caption", caption.slice(0, 1024));
    form.append("document", file, file.name || "document");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendDocument`,
      { method: "POST", body: form },
    );

    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Nothing to forward to — succeed quietly so the client never treats this as
  // an error (images still reach the business over WhatsApp).
  if (!token || !chatId) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const orderNumber = String(formData.get("orderNumber") ?? "").slice(0, 64);
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File);
  // Optional, parallel to `files`: what each document is (for the caption).
  const labels = formData
    .getAll("labels")
    .map((entry) => (typeof entry === "string" ? entry.slice(0, 120) : ""));

  if (files.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 }, { status: 200 });
  }

  let totalBytes = 0;
  let sent = 0;
  const limited = files.slice(0, MAX_FILES);

  for (let index = 0; index < limited.length; index += 1) {
    const file = limited[index];

    if (file.size > MAX_FILE_BYTES) {
      continue;
    }

    totalBytes += file.size;
    if (totalBytes > MAX_TOTAL_BYTES) {
      break;
    }

    const label = labels[index] || `مرفق ${index + 1}`;
    const caption = orderNumber ? `${label} — الطلب ${orderNumber}` : label;

    if (await sendDocument(token, chatId, file, caption)) {
      sent += 1;
    }
  }

  return NextResponse.json(
    { ok: sent > 0, sent, received: files.length },
    { status: 200 },
  );
}
