"use client";

import { fileNameFromUrl } from "@/features/shared/utils/attachment-preview-actions";
import {
  Check,
  CloudDownload,
  Eye,
  ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  compressImageFile,
  MAX_SERVER_ACTION_UPLOAD_BYTES,
} from "@/lib/files/compress-image";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { cn } from "@/lib/utils";
type CreateContractDeedImageUploadProps = {
  labels: CreateContractLabels["deed"]["deedImage"];
  value: File[];
  onChange: (files: File[]) => void;
  existingImageUrl?: string | null;
  /**
   * كيف تُعرض الصورة الموجودة على الخادم: `attached` («تم الإرفاق» + تغيير/إزالة)
   * أو `current` («الصورة الحالية — ارفع بديلاً»، وضع التصحيح). الافتراضي يُشتق
   * من وضع التصحيح في المخزن.
   */
  existingImageMode?: "attached" | "current";
  fieldLabel?: string;
  single?: boolean;
  variant?: "default" | "dropzone" | "dashed" | "dashed-pill";
  accept?: string;
  hint?: string;
  invalid?: boolean;
};

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,application/pdf";
const PDF_ONLY_ACCEPT = "application/pdf";

function getFileParts(file: File) {
  const extension = file.name.includes(".")
    ? (file.name.split(".").pop()?.toLowerCase() ?? "")
    : "";

  const name = extension
    ? file.name.slice(0, -(extension.length + 1))
    : file.name;

  return { name, extension };
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

// Same types as the server (`mimes:jpg,jpeg,png,webp,pdf`), rejected on
// selection instead of failing at «إرسال الطلب». Size: the server accepts
// 10 MB but uploads pass through a Vercel function (4.5 MB per request), so
// 4 MB per file after compression is the limit that actually works.
const MAX_UPLOAD_BYTES = MAX_SERVER_ACTION_UPLOAD_BYTES;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function isAllowedUpload(file: File) {
  const extension = getFileParts(file).extension;
  return ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension);
}

type DeedFileRowProps = {
  file: File;
  labels: CreateContractLabels["deed"]["deedImage"];
  onDelete: () => void;
  onPreview: () => void;
  onChangeFile: () => void;
};

function DeedFileRow({
  file,
  labels,
  onDelete,
  onPreview,
  onChangeFile,
}: DeedFileRowProps) {
  const { name, extension } = getFileParts(file);
  const previewUrl = useMemo(
    () => (isImageFile(file) ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe8e0] bg-[#f3faf7] px-3 py-2.5 dark:border-[#2f403b] dark:bg-[#16352f]">
      <div className="flex w-full min-w-0 items-center gap-2.5 sm:w-auto sm:flex-1">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand dark:text-[#48c0b8]">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.attached}</span>
        </span>

        <p className="min-w-0 truncate text-sm font-semibold text-[#333333] dark:text-white">
          {name}
          {extension ? `.${extension}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.preview}</span>
        </button>

        <button
          type="button"
          onClick={onChangeFile}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.change}</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#ffe8e8] px-3 text-sm font-bold text-red-500 dark:bg-[#2a1818] dark:text-[#f87171]"
        >
          <X className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.delete}</span>
        </button>
      </div>
    </div>
  );
}

function ExistingImageRow({
  url,
  labels,
  onPreview,
  onChangeFile,
  onDelete,
}: {
  url: string;
  labels: CreateContractLabels["deed"]["deedImage"];
  onPreview: () => void;
  onChangeFile: () => void;
  onDelete: () => void;
}) {
  const fileName = fileNameFromUrl(url);
  const extension = fileName.includes(".")
    ? (fileName.split(".").pop()?.toLowerCase() ?? "")
    : "";
  const name = extension ? fileName.slice(0, -(extension.length + 1)) : fileName;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe8e0] bg-[#f3faf7] px-3 py-2.5 dark:border-[#2f403b] dark:bg-[#16352f]">
      <div className="flex w-full min-w-0 items-center gap-2.5 sm:w-auto sm:flex-1">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand dark:text-[#48c0b8]">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.attached}</span>
        </span>

        <p className="min-w-0 truncate text-sm font-semibold text-[#333333] dark:text-white">
          {name}
          {extension ? `.${extension}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.preview}</span>
        </button>

        <button
          type="button"
          onClick={onChangeFile}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.change}</span>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#ffe8e8] px-3 text-sm font-bold text-red-500 dark:bg-[#2a1818] dark:text-[#f87171]"
        >
          <X className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.delete}</span>
        </button>
      </div>
    </div>
  );
}

/** دفعة هـ (W-1): نصوص حالة «الصورة الحالية» في وضع التصحيح — ثابتة بالعربية. */
const CURRENT_IMAGE_LABELS = {
  title: "الصورة الحالية",
  hint: "هذه الصورة المرفوعة في طلبك — ارفع بديلاً إذا كان المطلوب تصحيحها.",
  replace: "ارفع بديلاً",
};

