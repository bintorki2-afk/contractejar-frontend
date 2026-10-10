// Generates docs/legal/privacy.html + terms.html from content/legal/*.ts so the
// owner can paste the same text into the dashboard (settings → privacy/terms)
// and the mobile app (which reads GET /settings) shows identical content.
// Usage: node scripts/export-legal-html.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadDocument(file, exportName) {
  let source = readFileSync(path.join(root, "content/legal", file), "utf8");
  // Inline the shared sentence import so the module evaluates standalone.
  source = source.replace(
    /import \{ ORDER_JOURNEY_SENTENCE \} from "@\/features\/requests\/data\/order-journey";/,
    'const ORDER_JOURNEY_SENTENCE = "بعد الدفع يستلم موظفنا طلبك ويوثّق العقد في إيجار مباشرةً، وتصلك إشعارات بكل خطوة.";',
  );
  source = source.replace(/import type .* from "@\/content\/legal\/types";\n/, "");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const sandbox = { exports: {} };
  new Function("module", "exports", js)(sandbox, sandbox.exports);
  return sandbox.exports[exportName];
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function toHtml(doc) {
  const parts = [`<p><strong>آخر تحديث: ${esc(doc.updatedAt)}</strong></p>`];
  for (const p of doc.intro) parts.push(`<p>${esc(p)}</p>`);
  for (const s of doc.sections) {
    parts.push(`<h2>${esc(s.heading)}</h2>`);
    for (const p of s.paragraphs ?? []) parts.push(`<p>${esc(p)}</p>`);
    if (s.bullets?.length) parts.push(`<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`);
    for (const p of s.after ?? []) parts.push(`<p>${esc(p)}</p>`);
  }
  return parts.join("\n");
}

mkdirSync(path.join(root, "docs/legal"), { recursive: true });
for (const [file, exportName, out] of [
  ["privacy.ts", "PRIVACY_POLICY", "privacy.html"],
  ["terms.ts", "TERMS_AND_CONDITIONS", "terms.html"],
]) {
  const doc = loadDocument(file, exportName);
  writeFileSync(path.join(root, "docs/legal", out), toHtml(doc) + "\n");
  console.log("wrote docs/legal/" + out);
}
