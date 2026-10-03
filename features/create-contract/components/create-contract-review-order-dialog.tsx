"use client";

import {
  ClipboardList,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Pencil,
  Printer,
  Search,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContractReviewOrderSummary } from "@/features/create-contract/hooks/use-contract-review-order-summary";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import type { CreateContractReviewEditTarget } from "@/features/create-contract/types/create-contract-review-order";
import { reviewEditTargetToStep } from "@/features/create-contract/types/create-contract-review-order";
import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";
import { cn } from "@/lib/utils";

type CreateContractReviewOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: CreateContractLabels["payment"]["reviewDialog"];
  contractType: ContractTypeId;
  deedTypeLabels: Record<DeedTypeId, string>;
  deedAttachmentLabels: {
    label: string;
    salePaperLabel?: string;
    frontLabel?: string;
    backLabel?: string;
    inheritanceLabel?: string;
    heirsPoaLabel?: string;
    endowmentCertLabel?: string;
    trusteeshipLabel?: string;
    guardiansPoaLabel?: string;
    deceasedDeedLabel?: string;
  };
  onEditStep: (step: CreateContractStep) => void;
};

type AttachmentPreview = {
  title: string;
  fileName: string;
  url: string;
  isObjectUrl: boolean;
  kind: "image" | "pdf" | "other";
};

function fileNameFromUrl(url: string) {
  try {
    const path = new URL(url, "https://local.invalid").pathname;
    const name = path.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : "";
  } catch {
    return "";
  }
}

function downloadAttachment(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "attachment";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function downloadAttachmentRobust(url: string, fileName: string) {
  try {
    if (url.startsWith("blob:") || url.startsWith("data:")) {
      downloadAttachment(url, fileName);
      return;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    downloadAttachment(objectUrl, fileName);
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function printAttachment(url: string) {
  const printWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (!printWindow) {
    return;
  }

  const triggerPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // Browser may block print until the document finishes loading.
    }
  };

  printWindow.addEventListener("load", triggerPrint);
  window.setTimeout(triggerPrint, 600);
}

function getLocalFile(viewUrl: string): File | null {
  const localMatch = /^local:([a-z0-9-]+):(\d+)$/i.exec(viewUrl);
  if (localMatch) {
    const [, kind, indexRaw] = localMatch;
    const index = Number(indexRaw);
    const deed = useCreateContractDraftStore.getState().deed;
    const filesByKind: Record<string, File[] | undefined> = {
      deed: deed.deedFiles,
      "deed-front": deed.deedFrontFiles,
      "deed-back": deed.deedBackFiles,
      "deed-inheritance": deed.deedInheritanceFiles,
      "deed-heirs-poa": deed.deedHeirsPoaFiles,
      "deed-endowment": deed.deedEndowmentCertFiles,
      "deed-trusteeship": deed.deedTrusteeshipFiles,
      "deed-guardians-poa": deed.deedGuardiansPoaFiles,
      "address-photo": deed.nationalAddressPhotoFiles,
    };
    return filesByKind[kind]?.[index] ?? null;
  }

  if (viewUrl === "local:deed") {
    const deed = useCreateContractDraftStore.getState().deed;
    return deed.deedFiles[0] ?? deed.deedFrontFiles[0] ?? null;
  }

  if (viewUrl === "local:address-photo") {
    return (
      useCreateContractDraftStore.getState().deed.nationalAddressPhotoFiles[0] ??
      null
    );
  }

  return null;
}

function resolveAttachmentKind(
  mimeType: string | undefined,
  url: string,
): AttachmentPreview["kind"] {
  if (
    mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)
  ) {
    return "image";
  }

  if (mimeType === "application/pdf" || /\.pdf(\?|$)/i.test(url)) {
    return "pdf";
  }

  return "other";
}

function resolveAttachmentPreview(
  viewUrl: string,
  title: string,
): AttachmentPreview | null {
  const localFile = getLocalFile(viewUrl);
  if (localFile) {
    return {
      title,
      fileName: localFile.name,
      url: URL.createObjectURL(localFile),
      isObjectUrl: true,
      kind: resolveAttachmentKind(localFile.type, localFile.name),
    };
  }

  if (viewUrl.startsWith("local:")) {
    return null;
  }

  return {
    title,
    fileName: fileNameFromUrl(viewUrl) || title,
    url: viewUrl,
    isObjectUrl: false,
    kind: resolveAttachmentKind(undefined, viewUrl),
  };
}

function EditButton({
  label,
  onClick,
  className = "",
  iconPosition = "start",
}: {
  label: string;
  onClick: () => void;
  className?: string;
  iconPosition?: "start" | "end";
}) {
  const icon = <Pencil className="size-3.5" aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm transition-colors hover:bg-[#f7f7f7] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#24302c]",
        className,
      )}
    >
      {iconPosition === "start" ? icon : null}
      <span>{label}</span>
      {iconPosition === "end" ? icon : null}
    </button>
  );
}

