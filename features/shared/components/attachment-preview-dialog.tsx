"use client";

import { Download, FileText, Printer, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  downloadAttachmentRobust,
  printAttachment,
} from "@/features/shared/utils/attachment-preview-actions";

export type AttachmentPreviewDialogLabels = {
  title: string;
  close: string;
  print: string;
  download: string;
  view: string;
};

type AttachmentPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: AttachmentPreviewDialogLabels;
  fileName?: string;
  url: string | null;
  kind: "image" | "pdf" | "other";
};

export default function AttachmentPreviewDialog({
  open,
  onOpenChange,
  labels,
  fileName,
  url,
  kind,
}: AttachmentPreviewDialogProps) {
  const resolvedFileName = fileName?.trim() || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-lg"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#ececec] px-4 py-3">
          <div className="min-w-0 space-y-0.5 text-start">
            <DialogTitle className="text-sm font-extrabold text-[#1a1a1a] md:text-base">
              {labels.title}
            </DialogTitle>
            {resolvedFileName ? (
              <p className="truncate text-xs text-[#9a9a9a]">{resolvedFileName}</p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={labels.download}
              disabled={!url}
              onClick={() => {
                if (!url) {
                  return;
                }

                void downloadAttachmentRobust(
                  url,
                  resolvedFileName || "attachment",
                );
              }}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef] disabled:opacity-50"
            >
              <Download className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={labels.print}
              disabled={!url}
              onClick={() => {
                if (!url) {
                  return;
                }

                printAttachment(url);
              }}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef] disabled:opacity-50"
            >
              <Printer className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={labels.close}
              onClick={() => onOpenChange(false)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef]"
            >
              <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex min-h-64 items-center justify-center overflow-hidden bg-[#fafafa] p-4">
          {url && kind === "image" ? (
            <div className="mx-auto flex w-full max-w-md items-center justify-center overflow-hidden rounded-xl bg-white">
              {/* Plain <img>: attachments are served from signed, extensionless
                  backend URLs that the next/image loader/allowlist rejects. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={resolvedFileName || labels.title}
                className="max-h-[55vh] w-full object-contain"
              />
            </div>
          ) : url && kind === "pdf" ? (
            <iframe
              src={url}
              title={resolvedFileName || labels.title}
              className="h-[55vh] w-full rounded-xl bg-white"
            />
          ) : url ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <FileText className="size-12 text-brand/70" aria-hidden="true" />
              <p className="text-sm font-bold text-[#2b2b2b]">
                {resolvedFileName || labels.title}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                {labels.view}
              </a>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
