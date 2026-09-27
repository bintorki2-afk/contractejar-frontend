"use client";

import { Hand, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InstrumentTypePopupItem } from "@/features/shared/types/instrument-type-popup";
import CustomIcon from "@/features/shared/components/custom-icon";
import { cn } from "@/lib/utils";

type InstrumentTypePopupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup: InstrumentTypePopupItem | null;
  deedTypeLabel: string;
};

export default function InstrumentTypePopupDialog({
  open,
  onOpenChange,
  popup,
  deedTypeLabel,
}: InstrumentTypePopupDialogProps) {
  const t = useTranslations("instrumentTypePopup");

  const title = popup ? t("title", { deedType: deedTypeLabel }) : "";
  const hasSecondaryAction = Boolean(
    popup?.button_text?.trim() && popup?.button_link?.trim(),
  );

  function handleConfirm() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {popup ? (
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden rounded-[50px] p-8 sm:min-w-xl sm:p-12"
        >
        <div className="flex items-start justify-between gap-4 border-b border-[#ececec] dark:border-[#262d2c] pb-4">
          <DialogTitle className="text-base font-bold leading-snug text-[#333333] dark:text-white/80">
            {title}
          </DialogTitle>

          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-[#999999] dark:text-white/50 hover:bg-brand-background hover:text-[#666666] dark:hover:text-white/60"
              aria-label={t("close")}
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-secondary shadow-lg shadow-brand-secondary/40">
            <Hand className="size-8 text-white" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <p className="text-xl font-extrabold leading-relaxed text-brand md:text-2xl">
              {title}
            </p>
            <p className="text-sm text-[#7f7f7f] dark:text-white/50">{t("clarification")}</p>
          </div>
        </div>

        <div
          className={cn(
            "mt-6 rounded-3xl border border-[#ececec] dark:border-[#262d2c] bg-[#fafafa] dark:bg-[#141d1a] p-5 text-start text-sm leading-7 text-[#4d4d4d] dark:text-white/60",
            "[&_p]:mb-3 [&_p:last-child]:mb-0",
            "[&_strong]:font-bold [&_strong]:text-brand-secondary",
          )}
          dangerouslySetInnerHTML={{ __html: popup.content_popup }}
        />

        <div className="mt-8 space-y-3">
          <Button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "h-12 w-full rounded-xl text-base font-extrabold",
              "bg-linear-to-br from-brand-secondary via-brand to-brand text-white hover:opacity-90",
            )}
          >
            <CustomIcon src="/icons/arrow-r.svg" size={24} />
            {t("confirmContinue")}
            <CustomIcon src="/icons/arrow-l.svg" size={24} />
          </Button>

          {hasSecondaryAction ? (
            <Button
              type="button"
              variant="outline"
              asChild
              className="h-12 w-full rounded-xl border-brand-secondary text-base font-bold text-brand-secondary hover:bg-brand-background"
            >
              <a
                href={popup.button_link!}
                target="_blank"
                rel="noopener noreferrer"
              >
                {popup.button_text}
              </a>
            </Button>
          ) : null}
        </div>
      </DialogContent>
      ) : null}
    </Dialog>
  );
}
