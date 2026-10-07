import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";

export type CreateContractReviewEditTarget =
  | "overview"
  | "deed"
  | "nationalAddress"
  | "owner"
  | "tenant"
  | "unit"
  | "rent"
  | "contact";

export type CreateContractReviewAttachment = {
  label: string;
  fileName: string;
  /** Bytes; null for a remote (already uploaded) file. */
  size: number | null;
  isImage: boolean;
  /** Local draft file (preview via object URL) … */
  file?: File;
  /** … or an already-uploaded file on the server. */
  remoteUrl?: string | null;
};

export type CreateContractReviewField = {
  label: string;
  value: string;
  /** Opens in a new tab (Google Maps link …). */
  href?: string | null;
  /** Full-width row (long texts such as extra conditions). */
  wide?: boolean;
};

export type CreateContractReviewSection = {
  id: string;
  title: string;
  editTarget: CreateContractReviewEditTarget;
  fields: CreateContractReviewField[];
  attachments?: CreateContractReviewAttachment[];
  variant?: "default" | "rent";
  /** Required data is missing — the card gets a red hint. */
  incomplete?: boolean;
  incompleteHint?: string;
};

export type CreateContractReviewOrderSummary = {
  orderNumber: string;
  contractUuid: string;
  overview: {
    contractType: string;
    startDate: string;
    duration: string;
  };
  sections: CreateContractReviewSection[];
  copyText: string;
};

export function reviewEditTargetToStep(
  target: CreateContractReviewEditTarget,
): CreateContractStep {
  switch (target) {
    case "overview":
    case "rent":
      return "finance";
    case "deed":
    case "nationalAddress":
      return "deed";
    case "owner":
      return "owner";
    case "tenant":
    case "unit":
      return "tenant";
    case "contact":
      return "payment";
  }
}
