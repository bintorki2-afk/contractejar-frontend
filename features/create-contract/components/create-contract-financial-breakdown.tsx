"use client";

import type { ReactNode } from "react";

import type { ContractFinancialData } from "@/features/create-contract/types/contract-financial";
import { resolveDocumentSurcharge } from "@/features/create-contract/types/contract-financial";
import type { AppliedContractCoupon } from "@/features/create-contract/types/contract-coupon";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import {
  PAYMENT_BREAKDOWN,
  formatPaymentAmount,
} from "@/features/create-contract/types/payment-step";
import CustomIcon from "@/features/shared/components/custom-icon";
import { cn } from "@/lib/utils";

type FinancialSummaryLabels = CreateContractLabels["payment"]["summary"];

type CreateContractFinancialBreakdownProps = {
  labels: FinancialSummaryLabels;
  contractType: ContractTypeId;
  data: ContractFinancialData | undefined;
  isLoading: boolean;
  appliedCoupon?: AppliedContractCoupon | null;
  sectionTitle?: string;
  feeSubtitle?: string;
};

type PaymentAmountProps = {
  amount: number;
  className?: string;
  iconClassName?: string;
  iconSize?: number;
};

function PaymentAmount({
  amount,
  className,
  iconClassName,
  iconSize = 18,
}: PaymentAmountProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-gray-400", className)}>
      <span>{formatPaymentAmount(amount)}</span>
      <CustomIcon
        src="/icons/ryal.svg"
        size={iconSize}
        className={cn("shrink-0 text-gray-400", iconClassName)}
      />
    </span>
  );
}

type SummaryRowProps = {
  label: string;
  amount: number;
  freeLabel?: string;
  subtitle?: string;
  primary?: boolean;
};

function hasDisplayAmount(amount: number | null | undefined): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

function SummaryRow({
  label,
  amount,
  freeLabel,
  subtitle,
  primary = false,
}: SummaryRowProps) {
  const isFree = freeLabel !== undefined && amount <= 0;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "text-sm",
              primary
                ? "font-bold text-[#222222] dark:text-[#e8f0ee]"
                : "font-medium text-[#555555] dark:text-[#9eb5af]",
            )}
          >
            {label}
          </span>
        </div>
        {isFree ? (
          <span className="text-sm font-bold text-brand-secondary">{freeLabel}</span>
        ) : (
          <PaymentAmount
            amount={amount}
            className={cn("text-sm font-bold", primary ? "text-brand" : "text-[#333333]")}
          />
        )}
      </div>
      {subtitle ? (
        <p className="mt-1 text-xs text-[#8a8a8a] dark:text-[#9eb5af]">{subtitle}</p>
      ) : null}
    </div>
  );
}

function BreakdownShell({
  sectionTitle,
  children,
}: {
  sectionTitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      {sectionTitle ? (
        <p className="text-base font-extrabold text-brand">{sectionTitle}</p>
      ) : null}
      <div className="space-y-1 rounded-2xl border border-[#e8e8e8] bg-[#ffffff] px-4 py-3 dark:bg-[#141b19]">
        {children}
      </div>
    </div>
  );
}

/**
 * «عداد مشترك» amounts are a contract term (tenant → owner), shown for
 * transparency under the fees but never added to our total.
 */
