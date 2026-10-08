"use client";

import {
  AlertCircle,
  Building2,
  Coins,
  FileText,
  Home,
  MapPin,
  Paperclip,
  Pencil,
  ScrollText,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";

import type {
  CreateContractReviewAttachment,
  CreateContractReviewSection,
} from "@/features/create-contract/types/create-contract-review-order";
import { cn } from "@/lib/utils";

type CreateContractReviewSectionCardProps = {
  section: CreateContractReviewSection;
  editLabel: string;
  linkPreviewLabel: string;
  attachmentsTitle: string;
  onEdit: () => void;
  onPreviewAttachment: (attachment: CreateContractReviewAttachment) => void;
};

/** Section icon by id (unit sections are `unit`, `unit-0`, `unit-1` …). */
function renderSectionIcon(id: string) {
  const className = "size-4";
  if (id === "deed") return <ScrollText className={className} aria-hidden="true" />;
  if (id === "nationalAddress") return <MapPin className={className} aria-hidden="true" />;
  if (id === "owner") return <UserRound className={className} aria-hidden="true" />;
  if (id === "tenant") return <Users className={className} aria-hidden="true" />;
  if (id === "rent") return <Coins className={className} aria-hidden="true" />;
  if (id.startsWith("unit")) return <Home className={className} aria-hidden="true" />;
  return <Building2 className={className} aria-hidden="true" />;
}

function formatFileSize(size: number | null): string {
  if (size === null || !Number.isFinite(size) || size <= 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/** Image thumbnail from a local File (object URL) or a remote URL. */
function AttachmentThumbnail({ attachment }: { attachment: CreateContractReviewAttachment }) {
  const objectUrl = useMemo(
    () =>
      attachment.isImage && attachment.file
        ? URL.createObjectURL(attachment.file)
        : null,
    [attachment.file, attachment.isImage],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const src = attachment.isImage ? (objectUrl ?? attachment.remoteUrl ?? null) : null;

  if (!src) {
    return (
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-background text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
        <FileText className="size-4" aria-hidden="true" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- blob/object URLs cannot go through next/image
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="size-9 shrink-0 rounded-lg border border-[#e8e8e8] object-cover dark:border-[#2f403b]"
    />
  );
}

function EditPill({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-brand/20 bg-white px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand-background-green dark:border-[#2f403b] dark:bg-[#121a18] dark:text-[#48c0b8] dark:hover:bg-[#24302c]",
        className,
      )}
    >
      <Pencil className="size-3.5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

/**
 * One review card: title + «تعديل» pill, label/value rows (two columns on
 * desktop, one on mobile), attachment chips with name + size + thumbnail,
 * and a red hint when required data is missing.
 */
export default function CreateContractReviewSectionCard({
  section,
  editLabel,
  linkPreviewLabel,
  attachmentsTitle,
  onEdit,
  onPreviewAttachment,
}: CreateContractReviewSectionCardProps) {
  const attachments = useMemo(() => section.attachments ?? [], [section.attachments]);
  const isRent = section.variant === "rent";

  return (
    <section
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#121a18] dark:shadow-none",
        section.incomplete
          ? "border-[#f3b9b9] dark:border-[#5c2a2a]"
          : isRent
            ? "border-brand-secondary/40 dark:border-brand-secondary/30"
            : "border-[#ececec] dark:border-[#2f403b]",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-extrabold text-brand dark:text-[#48c0b8]">
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
              section.incomplete
                ? "bg-[#fff0f0] text-[#c62828] dark:bg-[#2a1818] dark:text-[#f87171]"
                : isRent
                  ? "bg-brand-secondary/12 text-brand-secondary dark:bg-brand-secondary/20"
                  : "bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]",
            )}
          >
            {renderSectionIcon(section.id)}
          </span>
          <span className="truncate">{section.title}</span>
        </h3>
        <EditPill label={editLabel} onClick={onEdit} />
      </div>

      {section.incomplete && section.incompleteHint ? (
        <p className="mb-3 flex items-start gap-2 rounded-xl bg-[#fff5f5] px-3 py-2 text-xs font-medium leading-5 text-[#c62828] dark:bg-[#2a1818] dark:text-[#f87171]">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{section.incompleteHint}</span>
        </p>
      ) : null}

      {section.fields.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {section.fields.map((field, index) => (
            <div
              key={`${section.id}-${index}-${field.label}`}
              className={cn(
                "flex min-w-0 flex-col gap-0.5 border-b border-dashed border-[#eeeeee] pb-2 last:border-b-0 sm:last:border-b dark:border-[#2f403b]",
                field.wide && "sm:col-span-2",
              )}
            >
              <dt className="text-[11px] font-medium text-[#8a8a8a] dark:text-[#9eb5af]">
                {field.label}
              </dt>
              <dd className="min-w-0 text-sm font-bold wrap-break-word text-[#222222] dark:text-white">
                {field.href ? (
                  <a
                    href={field.href}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="inline-block max-w-full truncate align-bottom text-brand underline-offset-2 hover:underline dark:text-[#48c0b8]"
                    title={field.value}
                  >
                    {linkPreviewLabel}
                  </a>
                ) : (
                  field.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {attachments.length > 0 ? (
        <div className={cn(section.fields.length > 0 && "mt-3")}>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[#8a8a8a] dark:text-[#9eb5af]">
            <Paperclip className="size-3.5" aria-hidden="true" />
            {attachmentsTitle}
          </p>
          <ul className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => {
              const size = formatFileSize(attachment.size);

              return (
                <li key={`${section.id}-att-${index}`} className="max-w-full">
                  <button
                    type="button"
                    onClick={() => onPreviewAttachment(attachment)}
                    className="flex max-w-full items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#fafafa] py-1.5 pe-3 ps-1.5 text-start transition-colors hover:border-brand/30 hover:bg-brand-background-green/40 dark:border-[#2f403b] dark:bg-[#1a2421] dark:hover:bg-[#24302c]"
                  >
                    <AttachmentThumbnail attachment={attachment} />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-medium text-[#8a8a8a] dark:text-[#9eb5af]">
                        {attachment.label}
                      </span>
                      <span
                        dir="ltr"
                        className="block max-w-56 truncate text-xs font-bold text-[#222222] dark:text-white"
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                        {size ? (
                          <span className="ms-1 font-medium text-[#9a9a9a]">· {size}</span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
