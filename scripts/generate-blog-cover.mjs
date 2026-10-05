// Generates unified blog cover images (1280x720) that match the existing
// public/images/blog/*.png design: dark-green gradient, brand lockup, category
// pill, accented title + subtitle, a category icon badge, and the footer mark.
//
// Usage: node scripts/generate-blog-cover.mjs <slug> [<slug> ...]
// Reads content/blog/<slug>.json, writes public/images/blog/<slug>.png.
//
// Requires playwright-core + the pre-installed Chromium (PLAYWRIGHT path). It is
// a build/content helper, not part of the app bundle.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_DIR = path.join(ROOT, "app/fonts");
const BLOG_DIR = path.join(ROOT, "content/blog");
const OUT_DIR = path.join(ROOT, "public/images/blog");
const CHROME = process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium";

const CATEGORY = {
  contracts: { label: "العقود", icon: "contract" },
  "property-management": { label: "إدارة العقارات", icon: "manage" },
  "real-estate-market": { label: "سوق العقارات", icon: "market" },
};

const ICONS = {
  // document with lines + check circle
  contract: `<path d="M16 8 h22 l10 10 v34 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 V10 a2 2 0 0 1 2 -2 z"/><path d="M38 8 v10 h10"/><line x1="20" y1="28" x2="33" y2="28"/><line x1="20" y1="35" x2="29" y2="35"/><circle cx="40" cy="41" r="10"/><path d="m36 41 3 3 6 -6"/>`,
  // clipboard / management
  manage: `<rect x="14" y="12" width="36" height="44" rx="4"/><path d="M24 12 a4 4 0 0 1 4 -4 h8 a4 4 0 0 1 4 4"/><line x1="22" y1="28" x2="42" y2="28"/><line x1="22" y1="36" x2="42" y2="36"/><line x1="22" y1="44" x2="34" y2="44"/>`,
  // trending-up / market
  market: `<path d="M14 50 V16"/><path d="M14 50 H50"/><path d="m20 44 10 -10 6 6 12 -14"/><path d="M42 26 h6 v6"/>`,
};

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Cover title/subtitle: split the article title at the first ":" or "؟".
function splitTitle(title) {
  const m = title.match(/^(.*?[؟])\s*(.*)$/) || title.match(/^(.*?)\s*[:：]\s*(.*)$/);
  if (m && m[2]) return { main: m[1].trim(), sub: m[2].trim() };
  return { main: title.trim(), sub: "" };
}

// Accent the first word of the title in mint.
function accentFirstWord(main) {
  const parts = main.split(" ");
  const first = esc(parts.shift() || "");
  const rest = esc(parts.join(" "));
  return `<span class="accent">${first}</span>${rest ? " " + rest : ""}`;
}

async function fontDataUrl(file) {
  const buf = await fs.readFile(path.join(FONT_DIR, file));
  return `data:font/woff2;base64,${buf.toString("base64")}`;
}

function html({ font400, font700, categoryLabel, icon, titleHtml, sub }) {
  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>
@font-face{font-family:'Plex';font-weight:400;src:url(${font400}) format('woff2');}
@font-face{font-family:'Plex';font-weight:700;src:url(${font700}) format('woff2');}
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1280px;height:720px;font-family:'Plex',sans-serif;overflow:hidden;}
.cover{position:relative;width:1280px;height:720px;overflow:hidden;
  background:radial-gradient(120% 120% at 14% 86%, #1a6150 0%, #0c4234 68%);
  color:#fff;}
.rings{position:absolute;left:-150px;bottom:-170px;}
.rings span{position:absolute;border:1px solid rgba(255,255,255,.05);border-radius:50%;}
.r1{width:420px;height:420px;} .r2{width:560px;height:560px;left:-70px;bottom:-70px;}
.r3{width:700px;height:700px;left:-140px;bottom:-140px;}
.dot{position:absolute;width:11px;height:11px;border-radius:50%;background:#63e4c2;}
.logo{position:absolute;top:60px;left:80px;display:flex;direction:ltr;align-items:center;gap:11px;}
.logo b{font-weight:700;font-size:30px;color:#fff;}
.logo svg{width:26px;height:26px;color:#63e4c2;}
.pill{position:absolute;top:66px;right:80px;display:flex;align-items:center;gap:10px;
  border:1.5px solid rgba(99,228,194,.45);border-radius:999px;padding:9px 22px;
  color:#63e4c2;font-weight:700;font-size:21px;}
.pill i{width:9px;height:9px;border-radius:50%;background:#63e4c2;display:block;}
.textblock{position:absolute;top:0;bottom:0;right:80px;width:660px;
  display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right;}
h1{font-weight:700;font-size:46px;line-height:1.5;color:#f4fbf9;max-width:640px;}
h1 .accent{color:#63e4c2;}
.sub{margin-top:22px;font-weight:400;font-size:24px;line-height:1.7;color:#b4d2c7;max-width:560px;}
.badge{position:absolute;left:92px;top:50%;transform:translateY(-50%);
  width:234px;height:234px;border-radius:34px;background:rgba(255,255,255,.055);
  border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;}
.badge svg{width:120px;height:120px;color:#7fe6c8;}
.footer{position:absolute;bottom:54px;right:80px;display:flex;align-items:center;gap:16px;
  color:#63e4c2;font-weight:700;font-size:20px;}
.footer .line{width:46px;height:2px;background:#63e4c2;display:block;}
</style></head><body>
<div class="cover">
  <div class="rings"><span class="r1"></span><span class="r2"></span><span class="r3"></span></div>
  <span class="dot" style="left:120px;top:150px"></span>
  <span class="dot" style="left:70px;top:360px"></span>
  <div class="logo"><b>عقد إيجار</b>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="3.5"/><path d="M10 13 20 3"/><path d="M16.5 6.5 19 9"/></svg>
  </div>
  <div class="pill"><i></i>${esc(categoryLabel)}</div>
  <div class="textblock">
    <h1>${titleHtml}</h1>
    ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
  </div>
  <div class="badge">
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
  </div>
  <div class="footer">مدونة عقد إيجار<span class="line"></span></div>
</div>
</body></html>`;
}

async function main() {
  const slugs = process.argv.slice(2);
  if (!slugs.length) {
    console.error("usage: node scripts/generate-blog-cover.mjs <slug> [<slug> ...]");
    process.exit(1);
  }
  const [font400, font700] = await Promise.all([
    fontDataUrl("ibm-plex-sans-arabic-arabic-400-normal.woff2"),
    fontDataUrl("ibm-plex-sans-arabic-arabic-700-normal.woff2"),
  ]);

  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  for (const slug of slugs) {
    const article = JSON.parse(await fs.readFile(path.join(BLOG_DIR, `${slug}.json`), "utf8"));
    const cat = CATEGORY[article.categoryId] || CATEGORY.contracts;
    const { main, sub } = splitTitle(article.title);
    const doc = html({
      font400, font700,
      categoryLabel: cat.label,
      icon: ICONS[cat.icon],
      titleHtml: accentFirstWord(main),
      sub,
    });
    await page.setContent(doc, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const out = path.join(OUT_DIR, `${slug}.png`);
    await page.locator(".cover").screenshot({ path: out });
    console.log("wrote", path.relative(ROOT, out));
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
