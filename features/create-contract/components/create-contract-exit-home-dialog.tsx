"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";

type CreateContractExitHomeDialogProps = {
  labels: CreateContractLabels["header"]["exitHomeDialog"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber?: string | number | null;
  isSaving?: boolean;
  isExiting?: boolean;
  showSaveOption?: boolean;
  onSaveThenExit: () => void;
  onExitWithoutSaving: () => void;
};

function WarningIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 6.5L50 46.5H6L28 6.5Z"
        fill="#F5C518"
        stroke="#E0A800"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M28 20V32"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="28" cy="39" r="2.25" fill="#1A1A1A" />
    </svg>
  );
}

export default function CreateContractExitHomeDialog({
  labels,
  open,
  onOpenChange,
  orderNumber,
  isSaving = false,
  isExiting = false,
  showSaveOption = true,
  onSaveThenExit,
  onExitWithoutSaving,
}: CreateContractExitHomeDialogProps) {
  const t = useTranslations("createContract.header.exitHomeDialog");
  const isBusy = isSaving || isExiting;
  const resolvedOrderNumber =
    orderNumber != null && String(orderNumber).trim() !== ""
      ? String(orderNumber)
      : "—";
  const incompleteTitle = t("incompleteTitle", {
    orderNumber: resolvedOrderNumber,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-6 shadow-2xl sm:max-w-md"
      >
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="text-[15px] font-bold text-[#1a1a1a]">
            {labels.title}
          </DialogTitle>

          <DialogClose asChild>
            <button
              type="button"
              aria-label={labels.close}
              disabled={isBusy}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#9a9a9a] transition-colors hover:bg-[#e8e8e8] hover:text-[#666] disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </DialogClose>
        </div>

        <div className="mt-7 flex flex-col items-center gap-4 text-center">
          <WarningIcon />

          <div className="space-y-2.5 px-1">
            <p className="text-[22px] font-extrabold leading-snug text-brand md:text-2xl">
              {incompleteTitle}
            </p>
            <p className="text-[13px] leading-6 text-[#8f8f8f] md:text-sm md:leading-7">
              {labels.description}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          {showSaveOption ? (
            <Button
              type="button"
              disabled={isBusy}
              onClick={onSaveThenExit}
              className="h-12 w-full rounded-xl bg-brand text-[15px] font-bold text-white hover:bg-brand/90"
            >
              {isSaving ? labels.saving : labels.saveThenExit}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={onExitWithoutSaving}
            className="h-12 w-full rounded-xl border-[#e6e6e6] bg-white text-[15px] font-bold text-[#e05a45] hover:bg-[#fafafa] hover:text-[#e05a45]"
          >
            {isExiting ? labels.exitingWithoutSaving : labels.exitWithoutSaving}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
            className="h-12 w-full rounded-xl border-brand bg-white text-[15px] font-bold text-brand hover:bg-brand-background-green/40 hover:text-brand"
          >
            {labels.continue}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
