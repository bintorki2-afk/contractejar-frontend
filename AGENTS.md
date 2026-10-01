# AGENTS.md — دليل أي مساعد ذكي (AI) يعمل على هذا المشروع

> ملف **محايد** يعمل مع أي أداة ذكاء اصطناعي (Cursor, GitHub Copilot, Codex, Claude, ChatGPT, Gemini…).
> الغرض: أي AI — أو أي مطوّر بشري — يفتح المشروع ويفهمه كاملاً من هذي الملفات، بدون الاعتماد على ذاكرة أداة معيّنة.

## 📌 ابدأ من هنا (اقرأ بالترتيب)
1. **`AQDI-CONTEXT.md`** — السياق الكامل للمشروع: نظرة عامة، المكوّنات الثلاثة، الحسابات، تقسيم العمل، النشر، القرارات.
2. **`سجل-العمل.md`** — سجل زمني لكل التغييرات والقرارات المهمة (آخِر ما تم في الأعلى).
3. **`CLAUDE.md`** — إرشادات تقنية خاصة بهذا الريبو (أوامر، بنية، إعدادات).

## 📝 قاعدة العمل الذهبية
- **كل تغيير أو قرار مهم → يُسجّل في `سجل-العمل.md` بتاريخه، ثم يُرفع على GitHub.**
- هكذا يبقى السياق محفوظاً مع الكود للأبد، ومتاحاً لأي أداة أو شخص، في أي وقت.

## ⚙️ مبادئ تقنية
- حافظ على التصميم والسلوك القائم ما لم يُطلب تغييره صراحةً.
- المشروع عربي RTL — راعِ ذلك في أي واجهة.
- لا تكتب المفاتيح السرية في الكود أو التوثيق (محفوظة في إعدادات Vercel/Railway).

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
