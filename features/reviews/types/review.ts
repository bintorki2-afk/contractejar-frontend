export type ReviewContractType = "residential" | "commercial";

export type Review = {
  /** Stable unique id (used as React key). */
  id: string;
  /** Reviewer display name. Prefer first name + initial (e.g. "محمد ا.") for privacy. */
  name: string;
  /** Whole-number star rating, 1–5. */
  rating: 1 | 2 | 3 | 4 | 5;
  /** The reviewer's own words, exactly as they wrote them. */
  text: string;
  /** Optional city (e.g. "الرياض"). */
  city?: string;
  /** Optional contract type this review relates to. */
  contractType?: ReviewContractType;
  /** Optional ISO date (YYYY-MM-DD) of the review. */
  date?: string;
};