function OverviewEditIcon({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center justify-center rounded-lg text-brand dark:text-[#48c0b8]"
    >
      <Pencil className="size-3.5" aria-hidden="true" />
    </button>
  );
}

function ExternalLinkPreview({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 font-bold text-brand underline-offset-2 hover:underline dark:text-[#48c0b8]"
    >
      <span>{label}</span>
      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

function ViewAttachmentButton({
  label,
  viewUrl,
  fieldLabel,
  onPreview,
}: {
  label: string;
  viewUrl: string;
  fieldLabel: string;
  onPreview: (preview: AttachmentPreview) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const preview = resolveAttachmentPreview(viewUrl, fieldLabel);
        if (preview) {
          onPreview(preview);
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#eef6f3] px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-[#e3f0eb] dark:bg-[#16352f] dark:text-[#48c0b8] dark:hover:bg-[#1d453d]"
    >
      <Eye className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function CreateContractReviewOrderDialog({
  open,
  onOpenChange,
  labels,
  contractType,
  deedTypeLabels,
  deedAttachmentLabels,
  onEditStep,
}: CreateContractReviewOrderDialogProps) {
  const summary = useContractReviewOrderSummary(
    labels,
    contractType,
    deedTypeLabels,
    deedAttachmentLabels,
  );
  const setDeedPhaseIndex = useCreateContractDraftStore(
    (state) => state.setDeedPhaseIndex,
  );
  const setOwnerPhaseIndex = useCreateContractDraftStore(
    (state) => state.setOwnerPhaseIndex,
  );
  const setTenantPhaseIndex = useCreateContractDraftStore(
    (state) => state.setTenantPhaseIndex,
  );
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);

  useEffect(() => {
    return () => {
      if (attachmentPreview?.isObjectUrl) {
        URL.revokeObjectURL(attachmentPreview.url);
      }
    };
  }, [attachmentPreview]);

  function closeAttachmentPreview() {
    setAttachmentPreview(null);
  }

  function handleEdit(target: CreateContractReviewEditTarget) {
    switch (target) {
      case "deed":
        setDeedPhaseIndex(0);
        break;
      case "nationalAddress":
        setDeedPhaseIndex(1);
        break;
      case "owner":
        setOwnerPhaseIndex(0);
        break;
      case "tenant":
        setTenantPhaseIndex(0);
        break;
      case "unit":
        setTenantPhaseIndex(1);
        break;
      default:
        break;
    }

    onOpenChange(false);
    onEditStep(reviewEditTargetToStep(target));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary.copyText);
      toast.success(labels.copySuccess);
    } catch {
      toast.error(labels.copyError);
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: labels.title,
          text: summary.copyText,
        });
        return;
      }

      await navigator.clipboard.writeText(summary.copyText);
      toast.success(labels.copySuccess);
    } catch {
      toast.error(labels.shareError);
    }
  }

  function handlePrint() {
    window.print();
  }

  const overviewItems = [
    {
      key: "contractType",
      label: labels.fields.contractType,
      value: summary.overview.contractType,
      editable: false,
    },
    {
      key: "startDate",
      label: labels.fields.startDate,
      value: summary.overview.startDate,
      editable: true,
    },
    {
      key: "duration",
      label: labels.fields.duration,
      value: summary.overview.duration,
      editable: true,
    },
  ] as const;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="scrollbar-hide max-h-[min(92vh,900px)] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-4 sm:max-w-xl md:p-5 dark:bg-[#1a2421] dark:text-white"
        >
          <div className="relative mb-4 flex items-center justify-between">
            <DialogTitle className="flex items-center justify-center gap-2 text-center text-[15px] font-extrabold text-brand md:text-base dark:text-[#48c0b8]">
              <Search className="size-4 shrink-0" aria-hidden="true" />
              <span>{labels.title}</span>
            </DialogTitle>

            <DialogClose asChild>
              <button
                type="button"
                aria-label={labels.close}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[#9a9a9a] shadow-sm transition-colors hover:bg-[#f0f0f0] hover:text-[#666] dark:bg-[#121a18] dark:text-[#9eb5af] dark:hover:bg-[#24302c] dark:hover:text-white"
              >
                <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </DialogClose>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 border-b border-[#ececec] pb-4 sm:grid-cols-4 dark:border-[#2f403b]">
            <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#dce8e3] bg-[#eef6f3] px-2 py-3 text-center dark:border-[#2f403b] dark:bg-[#16352f]">
              <p className="text-lg font-extrabold leading-none text-brand md:text-xl dark:text-[#48c0b8]">
                {summary.contractUuid}
              </p>
              <p className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6b7c76] dark:text-[#9eb5af]">
                <ClipboardList className="size-3" aria-hidden="true" />
                <span>{labels.orderNumber}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleShare()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e8e8e8] bg-white px-2 py-3 text-brand transition-colors hover:bg-[#fafafa] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              <Share2 className="size-4" aria-hidden="true" />
              <span className="text-xs font-bold">{labels.share}</span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e8e8e8] bg-white px-2 py-3 text-brand transition-colors hover:bg-[#fafafa] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              <Copy className="size-4" aria-hidden="true" />
              <span className="text-xs font-bold">{labels.copy}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#e8e8e8] bg-white px-2 py-3 text-brand transition-colors hover:bg-[#fafafa] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              <Printer className="size-4" aria-hidden="true" />
              <span className="text-xs font-bold">{labels.print}</span>
            </button>
          </div>

          <div className="space-y-3">
            <section className="rounded-lg border border-[#cfe8dd] bg-[#f5fbf8] p-3 shadow-sm dark:border-[#2f403b] dark:bg-[#121a18] dark:shadow-none">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {overviewItems.map((item) => (
                  <div
                    key={item.key}
                    className="relative flex flex-col items-start rounded-lg border border-[#dfe7e3] bg-white px-4 py-3 text-start shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2f403b] dark:bg-[#1a2421] dark:shadow-none"
                  >
                    {item.editable ? (
                      <div className="absolute inset-e-3 top-3">
                        <OverviewEditIcon
                          label={`${labels.edit} ${item.label}`}
                          onClick={() => handleEdit("overview")}
                        />
                      </div>
                    ) : null}
                    <p className="mb-1 text-xs font-bold text-[#8a8a8a] dark:text-[#9eb5af]">
                      {item.label}
                    </p>
                    <p className="text-sm font-extrabold leading-tight text-brand dark:text-[#48c0b8]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {summary.sections.map((section) => {
              if (section.variant === "rent") {
                const amountField = section.fields[1];
                const paymentMethodField = section.fields[0];
                const amount = amountField?.value ?? labels.emptyValue;
                const paymentMethod =
                  paymentMethodField?.value ?? labels.emptyValue;

                return (
                  <section
                    key={section.id}
                    className="relative overflow-hidden rounded-2xl bg-brand px-4 py-5 text-white shadow-sm dark:bg-[#0f6b5c] dark:shadow-none"
                  >
                    <EditButton
                      label={labels.edit}
                      onClick={() => handleEdit(section.editTarget)}
                      className="absolute inset-e-3 top-3 border-white/20 bg-white/15 text-white hover:bg-white/25 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                    />
                    <div className="space-y-2 text-start">
                      <p className="text-sm font-bold opacity-90">
                        {section.title}
                      </p>
                      <p className="text-2xl font-extrabold tracking-tight md:text-3xl">
                        {amount}
                      </p>
                      <p className="text-sm font-medium opacity-90">
                        {paymentMethod}
                      </p>
                    </div>
                  </section>
                );
              }

              const isUnitSection = section.editTarget === "unit";

              return (
                <section
                  key={section.id}
                  className="relative rounded-2xl border border-[#ececec] bg-gray-200/10 p-4 shadow-sm dark:border-[#2f403b] dark:bg-[#121a18] dark:shadow-none"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-brand dark:text-[#48c0b8]">
                      {section.title}
                    </h3>
                    <EditButton
                      label={labels.edit}
                      onClick={() => handleEdit(section.editTarget)}
                      className={
                        isUnitSection
                          ? "border-[#cfe8dd] hover:bg-[#f5fbf8] dark:border-[#2f403b] dark:hover:bg-[#24302c]"
                          : ""
                      }
                      iconPosition={isUnitSection ? "end" : "start"}
                    />
                  </div>

                  {section.incomplete ? (
                    <p className="text-sm font-medium text-[#e11d48] dark:text-[#f87171]">
                      {labels.unitIncomplete}
                    </p>
                  ) : isUnitSection ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {section.fields.map((field, fieldIndex) => (
                        <div
                          key={`${section.id}-${fieldIndex}-${field.label}`}
                          className="rounded-xl border border-[#f0f0f0] bg-white px-3.5 py-2.5 text-start dark:border-[#2f403b] dark:bg-[#1a2421]"
                        >
                          <p className="text-[11px] font-medium text-[#9a9a9a] dark:text-[#9eb5af]">
                            {field.label}
                          </p>

                          {field.href ? (
                            <div className="mt-0.5">
                              <ExternalLinkPreview
                                href={field.href}
                                label={labels.linkPreview}
                              />
                            </div>
                          ) : (
                            <p className="mt-0.5 text-sm font-bold wrap-break-word text-[#2b2b2b] dark:text-white">
                              {field.value}
                            </p>
                          )}

                          {field.viewUrl ? (
                            <div className="mt-2">
                              <ViewAttachmentButton
                                label={labels.view}
                                viewUrl={field.viewUrl}
                                fieldLabel={field.label}
                                onPreview={setAttachmentPreview}
                              />
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-dashed divide-[#e5e5e5] dark:divide-[#2f403b]">
                      {section.fields.map((field, fieldIndex) => (
                        <div
                          key={`${section.id}-${fieldIndex}-${field.label}`}
                          className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0 text-sm">
                            <span className="font-medium text-[#8a8a8a] dark:text-[#9eb5af]">
                              {field.label}:{" "}
                            </span>
                            {field.href ? (
                              <ExternalLinkPreview
                                href={field.href}
                                label={labels.linkPreview}
                              />
                            ) : (
                              <span className="wrap-break-word font-bold text-[#222] dark:text-white">
                                {field.value}
                              </span>
                            )}
                          </div>

                          {field.viewUrl ? (
                            <ViewAttachmentButton
                              label={labels.view}
                              viewUrl={field.viewUrl}
                              fieldLabel={field.label}
                              onPreview={setAttachmentPreview}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-[#8a8a8a] dark:text-[#9eb5af]">
            {labels.hint}
          </p>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-brand px-4 text-sm font-extrabold text-white transition-opacity hover:opacity-90 dark:bg-[#0f6b5c]"
          >
            {labels.confirm}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={attachmentPreview !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeAttachmentPreview();
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 sm:max-w-lg dark:bg-[#1a2421]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#ececec] px-4 py-3 dark:border-[#2f403b]">
            <div className="min-w-0 space-y-0.5 text-start">
              <DialogTitle className="text-sm font-extrabold text-[#1a1a1a] md:text-base dark:text-white">
                {labels.attachmentPreviewTitle}
              </DialogTitle>
              {attachmentPreview?.fileName ? (
                <p className="truncate text-xs text-[#9a9a9a] dark:text-[#9eb5af]">
                  {attachmentPreview.fileName}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={labels.download}
                disabled={!attachmentPreview}
                onClick={() => {
                  if (!attachmentPreview) {
                    return;
                  }

                  void downloadAttachmentRobust(
                    attachmentPreview.url,
                    attachmentPreview.fileName,
                  );
                }}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef] disabled:opacity-50 dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#9eb5af] dark:hover:bg-[#24302c]"
              >
                <Download className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label={labels.print}
                disabled={!attachmentPreview}
                onClick={() => {
                  if (!attachmentPreview) {
                    return;
                  }

                  printAttachment(attachmentPreview.url);
                }}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef] disabled:opacity-50 dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#9eb5af] dark:hover:bg-[#24302c]"
              >
                <Printer className="size-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                aria-label={labels.close}
                onClick={closeAttachmentPreview}
                className="inline-flex size-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f7f7f7] text-[#555555] transition-colors hover:bg-[#efefef] dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#9eb5af] dark:hover:bg-[#24302c]"
              >
                <X className="size-4" strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex min-h-64 items-center justify-center overflow-hidden bg-[#fafafa] p-4 dark:bg-[#121a18]">
            {attachmentPreview?.kind === "image" ? (
              <div className="mx-auto flex w-full max-w-md items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-[#1a2421]">
                {/* Plain <img>: attachments are served from signed, extensionless
                    backend URLs that the next/image loader/allowlist rejects. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachmentPreview.url}
                  alt={attachmentPreview.title}
                  className="max-h-[55vh] w-full object-contain"
                />
              </div>
            ) : attachmentPreview?.kind === "pdf" ? (
              <iframe
                src={attachmentPreview.url}
                title={attachmentPreview.title}
                className="h-[55vh] w-full rounded-xl bg-white dark:bg-[#1a2421]"
              />
            ) : attachmentPreview ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <FileText
                  className="size-12 text-[#b8b0d9] dark:text-[#48c0b8]"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold text-[#2b2b2b] dark:text-white">
                  {attachmentPreview.title}
                </p>
                <a
                  href={attachmentPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-brand underline-offset-2 hover:underline dark:text-[#48c0b8]"
                >
                  {labels.view}
                </a>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
