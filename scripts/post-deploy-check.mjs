#!/usr/bin/env node
/**
 * فحص ما بعد النشر — موقع «عقد إيجار» (دفعة د، item 51).
 *
 * يُشغَّل من جهاز ريان (Mac) أو المنسّق بعد كل نشر على الإنتاج — لا يحتاج أي مكتبة (Node 20+):
 *
 *   node scripts/post-deploy-check.mjs
 *   node scripts/post-deploy-check.mjs --site https://contractejar.com --api https://aqdi-new-backend-main-production.up.railway.app/api/v2
 *   node scripts/post-deploy-check.mjs --no-psi          # بدون PageSpeed (أسرع)
 *   PSI_API_KEY=... node scripts/post-deploy-check.mjs   # مفتاح PageSpeed اختياري (حصة أعلى)
 *   node scripts/post-deploy-check.mjs --json report.json
 *
 * يفحص: الصفحات الأساسية (200)، robots.txt، sitemap.xml (وعيّنة من روابطه)، تحويل
 * www و http، ترويسات الأمان، canonical، noindex للصفحات الخاصة، ملفات روابط التطبيق،
 * نقاط الـ API العامة (/health و/status و/pricing)، وPageSpeed (جوال) للصفحات الأهم.
 * المخرج جدول ✅/⚠️/❌ — ورمز خروج 1 عند أي ❌.
 */

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const SITE = argValue("--site", process.env.SITE_URL || "https://contractejar.com").replace(/\/$/, "");
const API = argValue(
  "--api",
  process.env.API_URL || "https://aqdi-new-backend-main-production.up.railway.app/api/v2",
).replace(/\/$/, "");
const RUN_PSI = !args.includes("--no-psi");
const JSON_OUT = argValue("--json", "");
const PSI_KEY = process.env.PSI_API_KEY || "";
const TIMEOUT_MS = 20_000;

const siteHost = new URL(SITE).hostname;
const results = [];

function record(group, name, status, detail = "") {
  results.push({ group, name, status, detail });
}

async function request(url, { method = "GET", redirect = "follow", timeout = TIMEOUT_MS, headers = {} } = {}) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method,
      redirect,
      headers: { "User-Agent": "contractejar-post-deploy-check/1.0", ...headers },
      signal: AbortSignal.timeout(timeout),
    });
    const text = method === "HEAD" || redirect === "manual" ? "" : await response.text();
    return { ok: true, response, text, ms: Date.now() - started };
  } catch (error) {
    return { ok: false, error: error?.message || String(error), ms: Date.now() - started };
  }
}

// ---------------------------------------------------------------- pages
const PAGES = [
  "/",
  "/service/residential",
  "/service/commercial",
  "/service/lessor-change",
  "/guide",
  "/faq",
  "/blog",
  "/reviews",
  "/about",
  "/support",
  "/privacy",
  "/terms",
  "/track",
  "/status",
];
const NOINDEX_PAGES = new Set(["/track", "/status"]);

async function checkPages() {
  for (const path of PAGES) {
    const res = await request(`${SITE}${path}`);
    if (!res.ok) {
      record("الصفحات", path, "fail", res.error);
      continue;
    }
    const { response, text, ms } = res;
    if (response.status !== 200) {
      record("الصفحات", path, "fail", `HTTP ${response.status}`);
      continue;
    }
    const issues = [];
    const robotsMeta = /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i.exec(text)?.[1] ?? "";
    if (NOINDEX_PAGES.has(path)) {
      if (!/noindex/i.test(robotsMeta)) issues.push("ينقصها noindex");
    } else if (/noindex/i.test(robotsMeta)) {
      issues.push("عليها noindex بالخطأ");
    }
    if (!NOINDEX_PAGES.has(path)) {
      const canonical = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(text)?.[1];
      if (!canonical) issues.push("بدون canonical");
      else if (new URL(canonical, SITE).hostname !== siteHost) issues.push(`canonical على ${canonical}`);
    }
    if (!/<title>[^<]{5,}<\/title>/i.test(text)) issues.push("بدون title");
    if (/aqid\.subcodeco\.com/i.test(text)) issues.push("فيها النطاق القديم");
    record(
      "الصفحات",
      path,
      issues.length ? "warn" : ms > 3000 ? "warn" : "pass",
      [`${ms}ms`, ...issues].join(" · "),
    );
  }
}

