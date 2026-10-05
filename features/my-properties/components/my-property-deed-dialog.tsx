"use client";

import { useTranslations } from "next-intl";

import AttachmentPreviewDialog from "@/features/shared/components/attachment-preview-dialog";
import { fileNameFromUrl } from "@/features/shared/utils/attachment-preview-actions";

type MyPropertyDeedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deedImageUrl: string;
};

export default function MyPropertyDeedDialog({
  open,
  onOpenChange,
  deedImageUrl,
}: MyPropertyDeedDialogProps) {
  const t = useTranslations("myProperties.card.deedDialog");

  return (
    <AttachmentPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      labels={{
        title: t("title"),
        close: t("close"),
        print: t("print"),
        download: t("download"),
        view: t("view"),
      }}
      fileName={fileNameFromUrl(deedImageUrl)}
      url={deedImageUrl}
      // A deed is always an image, but its signed backend URL is extensionless
      // so kind-detection would fall back to "other" (a link). Force image so it
      // previews inline instead of sending the user to a raw URL.
      kind="image"
    />
  );
}
