/**
 * Static legal documents (privacy policy / terms) shown on the website.
 *
 * The same text should be pasted into the dashboard (الإعدادات ← سياسة
 * الخصوصية / الشروط) so the mobile app, which reads `GET /settings`, shows
 * identical content. `docs/legal/*.html` is generated from these files for
 * that purpose (`node scripts/export-legal-html.mjs`).
 */
export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Optional paragraphs after the bullet list. */
  after?: string[];
};

export type LegalDocument = {
  title: string;
  /** ISO date (YYYY-MM-DD) of the last revision. */
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
};