function SharedMeterTerms({
  data,
  labels,
}: {
  data: ContractFinancialData;
  labels: FinancialSummaryLabels;
}) {
  const shared = data.shared_meters;
  const lines = [
    shared?.electricity
      ? { label: labels.sharedElectricityMeter, term: shared.electricity }
      : null,
    shared?.water ? { label: labels.sharedWaterMeter, term: shared.water } : null,
  ].filter((line): line is NonNullable<typeof line> => line !== null);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-xl bg-brand-background px-3 py-2.5 dark:bg-[#16352f]">
      <p className="text-xs font-bold text-brand dark:text-[#48c0b8]">
        {labels.sharedMetersTitle}
      </p>
      <ul className="mt-1 space-y-1">
        {lines.map((line) => (
          <li
            key={line.label}
            className="flex items-center justify-between gap-3 text-xs text-[#555555] dark:text-[#9eb5af]"
          >
            <span>{line.label}</span>
            <span dir="ltr" className="font-semibold tabular-nums text-[#333333] dark:text-white">
              {formatPaymentAmount(line.term.monthly)} × {line.term.months} ={" "}
              {formatPaymentAmount(line.term.total)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11px] leading-4 text-[#8a8a8a] dark:text-[#9eb5af]">
        {labels.sharedMetersNote}
      </p>
    </div>
  );
}

function SummarySkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="h-4 w-32 animate-pulse rounded bg-[#e2e2e2] dark:bg-[#243430]" />
      <span className="h-4 w-16 animate-pulse rounded bg-[#e2e2e2] dark:bg-[#243430]" />
    </div>
  );
}

function TotalRow({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="border-t border-[#1a5c4a] pt-3 dark:border-[#48c0b8]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-base font-extrabold text-brand dark:text-[#48c0b8]">
          {label}
        </span>
        <PaymentAmount
          amount={amount}
          className="text-xl font-extrabold text-brand! dark:text-[#48c0b8]!"
          iconClassName="text-brand"
          iconSize={22}
        />
      </div>
    </div>
  );
}

export default function CreateContractFinancialBreakdown({
  labels,
  contractType,
  data,
  isLoading,
  appliedCoupon = null,
  sectionTitle,
  feeSubtitle,
}: CreateContractFinancialBreakdownProps) {
  const breakdown = PAYMENT_BREAKDOWN[contractType];

  if (isLoading) {
    return (
      <BreakdownShell sectionTitle={sectionTitle}>
        <SummarySkeletonRow />
        <SummarySkeletonRow />
        <div className="border-t border-[#1a5c4a] pt-3 dark:border-[#48c0b8]">
          <SummarySkeletonRow />
        </div>
      </BreakdownShell>
    );
  }

  if (data) {
    const tax =
      typeof data.price_details.tax === "number" &&
      Number.isFinite(data.price_details.tax) &&
      data.price_details.tax > 0
        ? data.price_details.tax
        : 0;
    const baseTotal = appliedCoupon
      ? appliedCoupon.totalPriceBeforeCoupon
      : data.total_price;
    const documentSurcharge = resolveDocumentSurcharge(data);
    const electricityMeterFee = Math.max(
      0,
      Number(data.price_details.electricity_meter_fee ?? 0) || 0,
    );
    const waterMeterFee = Math.max(
      0,
      Number(data.price_details.water_meter_fee ?? 0) || 0,
    );
    // Documentation fee alone: the server's `fee` when present, otherwise the
    // total minus the itemised lines so the breakdown always adds up.
    const documentationFeeAmount =
      typeof data.fee === "number" && Number.isFinite(data.fee) && data.fee > 0
        ? data.fee
        : Math.max(
            0,
            baseTotal - tax - documentSurcharge - electricityMeterFee - waterMeterFee,
          );
    const payableTotal = appliedCoupon
      ? appliedCoupon.totalPriceAfterCoupon
      : data.total_price;

    return (
      <BreakdownShell sectionTitle={sectionTitle}>
        <SummaryRow
          label={labels.ejarFees}
          amount={documentationFeeAmount}
          subtitle={feeSubtitle}
          primary
        />

        {documentSurcharge > 0 ? (
          <SummaryRow
            label={labels.documentSurcharge}
            amount={documentSurcharge}
            subtitle={labels.documentSurchargeHint}
          />
        ) : null}

        {electricityMeterFee > 0 ? (
          <SummaryRow label={labels.electricityMeterFee} amount={electricityMeterFee} />
        ) : null}

        {waterMeterFee > 0 ? (
          <SummaryRow label={labels.waterMeterFee} amount={waterMeterFee} />
        ) : null}

        <div className="border-t border-dashed border-[#d4d4d4] dark:border-[#2f403b]" />

        <SummaryRow
          label={labels.vat}
          amount={tax}
          freeLabel={labels.free}
        />

        {appliedCoupon ? (
          <div className="space-y-0 border-t border-dashed border-[#d4d4d4] pt-2 dark:border-[#2f403b]">
            {hasDisplayAmount(appliedCoupon.totalPriceBeforeCoupon) ? (
              <SummaryRow
                label={labels.priceBeforeCoupon}
                amount={appliedCoupon.totalPriceBeforeCoupon}
              />
            ) : null}
            {hasDisplayAmount(appliedCoupon.discount) ? (
              <SummaryRow
                label={labels.discount}
                amount={appliedCoupon.discount}
              />
            ) : null}
          </div>
        ) : null}

        <TotalRow
          label={appliedCoupon ? labels.priceAfterCoupon : labels.total}
          amount={payableTotal}
        />

        <SharedMeterTerms data={data} labels={labels} />
      </BreakdownShell>
    );
  }

  const fallbackTax =
    Number.isFinite(breakdown.vat) && breakdown.vat > 0 ? breakdown.vat : 0;

  return (
    <BreakdownShell sectionTitle={sectionTitle}>
      <SummaryRow
        label={labels.ejarFees}
        amount={Math.max(0, breakdown.total - fallbackTax)}
        subtitle={feeSubtitle}
        primary
      />

      <div className="border-t border-dashed border-[#d4d4d4] dark:border-[#2f403b]" />

      <SummaryRow
        label={labels.vat}
        amount={fallbackTax}
        freeLabel={labels.free}
      />

      <TotalRow label={labels.total} amount={breakdown.total} />
    </BreakdownShell>
  );
}
