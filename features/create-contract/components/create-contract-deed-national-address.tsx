"use client";

import { useId, type ReactNode } from "react";
import { IdCard, Link2, MapPin, PenLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { FaMapMarkerAlt } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import CreateContractDeedImageUpload from "@/features/create-contract/components/create-contract-deed-image-upload";
import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { NationalAddressLinkHelp } from "@/features/create-contract/components/create-contract-field-help";
import {
  isValidNationalAddressLink,
  type NationalAddressMethodId,
} from "@/features/create-contract/types/national-address";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import ManualNationalAddressForm from "@/features/shared/components/manual-national-address-form";
import type { ManualNationalAddressData } from "@/features/shared/types/manual-national-address";
import { cn } from "@/lib/utils";

type CreateContractDeedNationalAddressProps = {
  labels: CreateContractLabels["deed"]["nationalAddress"];
  method: NationalAddressMethodId | "";
  onMethodChange: (method: NationalAddressMethodId) => void;
  photoFiles: File[];
  onPhotoFilesChange: (files: File[]) => void;
  linkUrl: string;
  onLinkUrlChange: (url: string) => void;
  manualAddress: ManualNationalAddressData;
  onManualAddressChange: (value: ManualNationalAddressData) => void;
  existingPhotoUrl?: string | null;
  showFieldErrors?: boolean;
};

const METHOD_CARDS: {
  id: NationalAddressMethodId;
  icon: ReactNode;
}[] = [
  {
    id: "link",
    icon: <FaMapMarkerAlt className="size-5 text-[#ea4335]" aria-hidden />,
  },
  {
    id: "manual",
    icon: <PenLine className="size-5 text-brand-secondary" aria-hidden />,
  },
  {
    id: "photo",
    icon: (
      <span className="relative inline-flex size-6 items-center justify-center">
        <IdCard className="size-5 text-brand" aria-hidden />
        <MapPin
          className="absolute -inset-e-0.5 -top-0.5 size-2.5 text-brand-secondary"
          aria-hidden
        />
      </span>
    ),
  },
];

export default function CreateContractDeedNationalAddress({
  labels,
  method,
  onMethodChange,
  photoFiles,
  onPhotoFilesChange,
  linkUrl,
  onLinkUrlChange,
  manualAddress,
  onManualAddressChange,
  existingPhotoUrl = null,
  showFieldErrors = false,
}: CreateContractDeedNationalAddressProps) {
  const t = useTranslations("createContract");
  const linkInputId = useId();
  const methodGroupId = useId();
  const methodInvalid = showFieldErrors && method === "";
  const photoInvalid =
    showFieldErrors &&
    method === "photo" &&
    photoFiles.length === 0 &&
    !existingPhotoUrl;
  const linkTrimmed = linkUrl.trim();
  // Non-empty but not a parseable URL: surface immediately (not only after a
  // continue attempt) so a valid-looking-but-wrong link never silently blocks.
  const linkFormatInvalid =
    method === "link" && linkTrimmed !== "" && !isValidNationalAddressLink(linkUrl);
  const linkRequiredInvalid =
    showFieldErrors && method === "link" && linkTrimmed === "";
  const linkInvalid = linkRequiredInvalid || linkFormatInvalid;
  const linkValid = method === "link" && isValidNationalAddressLink(linkUrl);

  return (
    <div className="space-y-3">
      <div>
        <CreateContractFieldLabel
          label={labels.methodSelect.label}
          invalid={methodInvalid}
        />

        <div
          role="radiogroup"
          aria-labelledby={methodGroupId}
          aria-invalid={methodInvalid}
          data-field-invalid={methodInvalid ? "true" : undefined}
          className="grid grid-cols-3 gap-2"
        >
          <span id={methodGroupId} className="sr-only">
            {labels.methodSelect.label}
          </span>

          {METHOD_CARDS.map((card) => {
            const selected = method === card.id;
            const copy = labels.methods[card.id];

            return (
              <button
                key={card.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onMethodChange(card.id)}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
                  selected
                    ? "border-brand bg-brand-background-green/60 shadow-[0_0_0_1px_rgba(13,90,80,0.08)]"
                    : methodInvalid
                      ? "border-[#e57373] bg-white"
                      : "border-[#e8e8e8] bg-white hover:border-brand/30",
                )}
              >
                <span className="flex size-8 items-center justify-center">
                  {card.icon}
                </span>
                <span className="text-xs font-extrabold text-brand">
                  {copy.title}
                </span>
                <span className="line-clamp-2 text-[10px] leading-snug text-[#9a9a9a]">
                  {copy.description}
                </span>
              </button>
            );
          })}
        </div>

        {methodInvalid ? <CreateContractFieldError message={t("fieldRequired")} /> : null}
      </div>

      {method === "photo" ? (
        <CreateContractDeedImageUpload
          labels={labels.photo}
          value={photoFiles}
          onChange={onPhotoFilesChange}
          existingImageUrl={existingPhotoUrl}
          variant="dashed"
          single
          hint={labels.photo.hint}
          invalid={photoInvalid}
        />
      ) : null}

      {method === "link" ? (
        <div className="space-y-2">
          <CreateContractFieldLabel
            label={labels.link.label}
            invalid={linkInvalid}
            help={<NationalAddressLinkHelp />}
          />

          <div className="relative">
            <Link2
              className={cn(
                "pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2",
                linkInvalid
                  ? "text-[#c62828]"
                  : linkValid
                    ? "text-brand"
                    : "text-brand-secondary",
              )}
              aria-hidden="true"
            />
            <Input
              id={linkInputId}
              type="url"
              value={linkUrl}
              onChange={(event) => onLinkUrlChange(event.target.value)}
              placeholder={labels.link.placeholder}
              aria-invalid={linkInvalid}
              className={cn(
                "h-10 rounded-2xl ps-11 pe-4 text-sm text-[#333333] placeholder:text-[#bdbdbd] shadow-none focus-visible:ring-0 aria-invalid:ring-0 dark:aria-invalid:ring-0",
                linkInvalid
                  ? "border-[#e57373] bg-[#FBFBFA] aria-invalid:border-[#e57373]"
                  : linkValid
                    ? "border-brand bg-brand-background-green"
                    : "border-[#e4e4e4] bg-[#FBFBFA]",
              )}
            />
          </div>

          {linkInvalid ? (
            <CreateContractFieldError
              message={
                linkFormatInvalid
                  ? (labels.link.invalid ?? t("fieldRequired"))
                  : t("fieldRequired")
              }
            />
          ) : null}

          {labels.link.hint ? (
            <p className="text-xs leading-relaxed text-[#9a9a9a]">
              {labels.link.hint}
            </p>
          ) : null}
        </div>
      ) : null}

      {method === "manual" ? (
        <ManualNationalAddressForm
          labels={{ ...labels.manual, fieldRequired: t("fieldRequired") }}
          value={manualAddress}
          onChange={onManualAddressChange}
          showFieldErrors={showFieldErrors}
        />
      ) : null}
    </div>
  );
}
