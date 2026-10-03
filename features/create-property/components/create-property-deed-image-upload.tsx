"use client";

import {
  Check,
  CloudDownload,
  Eye,
  ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatePropertyFieldLabel from "@/features/create-property/components/create-property-field-label";
import type { CreatePropertyLabels } from "@/features/create-property/types/create-property-labels";
import { resolveAssetUrl } from "@/features/shared/utils/resolve-asset-url";
import { cn } from "@/lib/utils";

type CreatePropertyDeedImageUploadProps = {
  labels: CreatePropertyLabels["deed"]["deedImage"];
  value: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  fieldLabel?: string;
  existingFileUrl?: string | null;
  onClearExisting?: () => void;
  variant?: "default" | "dropzone" | "dashed";
  hint?: string;
  invalid?: boolean;
};

type PreviewTarget = {
  url: string;
  isObjectUrl: boolean;
  name: string;
  isPdf: boolean;
  isImage: boolean;
};

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,application/pdf";

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
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function isAcceptedDeedFile(file: File) {
  return isImageFile(file) || isPdfFile(file);
}

function isPdfUrl(url: string) {
  return /\.pdf(\?|#|$)/i.test(url);
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?|#|$)/i.test(url);
}

type ExistingFileRowProps = {
  fileUrl: string;
  labels: CreatePropertyLabels["deed"]["deedImage"];
  onPreview: (target: PreviewTarget) => void;
  onChangeFile: () => void;
  onDelete: () => void;
};

function ExistingFileRow({
  fileUrl,
  labels,
  onPreview,
  onChangeFile,
  onDelete,
}: ExistingFileRowProps) {
  const fileName = fileUrl.split("/").pop()?.split("?")[0] ?? labels.preview;
  const showThumbnail = isImageUrl(fileUrl);

  function handlePreview() {
    onPreview({
      url: fileUrl,
      isObjectUrl: false,
      name: fileName,
      isPdf: isPdfUrl(fileUrl),
      isImage: isImageUrl(fileUrl) || !isPdfUrl(fileUrl),
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe8e0] bg-[#f3faf7] px-3 py-2.5 dark:border-[#2f403b] dark:bg-[#16352f]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {showThumbnail ? (
          <button
            type="button"
            onClick={handlePreview}
            className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#cfe8e0] bg-white dark:border-[#2f403b] dark:bg-[#1a2421]"
            aria-label={labels.preview}
          >
            <Image
              src={fileUrl}
              alt={labels.preview}
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand dark:text-[#48c0b8]">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            <span>{labels.attached}</span>
          </span>
        )}

        <p className="min-w-0 truncate text-sm font-semibold text-[#333333] dark:text-white">
          {fileName}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePreview}
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

type DeedFileRowProps = {
  file: File;
  labels: CreatePropertyLabels["deed"]["deedImage"];
  onDelete: () => void;
  onPreview: (target: PreviewTarget) => void;
};

function DeedFileRow({ file, labels, onDelete, onPreview }: DeedFileRowProps) {
  const { name, extension } = getFileParts(file);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = isImageFile(file) ? URL.createObjectURL(file) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync object URL lifecycle with the selected file
    setPreviewUrl(objectUrl);

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  function handlePreview() {
    onPreview({
      url: URL.createObjectURL(file),
      isObjectUrl: true,
      name: file.name,
      isPdf: isPdfFile(file),
      isImage: isImageFile(file),
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe8e0] bg-[#f3faf7] px-3 py-2.5 dark:border-[#2f403b] dark:bg-[#16352f]">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {previewUrl ? (
          <button
            type="button"
            onClick={handlePreview}
            className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#cfe8e0] bg-white dark:border-[#2f403b] dark:bg-[#1a2421]"
            aria-label={labels.preview}
          >
            <Image
              src={previewUrl}
              alt={labels.preview}
              fill
              unoptimized
              className="object-cover"
            />
          </button>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand dark:text-[#48c0b8]">
            <Check className="size-4 shrink-0" aria-hidden="true" />
            <span>{labels.attached}</span>
          </span>
        )}

        <p className="min-w-0 truncate text-sm font-semibold text-[#333333] dark:text-white">
          {name}
          {extension ? `.${extension}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e7f4ef] px-3 text-sm font-bold text-brand dark:bg-[#0f2a24] dark:text-[#48c0b8]"
        >
          <Eye className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.preview}</span>
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

export default function CreatePropertyDeedImageUpload({
  labels,
  value,
  onChange,
  multiple = false,
  fieldLabel,
  existingFileUrl = null,
  onClearExisting,
  variant = "default",
  hint,
  invalid = false,
}: CreatePropertyDeedImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewTarget | null>(null);
  const resolvedExistingUrl = resolveAssetUrl(existingFileUrl);
  const showExistingFile = Boolean(resolvedExistingUrl) && value.length === 0;
  const canUploadMore =
    (multiple || value.length === 0) && !showExistingFile;
  const showInvalid = invalid && value.length === 0 && !showExistingFile;
  const resolvedLabel = fieldLabel ?? labels.label;

  useEffect(() => {
    return () => {
      if (preview?.isObjectUrl) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const previewObjectUrl = preview?.url ?? null;
  const previewIsPdf = preview?.isPdf ?? false;
  const previewIsImage = preview?.isImage ?? false;
  const previewName = preview?.name ?? labels.previewTitle;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []).filter(
      isAcceptedDeedFile,
    );

    if (selectedFiles.length === 0) {
      event.target.value = "";
      return;
    }

    if (resolvedExistingUrl) {
      onClearExisting?.();
    }

    if (multiple) {
      onChange([...value, ...selectedFiles]);
    } else {
      onChange([selectedFiles[0]]);
    }

    event.target.value = "";
  }

  function handleDelete(index: number) {
    onChange(value.filter((_, fileIndex) => fileIndex !== index));
  }

  function handleChangeExisting() {
    inputRef.current?.click();
  }

  function handleDeleteExisting() {
    onClearExisting?.();
  }

  return (
    <div className="space-y-3">
      {variant === "dropzone" ? (
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
        <CreatePropertyFieldLabel label={resolvedLabel} invalid={showInvalid} />
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={multiple}
        accept={ACCEPTED_FILE_TYPES}
        className="sr-only"
        onChange={handleFileChange}
      />

      {canUploadMore ? (
        <label
          htmlFor={inputId}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 transition-colors",
            variant === "dashed" || variant === "dropzone"
              ? "min-h-10 flex-col justify-center rounded-2xl border-[1.5px] border-dashed bg-[#FBFDFC] px-3 py-2 text-center hover:border-brand/40 dark:bg-[#121a18] dark:hover:border-[#48c0b8]/40"
              : "h-10 rounded-full border-[1.5px] border-dashed bg-[#FBFDFC] px-2 ps-4 hover:border-brand/40 dark:bg-[#121a18] dark:hover:border-[#48c0b8]/40",
            showInvalid
              ? "border-[#e57373]"
              : "border-[#BFE0D4] dark:border-[#2f403b]",
          )}
        >
          {variant === "dropzone" || variant === "dashed" ? (
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

      {value.length > 0 ? (
        <div className="space-y-2">
          {value.map((file, index) => (
            <DeedFileRow
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              file={file}
              labels={labels}
              onDelete={() => handleDelete(index)}
              onPreview={setPreview}
            />
          ))}
        </div>
      ) : showExistingFile && resolvedExistingUrl ? (
        <ExistingFileRow
          fileUrl={resolvedExistingUrl}
          labels={labels}
          onPreview={setPreview}
          onChangeFile={handleChangeExisting}
          onDelete={handleDeleteExisting}
        />
      ) : null}

      <Dialog
        open={preview !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null);
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
            {preview && previewObjectUrl ? (
              previewIsPdf ? (
                <iframe
                  src={previewObjectUrl}
                  title={previewName}
                  className="h-[65vh] w-full rounded-2xl bg-white dark:bg-[#1a2421]"
                />
              ) : previewIsImage ? (
                <div className="mx-auto flex w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-[#1a2421]">
                  {/* Plain <img>: deed documents are served from signed, extensionless
                      backend URLs that the next/image loader/allowlist rejects. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewObjectUrl}
                    alt={previewName}
                    className="max-h-[65vh] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <ImageIcon className="size-10 text-[#bdbdbd] dark:text-[#6b7d78]" />
                  <p className="text-sm text-[#666666] dark:text-[#9eb5af]">
                    {previewName}
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