// ---------------------------------------------------------------- robots / sitemap
async function checkRobotsAndSitemap() {
  const robots = await request(`${SITE}/robots.txt`);
  if (!robots.ok || robots.response.status !== 200) {
    record("robots/sitemap", "robots.txt", "fail", robots.ok ? `HTTP ${robots.response.status}` : robots.error);
  } else {
    const body = robots.text;
    const issues = [];
    if (/^\s*Disallow:\s*\/\s*$/im.test(body)) issues.push("Disallow: / يمنع الموقع كاملاً!");
    if (!/Sitemap:\s*https?:\/\//i.test(body)) issues.push("بدون Sitemap");
    if (!/Disallow:\s*\/api\//i.test(body)) issues.push("لا يمنع /api/");
    record("robots/sitemap", "robots.txt", issues.some((i) => i.includes("!")) ? "fail" : issues.length ? "warn" : "pass", issues.join(" · "));
  }

  const sitemap = await request(`${SITE}/sitemap.xml`);
  if (!sitemap.ok || sitemap.response.status !== 200) {
    record("robots/sitemap", "sitemap.xml", "fail", sitemap.ok ? `HTTP ${sitemap.response.status}` : sitemap.error);
    return;
  }
  const urls = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const foreign = urls.filter((u) => {
    try {
      return new URL(u).hostname !== siteHost;
    } catch {
      return true;
    }
  });
  record(
    "robots/sitemap",
    "sitemap.xml",
    urls.length === 0 ? "fail" : foreign.length ? "warn" : "pass",
    `${urls.length} رابط${foreign.length ? ` · ${foreign.length} على نطاق آخر (مثل ${foreign[0]})` : ""}`,
  );

  // Sample: the static pages + up to 8 blog posts must answer 200.
  const sample = [...urls.filter((u) => !u.includes("/blog/")), ...urls.filter((u) => u.includes("/blog/")).slice(0, 8)];
  const broken = [];
  for (const url of sample) {
    const res = await request(url, { method: "HEAD" });
    const status = res.ok ? res.response.status : 0;
    if (status !== 200) broken.push(`${url} (${status || res.error})`);
  }
  record(
    "robots/sitemap",
    `روابط الخريطة (عيّنة ${sample.length})`,
    broken.length ? "fail" : "pass",
    broken.slice(0, 3).join(" · "),
  );
}

// ---------------------------------------------------------------- redirects
async function checkRedirects() {
  const www = `https://www.${siteHost}/guide`;
  const res = await request(www, { redirect: "manual" });
  if (!res.ok) {
    record("التحويلات", "www ← النطاق الأساسي", "warn", `تعذّر الاتصال (${res.error}) — هل www مضاف في Vercel؟`);
  } else {
    const location = res.response.headers.get("location") || "";
    const status = res.response.status;
    const permanent = status === 301 || status === 308;
    const target = location ? new URL(location, www) : null;
    const good = permanent && target?.hostname === siteHost && target.pathname === "/guide";
    record(
      "التحويلات",
      "www ← النطاق الأساسي",
      good ? "pass" : status === 307 || status === 302 ? "warn" : "fail",
      `HTTP ${status} → ${location || "—"}${!permanent && location ? " (مؤقت: اجعله 308 من Vercel ← Domains)" : ""}`,
    );
  }

  const http = await request(`http://${siteHost}/`, { redirect: "manual" });
  if (http.ok) {
    const location = http.response.headers.get("location") || "";
    record(
      "التحويلات",
      "http ← https",
      location.startsWith("https://") && [301, 308].includes(http.response.status) ? "pass" : "warn",
      `HTTP ${http.response.status} → ${location || "—"}`,
    );
  } else {
    record("التحويلات", "http ← https", "warn", http.error);
  }
}

// ---------------------------------------------------------------- headers
async function checkHeaders() {
  const res = await request(`${SITE}/`, { method: "HEAD" });
  if (!res.ok) {
    record("الأمان", "ترويسات الأمان", "fail", res.error);
    return;
  }
  const h = res.response.headers;
  const required = {
    "content-security-policy": "CSP",
    "strict-transport-security": "HSTS",
    "x-frame-options": "X-Frame-Options",
    "x-content-type-options": "nosniff",
    "referrer-policy": "Referrer-Policy",
  };
  const missing = Object.entries(required)
    .filter(([key]) => !h.get(key))
    .map(([, label]) => label);
  record("الأمان", "ترويسات الأمان", missing.length ? "fail" : "pass", missing.length ? `ناقص: ${missing.join("، ")}` : "");
  if (h.get("x-powered-by")) record("الأمان", "X-Powered-By مخفي", "warn", h.get("x-powered-by"));

  const csp = h.get("content-security-policy") || "";
  const adHosts = ["www.googletagmanager.com", "www.googleadservices.com", "analytics.tiktok.com"];
  const blocked = adHosts.filter((host) => !csp.includes(host));
  record("الأمان", "CSP يسمح بوسوم الإعلانات", blocked.length ? "warn" : "pass", blocked.length ? `غير مسموح: ${blocked.join("، ")}` : "");
}

// ---------------------------------------------------------------- app links
async function checkWellKnown() {
  for (const path of ["/.well-known/apple-app-site-association", "/.well-known/assetlinks.json"]) {
    const res = await request(`${SITE}${path}`);
    if (!res.ok) {
      record("روابط التطبيق", path, "warn", res.error);
      continue;
    }
    const status = res.response.status;
    if (status === 404) {
      record("روابط التطبيق", path, "warn", "404 — متغيرات APPLE_TEAM_ID / ANDROID_SHA256_FINGERPRINTS غير مضبوطة في Vercel");
      continue;
    }
    let valid = false;
    try {
      JSON.parse(res.text);
      valid = true;
    } catch {
      valid = false;
    }
    const type = res.response.headers.get("content-type") || "";
    record(
      "روابط التطبيق",
      path,
      status === 200 && valid && type.includes("json") ? "pass" : "fail",
      `HTTP ${status} · ${type || "بدون content-type"}${valid ? "" : " · JSON غير صالح"}`,
    );
  }
}

// ---------------------------------------------------------------- API
async function checkApi() {
  const health = await request(`${API}/health`, { headers: { Accept: "application/json" } });
  if (!health.ok) {
    record("الـ API", "/health", "fail", health.error);
  } else {
    let body = {};
    try {
      body = JSON.parse(health.text);
    } catch {
      body = {};
    }
    const stale = body.scheduler_stale === true;
    record(
      "الـ API",
      "/health",
      health.response.status === 200 ? (stale ? "warn" : "pass") : "fail",
      `HTTP ${health.response.status} · db=${body.db ?? "?"}${stale ? " · المجدول متوقف (>20 دقيقة)" : ""} · ${health.ms}ms`,
    );
  }

  const status = await request(`${API}/status`, { headers: { Accept: "application/json" } });
  if (!status.ok) {
    record("الـ API", "/status", "warn", status.error);
  } else if (status.response.status === 404) {
    record("الـ API", "/status", "warn", "404 — نسخة الخادم لا تحوي نقطة الحالة بعد");
  } else {
    let overall = "?";
    try {
      const parsed = JSON.parse(status.text);
      overall = parsed.status ?? parsed.data?.status ?? "?";
    } catch {
      overall = "رد غير JSON";
    }
    record("الـ API", "/status", status.response.status === 200 && overall === "ok" ? "pass" : "warn", `HTTP ${status.response.status} · ${overall}`);
  }

  const pricing = await request(`${API}/pricing`, { headers: { Accept: "application/json" } });
  if (!pricing.ok) {
    record("الـ API", "/pricing", "fail", pricing.error);
  } else {
    const ok = pricing.response.status === 200 && /meter_transfer_fee|housing|commercial/.test(pricing.text);
    record("الـ API", "/pricing", ok ? "pass" : "fail", `HTTP ${pricing.response.status} · ${pricing.ms}ms`);
  }

  // CORS: the site origin must be allowed for browser calls.
  const cors = await request(`${API}/settings`, { headers: { Origin: SITE, Accept: "application/json" } });
  if (cors.ok) {
    const allow = cors.response.headers.get("access-control-allow-origin") || "";
    record("الـ API", "CORS للموقع", allow === SITE || allow === "*" ? "pass" : "warn", allow ? `allow-origin: ${allow}` : "بدون Access-Control-Allow-Origin");
  }
}

// ---------------------------------------------------------------- PageSpeed
const PSI_PAGES = ["/", "/service/residential", "/blog"];

async function checkPageSpeed() {
  for (const path of PSI_PAGES) {
    const params = new URLSearchParams({ url: `${SITE}${path}`, strategy: "mobile" });
    for (const category of ["performance", "seo", "accessibility", "best-practices"]) {
      params.append("category", category);
    }
    if (PSI_KEY) params.set("key", PSI_KEY);
    const res = await request(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, {
      timeout: 120_000,
    });
    if (!res.ok || res.response.status !== 200) {
      record("PageSpeed (جوال)", path, "warn", res.ok ? `HTTP ${res.response.status} (جرّب PSI_API_KEY)` : res.error);
      continue;
    }
    let data;
    try {
      data = JSON.parse(res.text);
    } catch {
      record("PageSpeed (جوال)", path, "warn", "رد غير JSON");
      continue;
    }
    const cats = data.lighthouseResult?.categories ?? {};
    const audits = data.lighthouseResult?.audits ?? {};
    const score = (key) => Math.round((cats[key]?.score ?? 0) * 100);
    const perf = score("performance");
    const seo = score("seo");
    const lcp = audits["largest-contentful-paint"]?.displayValue ?? "?";
    const cls = audits["cumulative-layout-shift"]?.displayValue ?? "?";
    const tbt = audits["total-blocking-time"]?.displayValue ?? "?";
    record(
      "PageSpeed (جوال)",
      path,
      perf >= 70 && seo >= 90 ? "pass" : perf >= 50 ? "warn" : "fail",
      `أداء ${perf} · SEO ${seo} · وصول ${score("accessibility")} · ممارسات ${score("best-practices")} · LCP ${lcp} · CLS ${cls} · TBT ${tbt}`,
    );
  }
}

// ---------------------------------------------------------------- run
const ICON = { pass: "✅", warn: "⚠️ ", fail: "❌" };

async function main() {
  console.log(`\nفحص ما بعد النشر\n  الموقع: ${SITE}\n  الـ API: ${API}\n`);
  await checkPages();
  await checkRobotsAndSitemap();
  await checkRedirects();
  await checkHeaders();
  await checkWellKnown();
  await checkApi();
  if (RUN_PSI) {
    console.log("… PageSpeed (قد يأخذ دقيقة لكل صفحة)");
    await checkPageSpeed();
  }

  let group = "";
  for (const row of results) {
    if (row.group !== group) {
      group = row.group;
      console.log(`\n■ ${group}`);
    }
    console.log(`  ${ICON[row.status]} ${row.name}${row.detail ? `  —  ${row.detail}` : ""}`);
  }

  const count = (s) => results.filter((r) => r.status === s).length;
  console.log(`\nالنتيجة: ${count("pass")} ناجح · ${count("warn")} تنبيه · ${count("fail")} فشل\n`);

  if (JSON_OUT) {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(
      JSON_OUT,
      JSON.stringify({ site: SITE, api: API, checked_at: new Date().toISOString(), results }, null, 2),
    );
    console.log(`حُفظ التقرير: ${JSON_OUT}`);
  }

  process.exitCode = count("fail") > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error("تعذّر تشغيل الفحص:", error);
  process.exitCode = 2;
});
