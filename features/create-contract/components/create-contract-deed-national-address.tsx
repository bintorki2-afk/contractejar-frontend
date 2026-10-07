"use client";

import { useId } from "react";
import { Link2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import CreateContractDeedImageUpload from "@/features/create-contract/components/create-contract-deed-image-upload";
import CreateContractFieldError from "@/features/create-contract/components/create-contract-field-error";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import { NationalAddressLinkHelp } from "@/features/create-contract/components/create-contract-field-help";
import CreateContractFormSelect from "@/features/create-contract/components/create-contract-form-select";
import {
  isValidNationalAddressLink,
  NATIONAL_ADDRESS_METHOD_ORDER,
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
  const methodInvalid = showFieldErrors && method === "";
  // One select instead of three cards; "رابط موقع العقار (قوقل ماب)" is the
  // default so the common path needs no choice at all.
  const methodOptions = NATIONAL_ADDRESS_METHOD_ORDER.map((id) => {
    const copy = labels.methods[id];
    return {
      value: id,
      label: copy.description ? `${copy.title} (${copy.description})` : copy.title,
    };
  });
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
      <CreateContractFormSelect
        label={labels.methodSelect.label}
        placeholder={labels.methodSelect.placeholder}
        options={methodOptions}
        value={method}
        onChange={(nextMethod) =>
          onMethodChange(nextMethod as NationalAddressMethodId)
        }
        invalid={methodInvalid}
        valid={method !== ""}
      />

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
