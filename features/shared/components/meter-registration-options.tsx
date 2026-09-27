"use client";

import { cn } from "@/lib/utils";
import type { MeterRegistrationParty } from "@/features/create-unit/types/unit-data";
import type { UnitFormLabels } from "@/features/shared/types/unit-form-labels";
import { formatMeterFee } from "@/features/shared/utils/resolve-meter-transfer-fee";

type MeterRegistrationLabels = NonNullable<UnitFormLabels["meterRegistration"]>;

type MeterRegistrationOptionsProps = {
  labels: MeterRegistrationLabels;
  fee: number;
  value: MeterRegistrationParty | "";
  onChange: (value: MeterRegistrationParty) => void;
  errorMessage?: string;
};

function withFeeTemplate(
  template: string,
  fee: number,
  currency: string,
) {
  return template
    .replaceAll("{fee}", formatMeterFee(fee))
    .replaceAll("{currency}", currency);
}

export default function MeterRegistrationOptions({
  labels,
  fee,
  value,
  onChange,
  errorMessage,
}: MeterRegistrationOptionsProps) {
  const showInvalid = Boolean(errorMessage);
  const feeBadge = withFeeTemplate(labels.tenant.feeBadge, fee, labels.currency);
  const feeFooter = withFeeTemplate(
    labels.tenant.feeFooter,
    fee,
    labels.currency,
  );
  const noticeFee = withFeeTemplate(
    labels.notice.feeAmount,
    fee,
    labels.currency,
  );

  return (
    <div className="space-y-3">
      <p
        className={cn(
          "text-sm font-bold",
          showInvalid ? "text-[#c62828]" : "text-black dark:text-white/90",
        )}
      >
        {labels.title}
        <span className="text-red-500"> *</span>
      </p>

      <div
        role="radiogroup"
        aria-label={labels.title}
        aria-invalid={showInvalid}
        data-field-invalid={showInvalid ? "true" : undefined}
        className={cn(
          "grid gap-3 sm:grid-cols-2 rounded-2xl",
          showInvalid && "ring-1 ring-[#e57373]",
        )}
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === "owner"}
          onClick={() => onChange("owner")}
          className={cn(
            "relative rounded-2xl border bg-white dark:bg-[#151c1b] px-4 py-5 text-start transition-colors",
            value === "owner"
              ? "border-brand-secondary bg-brand-background-green/40"
              : showInvalid
                ? "border-[#e57373]"
                : "border-[#e8e8e8] dark:border-[#262d2c]",
          )}
        >
          <p className="text-sm font-extrabold text-brand">
            {labels.owner.title}
          </p>
          <p className="mt-1 text-xs text-[#9a9a9a] dark:text-white/50">{labels.owner.subtitle}</p>
          <p className="mt-4 text-sm font-bold text-brand-secondary">
            {labels.owner.noFee}
          </p>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={value === "tenant"}
          onClick={() => onChange("tenant")}
          className={cn(
            "relative rounded-2xl border bg-white dark:bg-[#151c1b] px-4 pb-5 pt-7 text-start transition-colors",
            value === "tenant"
              ? "border-brand-secondary bg-brand-background-green/40"
              : showInvalid
                ? "border-[#e57373]"
                : "border-[#e8e8e8] dark:border-[#262d2c]",
          )}
        >
          <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-[#f3ead7] px-2.5 py-1 text-[10px] font-bold text-[#8a6a3a] whitespace-nowrap dark:bg-[#3a2a1c] dark:text-[#f0b27a]">
            {feeBadge}
          </span>
          <p className="text-sm font-extrabold text-brand">
            {labels.tenant.title}
          </p>
          <p className="mt-1 text-xs text-[#9a9a9a] dark:text-white/50">{labels.tenant.subtitle}</p>
          <p className="mt-4 text-sm font-bold text-brand-secondary">
            {feeFooter}
          </p>
        </button>
      </div>

      {value === "tenant" ? (
        <div className="rounded-2xl bg-[#f7f1e6] px-4 py-3 text-sm leading-7 text-[#6f5b3d] dark:bg-[#3a2a1c] dark:text-[#d9b98a]">
          {labels.notice.beforeFee}{" "}
          <span className="font-extrabold text-[#8a6a3a] dark:text-[#f0b27a]">{noticeFee}</span>{" "}
          {labels.notice.afterFee}{" "}
          <span className="font-extrabold text-[#8a6a3a] dark:text-[#f0b27a]">
            {labels.notice.nonRefundable}
          </span>{" "}
          {labels.notice.afterNonRefundable}{" "}
          <span className="font-extrabold text-[#8a6a3a] dark:text-[#f0b27a]">
            {labels.notice.lessThanMonth}
          </span>{" "}
          {labels.notice.afterLessThanMonth}
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs font-medium text-[#c62828]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
