"use client";

import { Copy, Home, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { FaWhatsapp } from "react-icons/fa";

import CreateContractExitHomeDialog from "@/features/create-contract/components/create-contract-exit-home-dialog";
import { SAVE_DRAFT_ENABLED } from "@/features/create-contract/config";
import { isDisplayableOrderNumber } from "@/features/create-contract/utils/is-displayable-order-number";
import { useSaveContractDraft } from "@/features/create-contract/hooks/use-save-contract-draft";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { scheduleCreateContractDraftResetOnUnmount } from "@/features/create-contract/utils/reset-create-contract-draft";
import { deleteContract } from "@/features/requests/services/delete-contract";
import { cn } from "@/lib/utils";

type CreateContractHeaderProps = {
  pageTitle: string;
  labels: CreateContractLabels["header"];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
};

const iconButtonClassName =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-auto sm:gap-2 sm:px-4";

export default function CreateContractHeader({
  pageTitle,
  labels,
  isDarkMode,
  onToggleDarkMode,
}: CreateContractHeaderProps) {
  const router = useRouter();
  const tDelete = useTranslations("requests.card");
  const { saveDraft, isSaving } = useSaveContractDraft();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contractId = useCreateContractDraftStore(
    (state) =>
      state.contractSession?.contractId ??
      state.contractStep1Data?.contract_id ??
      null,
  );
  const contractUuid = useCreateContractDraftStore(
    (state) => state.contractSession?.uuid ?? null,
  );
  // Only show the real backend order number (6-digit uuid), never the temporary
  // placeholder id a fresh session starts with.
  const displayOrderNumber = isDisplayableOrderNumber(contractUuid)
    ? String(contractUuid)
    : null;

  async function handleCopyRequest() {
    if (!displayOrderNumber) {
      return;
    }

    const text = `${labels.requestPrefix} #${displayOrderNumber}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(labels.copySuccess);
    } catch {
      toast.error(labels.copyError);
    }
  }

  function handleHomeClick() {
    if (!contractId) {
      router.push("/");
      return;
    }

    setExitDialogOpen(true);
  }

  async function handleSaveThenExit() {
    const result = await saveDraft();

    if (!result.ok) {
      toast.error(
        result.error === "missingContractSession"
          ? labels.exitHomeDialog.missingContractSession
          : result.error || labels.exitHomeDialog.saveError,
      );
      return;
    }

    setExitDialogOpen(false);
    scheduleCreateContractDraftResetOnUnmount();
    router.push("/");
  }

  async function handleExitWithoutSaving() {
    if (!contractId) {
      setExitDialogOpen(false);
      scheduleCreateContractDraftResetOnUnmount();
      router.push("/");
      return;
    }

    setIsDeleting(true);

    try {
      // Best-effort cleanup of the abandoned draft. Never block leaving on it:
      // the site is account-less, so the customer must always be able to exit
      // to home even if the delete request fails.
      await deleteContract(contractId).catch(() => null);
    } finally {
      setIsDeleting(false);
      setExitDialogOpen(false);
      scheduleCreateContractDraftResetOnUnmount();
      router.push("/");
    }
  }

  return (
    <>
      <div className="sticky top-0 z-30 pb-2">
        <div className="flex w-full items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm sm:gap-2 sm:p-2 dark:border dark:border-[#2f403b] dark:bg-[#1a2421]">
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label={labels.home}
          className={cn(
            iconButtonClassName,
            "bg-brand-background-green text-brand hover:bg-brand-background-green/80 dark:bg-[#16352f] dark:text-[#48c0b8] dark:hover:bg-[#1c4039]",
          )}
        >
          <Home className="size-4 shrink-0" aria-hidden />
          <span className="hidden truncate sm:inline">{labels.home}</span>
        </button>

        <span
          className="inline-flex h-10 min-w-0 max-w-[9.5rem] shrink items-center justify-center truncate rounded-full bg-brand px-3 text-xs font-bold text-white sm:h-11 sm:max-w-none sm:px-4 sm:text-sm"
          title={pageTitle}
        >
          <span className="truncate">{pageTitle}</span>
        </span>

        {displayOrderNumber ? (
          <button
            type="button"
            onClick={() => void handleCopyRequest()}
            className="inline-flex h-10 min-w-0 max-w-[8.5rem] flex-1 items-center gap-1.5 rounded-full border border-[#e4e4e4] bg-white px-2.5 text-xs font-bold text-brand transition-colors hover:bg-brand-background sm:h-11 sm:max-w-[14rem] sm:flex-none sm:gap-2 sm:px-4 sm:text-sm dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#16352f]"
          >
            <Copy className="size-3.5 shrink-0 sm:size-4" aria-hidden />
            <span className="truncate">
              {labels.requestPrefix} #{displayOrderNumber}
            </span>
          </button>
        ) : null}

        <Link
          href={labels.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.help}
          className={cn(
            iconButtonClassName,
            "ms-auto border border-[#e4e4e4] bg-white text-brand hover:bg-brand-background dark:border-[#2f403b] dark:bg-[#121a18] dark:hover:bg-[#16352f]",
          )}
        >
          <FaWhatsapp
            className="size-4 shrink-0 text-[#25D366]"
            aria-hidden
          />
          <span className="hidden truncate sm:inline">{labels.help}</span>
        </Link>

        <button
          type="button"
          aria-label={isDarkMode ? labels.light : labels.dark}
          aria-pressed={isDarkMode}
          onClick={onToggleDarkMode}
          className={cn(
            iconButtonClassName,
            "border border-[#e4e4e4] bg-white text-brand hover:bg-brand-background dark:border-[#2f403b]",
            isDarkMode &&
              "border-brand-secondary/40 bg-brand text-white hover:bg-brand/90 dark:border-brand-secondary/40 dark:bg-brand",
          )}
        >
          {isDarkMode ? (
            <Sun className="size-4 shrink-0" aria-hidden />
          ) : (
            <Moon className="size-4 shrink-0" aria-hidden />
          )}
          <span className="hidden truncate sm:inline">
            {isDarkMode ? labels.light : labels.dark}
          </span>
        </button>
        </div>
      </div>

      <CreateContractExitHomeDialog
        labels={labels.exitHomeDialog}
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        orderNumber={displayOrderNumber}
        isSaving={isSaving}
        isExiting={isDeleting}
        showSaveOption={SAVE_DRAFT_ENABLED}
        onSaveThenExit={() => void handleSaveThenExit()}
        onExitWithoutSaving={() => void handleExitWithoutSaving()}
      />
    </>
  );
}
