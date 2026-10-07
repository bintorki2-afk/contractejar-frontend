"use client";

import {
  AlertCircle,
  Check,
  ClipboardList,
  Copy,
  CreditCard,
  Home,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import { useContractReviewOrderSummary } from "@/features/create-contract/hooks/use-contract-review-order-summary";
import { useSubmitOrder } from "@/features/create-contract/hooks/use-submit-order";
import {
  useSyncContractToServer,
  type SyncContractStage,
} from "@/features/create-contract/hooks/use-sync-contract-to-server";
import CreateContractPaymentStep from "@/features/create-contract/components/create-contract-payment-step";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type { CreateContractReviewEditTarget } from "@/features/create-contract/types/create-contract-review-order";
import { reviewEditTargetToStep } from "@/features/create-contract/types/create-contract-review-order";
import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";
import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import CustomIcon from "@/features/shared/components/custom-icon";
import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";
import { cn } from "@/lib/utils";

type CreateContractSubmitStepProps = {
  reviewLabels: CreateContractLabels["payment"]["reviewDialog"];
  paymentLabels: CreateContractLabels["payment"];
  saveLaterDialogLabels: CreateContractLabels["tenant"]["saveLaterDialog"];
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
  onBack: () => void;
  onEditStep: (step: CreateContractStep) => void;
};

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

export default function CreateContractSubmitStep({
  reviewLabels,
  paymentLabels,
  saveLaterDialogLabels,
  contractType,
  deedTypeLabels,
  deedAttachmentLabels,
  onBack,
  onEditStep,
}: CreateContractSubmitStepProps) {
  const t = useTranslations("createContract.submit");
  const summary = useContractReviewOrderSummary(
    reviewLabels,
    contractType,
    deedTypeLabels,
    deedAttachmentLabels,
  );
  const contactWhatsapp = useCreateContractDraftStore(
    (state) => state.contactWhatsapp,
  );
  const setContactWhatsapp = useCreateContractDraftStore(
    (state) => state.setContactWhatsapp,
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
  const whatsappHref = useWhatsappHref();
  const { submitOrder, isSubmitting: isNotifying, result } = useSubmitOrder({
    summary,
    contractType,
  });
  const { syncContract, isSyncing, stage } = useSyncContractToServer(contractType);
  const isSubmitting = isSyncing || isNotifying;
  const [showWhatsappError, setShowWhatsappError] = useState(false);
  const [orderNumberCopied, setOrderNumberCopied] = useState(false);
  // "payment": the order exists on the server → show the pay screen.
  // "done": the customer chose to pay later (or the server sync failed and
  // the order went through the business channel only).
  const [serverOrder, setServerOrder] = useState<{ uuid: string } | null>(null);
  const [view, setView] = useState<"form" | "payment" | "done">("form");

  async function handleCopyOrderNumber(orderNumber: string) {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setOrderNumberCopied(true);
      toast.success(t("orderNumberCopied"));
      window.setTimeout(() => setOrderNumberCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable (insecure context) — fail quietly.
    }
  }

  const isWhatsappValid = getSaudiNationalMobile(contactWhatsapp) !== null;
  const hasFailed = result != null && !result.ok && serverOrder == null;

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

    onEditStep(reviewEditTargetToStep(target));
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (!isWhatsappValid) {
      setShowWhatsappError(true);
      return;
    }

    setShowWhatsappError(false);

    // 1) Replay the draft onto the backend (real order → payment & tracking).
    //    Draft-first stays: a backend failure still lets the order through the
    //    business channel below, and the customer gets a payment link later.
    const synced = await syncContract({ contactWhatsapp });
    if (synced.ok) {
      setServerOrder({ uuid: synced.uuid });
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("contract sync failed", synced.stage, synced.error);
    }

    // 2) Business notification (Telegram / intake / email) with the real order
    //    number when the sync succeeded.
    const outcome = await submitOrder({ contactWhatsapp });

    if (synced.ok) {
      setView("payment");
    } else if (outcome.ok) {
      setView("done");
    }
  }

  const orderSucceeded = serverOrder != null || result?.ok === true;

  if (view === "payment" && serverOrder) {
    return (
      <CreateContractPaymentStep
        labels={paymentLabels}
        saveLaterDialogLabels={saveLaterDialogLabels}
        deedTypeLabels={deedTypeLabels}
        deedAttachmentLabels={deedAttachmentLabels}
        contractType={contractType}
        fallbackPhone={contactWhatsapp}
        onBack={() => setView("done")}
        onEditStep={onEditStep}
      />
    );
  }

  if (view === "done" && orderSucceeded) {
    const orderNumber = String(serverOrder?.uuid ?? result?.orderNumber ?? "");
    const whatsappMessage = t("whatsappMessage", { orderNumber });
    const whatsappShareHref = `${whatsappHref}${
      whatsappHref.includes("?") ? "&" : "?"
    }text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="p-3 md:p-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <CustomIcon
            src="/icons/shiled-check.svg"
            size={72}
            className="text-brand-secondary dark:text-[#48c0b8]"
          />
          <p className="text-xl font-extrabold leading-relaxed text-brand md:text-2xl dark:text-[#48c0b8]">
            {t("successTitle")}
          </p>
          <p className="max-w-md text-sm leading-relaxed text-[#5c6b68] dark:text-[#9eb5af]">
            {serverOrder ? t("successBodyPayLater") : t("successBody")}
          </p>
        </div>

        {serverOrder ? (
          <Button
            type="button"
            onClick={() => setView("payment")}
            className="mt-5 h-12 w-full rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90 dark:bg-[#0f6b5c]"
          >
            <CreditCard className="size-5" aria-hidden="true" />
            {t("payNowCta")}
          </Button>
        ) : null}

        <div className="mt-5 rounded-2xl bg-brand-background-green px-4 py-4 text-center dark:bg-[#121a18]">
          <p className="text-xs font-medium text-[#5c6b68] dark:text-[#9eb5af]">
            {t("orderNumberLabel")}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="inline-flex max-w-full truncate rounded-lg bg-brand px-3 py-1.5 text-lg font-extrabold tracking-wide text-white md:text-xl dark:bg-[#0f6b5c]">
              {orderNumber}
            </span>
            <button
              type="button"
              onClick={() => void handleCopyOrderNumber(orderNumber)}
              aria-label={t("copyOrderNumber")}
              title={t("copyOrderNumber")}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-white text-brand transition-colors hover:bg-brand-background-green dark:border-[#2f403b] dark:bg-[#1a2421] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              {orderNumberCopied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-brand/25 text-sm font-bold text-brand hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                {t("homeCta")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-brand/25 text-sm font-bold text-brand hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8] dark:hover:bg-[#24302c]"
            >
              <Link href={serverOrder ? "/requests" : "/track"}>
                <ClipboardList className="size-4" aria-hidden="true" />
                {serverOrder ? t("viewOrdersCta") : t("trackOrderCta")}
              </Link>
            </Button>
          </div>

          <Button
            asChild
            className="h-12 w-full rounded-full bg-[#25d366] text-base font-bold text-white hover:bg-[#1ebe5a]"
          >
            <Link
              href={whatsappShareHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="size-5" aria-hidden="true" />
              {t("contactWhatsappCta")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const overviewItems = [
    {
      key: "contractType",
      label: reviewLabels.fields.contractType,
      value: summary.overview.contractType,
      editable: false,
    },
    {
      key: "startDate",
      label: reviewLabels.fields.startDate,
      value: summary.overview.startDate,
      editable: true,
    },
    {
      key: "duration",
      label: reviewLabels.fields.duration,
      value: summary.overview.duration,
      editable: true,
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3 md:p-5">
        <div className="text-start">
          <h2 className="text-base font-extrabold text-brand md:text-lg dark:text-[#48c0b8]">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
            {t("reviewIntro")}
          </p>
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
                        label={`${reviewLabels.edit} ${item.label}`}
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
              const amount = amountField?.value ?? reviewLabels.emptyValue;
              const paymentMethod =
                paymentMethodField?.value ?? reviewLabels.emptyValue;

              return (
                <section
                  key={section.id}
                  className="relative overflow-hidden rounded-2xl bg-brand px-4 py-5 text-white shadow-sm dark:bg-[#0f6b5c] dark:shadow-none"
                >
                  <EditButton
                    label={reviewLabels.edit}
                    onClick={() => handleEdit(section.editTarget)}
                    className="absolute inset-e-3 top-3 border-white/20 bg-white/15 text-white hover:bg-white/25 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                  />
                  <div className="space-y-2 text-start">
                    <p className="text-sm font-bold opacity-90">{section.title}</p>
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
                    label={reviewLabels.edit}
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
                    {reviewLabels.unitIncomplete}
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
                          <a
                            href={field.href}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex font-bold text-brand underline-offset-2 hover:underline dark:text-[#48c0b8]"
                          >
                            {reviewLabels.linkPreview}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-sm font-bold wrap-break-word text-[#2b2b2b] dark:text-white">
                            {field.value}
                          </p>
                        )}
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
                            <a
                              href={field.href}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-brand underline-offset-2 hover:underline dark:text-[#48c0b8]"
                            >
                              {reviewLabels.linkPreview}
                            </a>
                          ) : (
                            <span className="wrap-break-word font-bold text-[#222] dark:text-white">
                              {field.value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#e8e8e8] bg-white px-4 py-4 dark:border-[#2f403b] dark:bg-[#121a18]">
          <label
            htmlFor="contact-whatsapp"
            className="flex items-center gap-2 text-sm font-bold text-brand dark:text-[#48c0b8]"
          >
            <FaWhatsapp className="size-4 shrink-0 text-[#25d366]" aria-hidden="true" />
            {t("whatsappLabel")}
          </label>
          <input
            id="contact-whatsapp"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            value={contactWhatsapp}
            onChange={(event) => {
              setContactWhatsapp(event.target.value);
              if (showWhatsappError) {
                setShowWhatsappError(false);
              }
            }}
            placeholder={t("whatsappPlaceholder")}
            aria-invalid={showWhatsappError}
            className={cn(
              "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-start text-sm font-semibold text-[#222] outline-none transition-colors placeholder:font-normal placeholder:text-[#b5b5b5] focus:border-brand dark:bg-[#1a2421] dark:text-white dark:placeholder:text-[#5f716c]",
              showWhatsappError
                ? "border-[#e11d48] dark:border-[#f87171]"
                : "border-[#e0e0e0] dark:border-[#2f403b]",
            )}
          />
          {showWhatsappError ? (
            <p className="mt-2 text-xs font-medium text-[#e11d48] dark:text-[#f87171]">
              {t("whatsappInvalid")}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-[#9a9a9a] dark:text-[#9eb5af]">
              {t("whatsappHint")}
            </p>
          )}
        </div>

        {hasFailed && !isSubmitting ? (
          <div className="rounded-2xl border border-[#f2c7c7] bg-[#fff5f5] px-4 py-3 dark:border-[#5c2a2a] dark:bg-[#2a1818]">
            <div className="flex items-start gap-2">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive dark:text-[#f87171]"
                aria-hidden="true"
              />
              <div className="space-y-2 text-start">
                <p className="text-sm font-bold text-destructive dark:text-[#f87171]">
                  {t("errorTitle")}
                </p>
                <p className="text-xs leading-relaxed text-[#555555] md:text-sm dark:text-[#e8c4c4]">
                  {t("errorBody")}
                </p>
                <Link
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1ebe5a] underline-offset-2 hover:underline"
                >
                  <FaWhatsapp className="size-4 shrink-0" aria-hidden="true" />
                  {t("contactWhatsappCta")}
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-12 flex-1 rounded-2xl border-[#e0e0e0] text-sm font-bold text-[#555555] hover:bg-[#f7f7f7] dark:border-[#2f403b] dark:text-[#9eb5af] dark:hover:bg-[#24302c]"
          >
            {t("back")}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="h-12 flex-[2] rounded-2xl bg-brand text-sm font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#0f6b5c]"
          >
            {isSubmitting
              ? stage
                ? t(`syncing.${stage as SyncContractStage}`)
                : t("submitting")
              : hasFailed
                ? t("retry")
                : t("submitButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