/**
 * وضع التصحيح: الصورة المرفوعة سابقاً على الخادم تظهر بمصغّرة وعنوان
 * «الصورة الحالية» وزر «ارفع بديلاً» (لا «تم الإرفاق» ولا «إزالة» — الحذف لا
 * يصل الخادم أصلاً). الروابط موقّعة من الخادم، لذا `<img>` عادي.
 */
function CurrentImageRow({
  url,
  labels,
  onPreview,
  onReplace,
}: {
  url: string;
  labels: CreateContractLabels["deed"]["deedImage"];
  onPreview: () => void;
  onReplace: () => void;
}) {
  const [thumbFailed, setThumbFailed] = useState(false);

  return (
    <div
      data-testid="current-image"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe8e0] bg-[#f3faf7] px-3 py-2.5 dark:border-[#2f403b] dark:bg-[#16352f]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onPreview}
          aria-label={labels.preview}
          className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#cfe8e0] bg-white dark:border-[#2f403b] dark:bg-[#1a2421]"
        >
          {thumbFailed ? (
            <ImageIcon className="size-6 text-[#bdbdbd] dark:text-[#6b7d78]" aria-hidden="true" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={CURRENT_IMAGE_LABELS.title}
              className="size-full object-cover"
              onError={() => setThumbFailed(true)}
            />
          )}
        </button>

        <div className="min-w-0 space-y-0.5">
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand dark:text-[#48c0b8]">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            <span>{CURRENT_IMAGE_LABELS.title}</span>
          </p>
          <p className="text-xs leading-relaxed text-[#6f6f6f] dark:text-[#9eb5af]">
            {CURRENT_IMAGE_LABELS.hint}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.preview}</span>
        </button>

        <button
          type="button"
          onClick={onReplace}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-sm font-bold text-white hover:bg-brand/90"
        >
          <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
          <span>{CURRENT_IMAGE_LABELS.replace}</span>
        </button>
      </div>
    </div>
  );
}

