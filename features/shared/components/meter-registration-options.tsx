"use client";

import { Check, Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { MeterRegistrationParty } from "@/features/create-unit/types/unit-data";
import { isPositiveNumber } from "@/features/create-unit/types/unit-data";
import type { UnitFormLabels } from "@/features/shared/types/unit-form-labels";
import { formatMeterFee } from "@/features/shared/utils/resolve-meter-transfer-fee";
import {
  fieldChromeNestedInputClass,
  fieldChromeSurfaceClass,
  resolveFieldChromeState,
} from "@/lib/ui/field-chrome";
import { cn } from "@/lib/utils";
import { toAsciiDigits } from "@/lib/utils/digits";

type MeterRegistrationLabels = NonNullable<UnitFormLabels["meterRegistration"]>;

type MeterRegistrationOptionsProps = {
  labels: MeterRegistrationLabels;
  /** Transfer fee charged by us when the meter moves to the tenant's name. */
  fee: number;
  value: MeterRegistrationParty | "";
  onChange: (value: MeterRegistrationParty) => void;
  /** «عداد مشترك»: monthly amount paid by the tenant (SAR). */
  sharedMonthlyFee: string;
  onSharedMonthlyFeeChange: (value: string) => void;
  /** Contract length in months when known (finance step) — drives the «× المدة» helper. */
  contractMonths?: number | null;
  errorMessage?: string;
  sharedFeeErrorMessage?: string;
};

function withFeeTemplate(template: string, fee: number, currency: string) {
  return template
    .replaceAll("{fee}", formatMeterFee(fee))
    .replaceAll("{currency}", currency);
}

function withTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function OptionButton({
  selected,
  invalid,
  onClick,
  title,
  subtitle,
  footer,
  badge,
}: {
  selected: boolean;
  invalid: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  footer: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white px-3.5 pb-3.5 text-start transition-colors dark:bg-[#151c1b]",
        badge ? "pt-5" : "pt-3.5",
        selected
          ? "border-brand-secondary bg-brand-background-green/40 dark:bg-brand-secondary/10"
          : invalid
            ? "border-[#e57373]"
            : "border-[#e8e8e8] hover:border-brand/30 dark:border-[#262d2c]",
      )}
    >
      {badge ? (
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#f3ead7] px-2.5 py-1 text-[10px] font-bold text-[#8a6a3a] dark:bg-[#3a2a1c] dark:text-[#f0b27a]">
          {badge}
        </span>
      ) : null}

      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-extrabold text-brand">{title}</span>
        <span
          className={cn(
            "mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-brand-secondary bg-brand-secondary text-white"
              : "border-[#d4d4d4] dark:border-[#3a4d47]",
          )}
          aria-hidden="true"
        >
          {selected ? <Check className="size-3" /> : null}
        </span>
      </span>
      <span className="mt-1 text-xs text-[#9a9a9a] dark:text-white/50">{subtitle}</span>
      <span className="mt-auto pt-3 text-xs font-bold text-brand-secondary">{footer}</span>
    </button>
  );
}

/**
 * Who the meter is registered to after documentation: owner (no fee), tenant
 * (our transfer fee), or a shared meter (monthly amount paid by the tenant —
 * a contract term, not a fee we charge).
 */
export default function MeterRegistrationOptions({
  labels,
  fee,
  value,
  onChange,
  sharedMonthlyFee,
  onSharedMonthlyFeeChange,
  contractMonths = null,
  errorMessage,
  sharedFeeErrorMessage,
}: MeterRegistrationOptionsProps) {
  const showInvalid = Boolean(errorMessage);
  const feeBadge = withFeeTemplate(labels.tenant.feeBadge, fee, labels.currency);
  const feeFooter = withFeeTemplate(labels.tenant.feeFooter, fee, labels.currency);
  const noticeFee = withFeeTemplate(labels.notice.feeAmount, fee, labels.currency);

  const sharedFeeInvalid = Boolean(sharedFeeErrorMessage);
  const sharedChrome = resolveFieldChromeState({
    invalid: sharedFeeInvalid,
    valid: isPositiveNumber(sharedMonthlyFee),
  });
  const monthly = isPositiveNumber(sharedMonthlyFee)
    ? Number(toAsciiDigits(sharedMonthlyFee).replace(/,/g, ""))
    : 0;
  const sharedTotal =
    monthly > 0 && contractMonths && contractMonths > 0
      ? monthly * contractMonths
      : null;

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
          "grid gap-3 rounded-2xl sm:grid-cols-3",
          showInvalid && "ring-1 ring-[#e57373]",
        )}
      >
        <OptionButton
          selected={value === "owner"}
          invalid={showInvalid}
          onClick={() => onChange("owner")}
          title={labels.owner.title}
          subtitle={labels.owner.subtitle}
          footer={labels.owner.noFee}
        />

        <OptionButton
          selected={value === "tenant"}
          invalid={showInvalid}
          onClick={() => onChange("tenant")}
          title={labels.tenant.title}
          subtitle={labels.tenant.subtitle}
          footer={feeFooter}
          badge={feeBadge}
        />

        <OptionButton
          selected={value === "shared"}
          invalid={showInvalid}
          onClick={() => onChange("shared")}
          title={labels.shared.title}
          subtitle={labels.shared.subtitle}
          footer={labels.shared.footer}
        />
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

      {value === "shared" ? (
        <div className="space-y-2 rounded-2xl border border-brand-secondary/30 bg-brand-background-green/40 p-3.5 dark:border-brand-secondary/30 dark:bg-brand-secondary/10">
          <label
            className={cn(
              "flex items-center gap-2 text-sm font-bold",
              sharedFeeInvalid ? "text-[#c62828]" : "text-black dark:text-white/90",
            )}
          >
            <Users className="size-4 shrink-0 text-brand-secondary" aria-hidden="true" />
            {labels.shared.amountLabel}
            <span className="text-red-500"> *</span>
          </label>

          <div
            dir="ltr"
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-2xl border px-4",
              fieldChromeSurfaceClass(sharedChrome),
            )}
          >
            <span className="shrink-0 text-sm font-bold text-brand">{labels.currency}</span>
            <span className="h-6 w-px shrink-0 bg-[#dcdcdc]" aria-hidden="true" />
            <Input
              type="text"
              inputMode="decimal"
              dir="ltr"
              value={sharedMonthlyFee}
              onChange={(event) =>
                onSharedMonthlyFeeChange(
                  event.target.value.replace(/٫/g, ".").replace(/[^\d.]/g, "").slice(0, 9),
                )
              }
              placeholder={labels.shared.amountPlaceholder}
              aria-invalid={sharedFeeInvalid}
              className={cn("h-auto px-1 text-sm font-semibold", fieldChromeNestedInputClass)}
            />
          </div>

          {sharedFeeErrorMessage ? (
            <p className="text-xs font-medium text-[#c62828]">{sharedFeeErrorMessage}</p>
          ) : null}

          <p className="text-xs leading-5 text-[#6f6f6f] dark:text-white/60">
            {sharedTotal !== null && contractMonths
              ? withTemplate(labels.shared.totalHint, {
                  monthly: formatMeterFee(monthly),
                  months: contractMonths,
                  total: formatMeterFee(sharedTotal),
                  currency: labels.currency,
                })
              : labels.shared.durationUnknownHint}
          </p>
          <p className="text-[11px] leading-5 text-[#9a9a9a] dark:text-white/40">
            {labels.shared.termNote}
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="text-xs font-medium text-[#c62828]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
