import "server-only";

/**
 * Guards for the public internal route handlers (`app/api/*`). They have no
 * login, so they rely on: same-origin checks (browsers always send `Origin`
 * on POST — a foreign site cannot make a visitor's browser post here), and a
 * best-effort per-IP rate limit (per server instance; a shared store such as
 * Upstash/Redis is the production-grade follow-up).
 */

/** `true` when the request comes from this site (or is not from a browser). */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Browsers send Origin on every cross-site POST; scripts can forge it anyway,
  // so its absence is not treated as an attack (rate limits still apply).
  if (!origin) {
    return request.headers.get("sec-fetch-site") !== "cross-site";
  }

  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    "";

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Sliding-window limiter: returns `true` when `key` is over `max` per `windowMs`. */
export function createRateLimiter(max: number, windowMs: number) {
  const buckets = new Map<string, number[]>();

  return function isRateLimited(key: string): boolean {
    const now = Date.now();
    const hits = (buckets.get(key) ?? []).filter((ts) => now - ts < windowMs);
    hits.push(now);
    buckets.set(key, hits);

    if (buckets.size > 5000) {
      for (const [k, ts] of buckets) {
        if (ts.every((t) => now - t >= windowMs)) buckets.delete(k);
      }
    }

    return hits.length > max;
  };
}

/**
 * Real file type from the first bytes (not the name or the browser's claimed
 * type): JPEG, PNG, WEBP, PDF, HEIC/HEIF. Anything else is rejected.
 */
export async function sniffAllowedDocumentType(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (from: number, to: number) =>
    String.fromCharCode(...head.slice(from, to));

  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  if (ascii(4, 8) === "ftyp" && /^(heic|heix|hevc|mif1|msf1)$/.test(ascii(8, 12))) {
    return "image/heic";
  }
  return null;
}