export default function CreateContractDeedImageUpload({
  labels,
  value,
  onChange,
  existingImageUrl = null,
  existingImageMode,
  fieldLabel,
  single = false,
  variant = "default",
  accept = ACCEPTED_FILE_TYPES,
  hint,
  invalid = false,
}: CreateContractDeedImageUploadProps) {
  const t = useTranslations("createContract");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewExistingUrl, setPreviewExistingUrl] = useState<string | null>(null);
  const [existingImageCleared, setExistingImageCleared] = useState(false);
  // دفعة هـ (W-1): في وضع التصحيح تُعرض الصورة الموجودة على الخادم كـ«الصورة
  // الحالية — ارفع بديلاً» بدل «تم الإرفاق».
  const isFixMode = useCreateContractDraftStore((state) => state.fixMode !== null);
  const resolvedExistingMode = existingImageMode ?? (isFixMode ? "current" : "attached");
  const showExistingImage =
    value.length === 0 && Boolean(existingImageUrl) && !existingImageCleared;
  const showInvalid = invalid && value.length === 0 && !showExistingImage;
  const pdfOnly = accept === PDF_ONLY_ACCEPT;
  const hideUploadArea = value.length > 0 || showExistingImage;

  const previewUrl = useMemo(() => {
    if (!previewFile) {
      return null;
    }

    return URL.createObjectURL(previewFile);
  }, [previewFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";

    const allowed = picked.filter((file) =>
      pdfOnly ? isPdfFile(file) : isAllowedUpload(file),
    );
    // Phone photos (3–8 MB) are shrunk before they are kept or uploaded.
    const compressed = await Promise.all(allowed.map((file) => compressImageFile(file)));
    const files = compressed.filter((file) => file.size <= MAX_UPLOAD_BYTES);

    if (files.length < picked.length) {
      toast.error(
        compressed.some((file) => file.size > MAX_UPLOAD_BYTES)
          ? t("uploadTooLarge")
          : t("uploadInvalidType"),
      );
    }

    if (files.length > 0) {
      onChange(single ? [files[0]] : [...value, ...files]);
    }
  }

  function handleDelete(index: number) {
    onChange(value.filter((_, fileIndex) => fileIndex !== index));
  }

  function handleChangeFile() {
    inputRef.current?.click();
  }

  function handleDeleteExisting() {
    setExistingImageCleared(true);
  }

  const resolvedLabel = fieldLabel ?? labels.label;
  const isDropzone = variant === "dropzone";
  const isDashed = variant === "dashed";
  const isDashedPill = variant === "dashed-pill";
  const isAreaUpload = isDropzone || isDashed;

  return (
    <div className="space-y-3" data-field-invalid={showInvalid ? "true" : undefined}>
      {isDropzone ? (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-semibold",
              showInvalid ? "text-[#c62828]" : "text-black dark:text-white",
            )}
          >
            {resolvedLabel}
          </span>
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        </div>
      ) : (
        <CreateContractFieldLabel label={resolvedLabel} invalid={showInvalid} />
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={!single}
        accept={accept}
        className="sr-only"
        aria-invalid={showInvalid}
        onChange={(event) => void handleFileChange(event)}
      />

      {!hideUploadArea ? (
        <label
          htmlFor={inputId}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 transition-colors",
            isDashedPill
              ? "h-10 justify-center rounded-full border-[1.5px] border-dashed bg-[#FBFDFC] px-4 text-center hover:border-brand/40 dark:bg-[#121a18] dark:hover:border-[#48c0b8]/40"
              : isAreaUpload
                ? "min-h-10 flex-col justify-center rounded-2xl border-[1.5px] border-dashed bg-[#FBFDFC] px-3 py-2 text-center hover:border-brand/40 dark:bg-[#121a18] dark:hover:border-[#48c0b8]/40"
                : "h-10 rounded-full border-[1.5px] border-dashed bg-[#FBFDFC] px-2 ps-4 hover:border-brand/40 dark:bg-[#121a18] dark:hover:border-[#48c0b8]/40",
            showInvalid
              ? "border-[#e57373]"
              : "border-[#BFE0D4] dark:border-[#2f403b]",
          )}
        >
          {isDashed || isDashedPill || isDropzone ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#666666] dark:text-[#9eb5af]">
                <span className="font-bold text-brand dark:text-[#48c0b8]">
                  {labels.clickHere}
                </span>{" "}
                <span>{labels.chooseFile}</span>
              </p>
              {labels.acceptedFormats ? (
                <p className="text-xs text-[#bdbdbd] dark:text-[#6b7d78]">
                  {labels.acceptedFormats}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="min-w-0 flex-1 text-start">
                <p className="text-sm leading-snug font-semibold">
                  <span className="text-brand-secondary dark:text-[#48c0b8]">
                    {labels.clickHere}
                  </span>{" "}
                  <span className="text-gray-600 dark:text-[#9eb5af]">
                    {labels.chooseFile}
                  </span>
                </p>
                {labels.acceptedFormats ? (
                  <p className="text-xs text-[#bdbdbd] dark:text-[#6b7d78]">
                    {labels.acceptedFormats}
                  </p>
                ) : null}
              </div>

              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-[#1a2421]">
                <CloudDownload
                  className="size-5 text-[#bdbdbd] dark:text-[#6b7d78]"
                  aria-hidden="true"
                />
              </span>
            </>
          )}
        </label>
      ) : null}

      {hint ? (
        <p className="text-xs leading-relaxed text-[#9a9a9a] dark:text-[#9eb5af]">
          {hint}
        </p>
      ) : null}

      {showInvalid ? <CreateContractFieldError message={t("fieldRequired")} /> : null}

      {showExistingImage && existingImageUrl ? (
        resolvedExistingMode === "current" ? (
          <CurrentImageRow
            url={existingImageUrl}
            labels={labels}
            onPreview={() => setPreviewExistingUrl(existingImageUrl)}
            onReplace={handleChangeFile}
          />
        ) : (
          <ExistingImageRow
            url={existingImageUrl}
            labels={labels}
            onPreview={() => setPreviewExistingUrl(existingImageUrl)}
            onChangeFile={handleChangeFile}
            onDelete={handleDeleteExisting}
          />
        )
      ) : null}

      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((file, index) => (
            <DeedFileRow
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              file={file}
              labels={labels}
              onDelete={() => handleDelete(index)}
              onChangeFile={handleChangeFile}
              onPreview={() => setPreviewFile(file)}
            />
          ))}
        </div>
      ) : null}

      <Dialog
        open={previewFile !== null || previewExistingUrl !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFile(null);
            setPreviewExistingUrl(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-full gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 no-scrollbar sm:max-w-2xl dark:bg-[#1a2421]"
        >
          <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-3 dark:border-[#2f403b]">
            <DialogTitle className="text-base font-bold dark:text-white">
              {labels.previewTitle}
            </DialogTitle>

            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#2a1818]"
                aria-label={labels.closePreview}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>

          <div className="max-h-[85vh] overflow-auto bg-[#f7f7f7] p-4 no-scrollbar dark:bg-[#121a18]">
            {previewExistingUrl ? (
              <div className="mx-auto flex w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-[#1a2421]">
                {/* Plain <img>: deed documents are served from signed, extensionless
                    backend URLs that the next/image loader/allowlist rejects. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewExistingUrl}
                  alt={labels.previewTitle}
                  className="max-h-[65vh] w-full object-contain"
                />
              </div>
            ) : previewFile && previewUrl ? (
              isPdfFile(previewFile) ? (
                <iframe
                  src={previewUrl}
                  title={previewFile.name}
                  className="h-[65vh] w-full rounded-2xl bg-white dark:bg-[#1a2421]"
                />
              ) : isImageFile(previewFile) ? (
                <div className="relative mx-auto aspect-4/3 w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1a2421]">
                  <Image
                    src={previewUrl}
                    alt={previewFile.name}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <ImageIcon className="size-10 text-[#bdbdbd] dark:text-[#6b7d78]" />
                  <p className="text-sm text-[#666666] dark:text-[#9eb5af]">
                    {previewFile.name}
                  </p>
                </div>
              )
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
