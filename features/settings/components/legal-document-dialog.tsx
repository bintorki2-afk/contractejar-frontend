"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRIVACY_POLICY } from "@/content/legal/privacy";
import { TERMS_AND_CONDITIONS } from "@/content/legal/terms";
import LegalDocumentBody from "@/features/settings/components/legal-document-body";

export type LegalDocumentKind = "terms" | "privacy";

type LegalDocumentDialogProps = {
  document: LegalDocumentKind | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Same static legal text as /terms and /privacy, inside the checkout flow. */
export default function LegalDocumentDialog({
  document,
  open,
  onOpenChange,
}: LegalDocumentDialogProps) {
  const tLegal = useTranslations("legal");
  const legalDocument = document === "privacy" ? PRIVACY_POLICY : TERMS_AND_CONDITIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl sm:max-w-lg dark:bg-[#1a2421]"
      >
        <div className="relative flex items-center justify-center border-b border-[#f0f0f0] px-4 py-4 dark:border-[#2f403b]">
          <DialogTitle className="text-center text-base font-extrabold text-brand dark:text-[#48c0b8]">
            {legalDocument.title}
          </DialogTitle>

          <DialogClose asChild>
            <button
              type="button"
              aria-label={tLegal("close")}
              className="absolute start-3 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#9a9a9a] transition-colors hover:bg-[#e8e8e8] hover:text-[#666] dark:bg-[#24302c] dark:text-white/60"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </DialogClose>
        </div>

        <div className="max-h-[min(70dvh,560px)] overflow-y-auto px-5 py-5">
          <LegalDocumentBody
            document={legalDocument}
            updatedAtLabel={tLegal("updatedAt")}
            dense
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
