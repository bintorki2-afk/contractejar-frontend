"use client";

import {
  AlertCircle,
  Check,
  ClipboardList,
  Copy,
  CreditCard,
  Home,
  Pencil,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { formatPhoneDisplay } from "@/features/auth/utils/format-phone-display";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import { useContractReviewOrderSummary } from "@/features/create-contract/hooks/use-contract-review-order-summary";
import { useSubmitOrder } from "@/features/create-contract/hooks/use-submit-order";
import {
  useSyncContractToServer,
  type SyncContractStage,
} from "@/features/create-contract/hooks/use-sync-contract-to-server";
import CreateContractOtpLoginDialog from "@/features/create-contract/components/create-contract-otp-login-dialog";
import CreateContractPaymentStep from "@/features/create-contract/components/create-contract-payment-step";
import CreateContractReviewSectionCard from "@/features/create-contract/components/create-contract-review-section-card";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import type {
  CreateContractReviewAttachment,
  CreateContractReviewEditTarget,
} from "@/features/create-contract/types/create-contract-review-order";
import { reviewEditTargetToStep } from "@/features/create-contract/types/create-contract-review-order";
import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";
import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import AttachmentPreviewDialog from "@/features/shared/components/attachment-preview-dialog";
import CustomIcon from "@/features/shared/components/custom-icon";
import { useWhatsappHref } from "@/features/settings/hooks/use-whatsapp-href";
import { toPropertyContractType } from "@/features/create-contract/types/contract-type";
import { track } from "@/lib/analytics/track";
import { formatSaudiMobileForForm } from "@/lib/validation/format-saudi-mobile-for-form";

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
    paperLabel?: string;
    adversePossessionLabel?: string;
    economicCitiesLabel?: string;
  };
  onBack: () => void;
  onEditStep: (step: CreateContractStep) => void;
};

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
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-brand hover:bg-brand-background-green dark:text-[#48c0b8]"
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
  const tReview = useTranslations("createContract.review");
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
  const [orderNumberCopied, setOrderNumberCopied] = useState(false);
  // Signed-in customers never see the mobile card: the account mobile is used.
  // Guests get the mobile + OTP dialog on «إرسال الطلب» (#19).
  const authUser = useAuthStore((state) => state.user);
  const accountMobile = formatSaudiMobileForForm(authUser?.phone || authUser?.mobile || "");
  const isLoggedIn = authUser !== null && getSaudiNationalMobile(accountMobile) !== null;
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] =
    useState<CreateContractReviewAttachment | null>(null);
  // Object URL for previewing a local attachment; revoked when it changes.
  const previewObjectUrl = useMemo(
    () => (previewAttachment?.file ? URL.createObjectURL(previewAttachment.file) : null),
    [previewAttachment],
  );
  const previewUrl = previewObjectUrl ?? previewAttachment?.remoteUrl ?? null;

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);
  // "payment": the order exists on the server → show the pay screen.
  // "done": the customer chose to pay later (or the server sync failed and
  // the order went through the business channel only).
  const [serverOrder, setServerOrder] = useState<{ uuid: string } | null>(null);
  // The server rejected the data (4xx) or the request could not be sent:
  // the customer must see why and fix it — no business-channel fallback.
  const [syncError, setSyncError] = useState<string | null>(null);
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

  const hasFailed =
    syncError != null || (result != null && !result.ok && serverOrder == null);
  const hasIncompleteSections = summary.sections.some((section) => section.incomplete);

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

    if (hasIncompleteSections) {
      toast.error(t("incompleteSections"));
      return;
    }

    if (!isLoggedIn) {
      // Guest: mobile + OTP first; the order continues from `handleVerified`.
      setOtpDialogOpen(true);
      return;
    }

    setContactWhatsapp(accountMobile);
    await runSubmit(accountMobile);
  }

  function handleVerified({ mobile }: { mobile: string }) {
    setOtpDialogOpen(false);
    setContactWhatsapp(mobile);
    void runSubmit(mobile);
  }

  async function runSubmit(mobile: string) {
    // 1) Replay the draft onto the backend (real order → payment & tracking).
    //    Draft-first stays: a backend failure still lets the order through the
    //    business channel below, and the customer gets a payment link later.
    //    After the OTP the session cookie is the customer's token, so the
    //    contract is created straight under the account.
    setSyncError(null);
    const synced = await syncContract({ contactWhatsapp: mobile });
    // 4xx = the server refused the data (invalid file type/size, ID, …) and 0 =
    // the request never reached the server. Before, these fell through to the
    // business channel and the customer saw «تم استلام طلبك» (or a generic
    // error) without the reason. Only a real outage (5xx) keeps the fallback.
    if (!synced.ok && synced.status < 500) {
      // Server validation messages are Arabic; anything else (English fallbacks
      // such as "Something went wrong") is replaced by the Arabic explanation.
      const message =
        synced.status !== 0 && /[\u0600-\u06FF]/.test(synced.error)
          ? synced.error
          : t("errorBodyUpload");
      setSyncError(message);
      toast.error(message);
      return;
    }

    if (synced.ok) {
      setServerOrder({ uuid: synced.uuid });
      track("order_submitted", {
        order_number: String(synced.uuid),
        contract_type: toPropertyContractType(contractType),
      });
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("contract sync failed", synced.stage, synced.error);
    }

    // 2) Business notification (Telegram / intake / email) with the real order
    //    number when the sync succeeded.
    const outcome = await submitOrder({ contactWhatsapp: mobile });

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
        contractType={contractType}
        fallbackPhone={contactWhatsapp}
        onBack={() => setView("done")}
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
          <p className="mt-3 text-center text-xs leading-relaxed text-[#5c6b68] dark:text-[#9eb5af]">
            {t("smartLinkHint")}{" "}
            <a
              href={`/r/${orderNumber}`}
              dir="ltr"
              className="font-bold text-brand underline underline-offset-2 dark:text-[#48c0b8]"
            >
              contractejar.com/r/{orderNumber}
            </a>
          </p>
        ) : null}

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
              onClick={() => track("cta_whatsapp_click", { placement: "order_success" })}
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

  const previewKind: "image" | "pdf" | "other" = previewAttachment?.isImage
    ? "image"
    : /\.pdf$/i.test(previewAttachment?.fileName ?? "")
      ? "pdf"
      : "other";

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3 md:p-5">
        <div className="text-start">
          <h2 className="text-base font-extrabold text-brand md:text-lg dark:text-[#48c0b8]">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
            {isLoggedIn ? t("reviewIntroLoggedIn") : t("reviewIntro")}
          </p>
        </div>

        <div className="space-y-3">
          {/* Top strip: contract type / start date / duration (editable chips). */}
          <section className="rounded-2xl border border-[#cfe8dd] bg-[#f5fbf8] p-3 shadow-sm dark:border-[#2f403b] dark:bg-[#121a18] dark:shadow-none">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {overviewItems.map((item) => (
                <div
                  key={item.key}
                  className="relative flex flex-col items-start rounded-xl border border-[#dfe7e3] bg-white px-4 py-3 text-start shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2f403b] dark:bg-[#1a2421] dark:shadow-none"
                >
                  {item.editable ? (
                    <div className="absolute inset-e-1 top-1">
                      <OverviewEditIcon
                        label={`${reviewLabels.edit} ${item.label}`}
                        onClick={() => handleEdit("overview")}
                      />
                    </div>
                  ) : null}
                  <p className="mb-1 text-xs font-bold text-[#8a8a8a] dark:text-[#9eb5af]">
                    {item.label}
                  </p>
                  <p className="pe-6 text-sm font-extrabold leading-snug text-brand dark:text-[#48c0b8]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {summary.sections.map((section) => (
            <CreateContractReviewSectionCard
              key={section.id}
              section={section}
              editLabel={reviewLabels.edit}
              linkPreviewLabel={reviewLabels.linkPreview}
              attachmentsTitle={tReview("attachmentsTitle")}
              onEdit={() => handleEdit(section.editTarget)}
              onPreviewAttachment={setPreviewAttachment}
            />
          ))}

          {/* Contact: account mobile for signed-in customers; guests are asked
              (mobile + OTP) when they press «إرسال الطلب». */}
          {isLoggedIn ? (
            <section className="flex items-center justify-between gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3 dark:border-[#2f403b] dark:bg-[#121a18]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
                  <UserRound className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#8a8a8a] dark:text-[#9eb5af]">
                    {tReview("contact.accountMobile")}
                  </p>
                  <p dir="ltr" className="text-sm font-bold text-[#222222] dark:text-white">
                    {formatPhoneDisplay(accountMobile)}
                  </p>
                </div>
              </div>
              <FaWhatsapp className="size-5 shrink-0 text-[#25d366]" aria-hidden="true" />
            </section>
          ) : (
            <p className="flex items-start gap-2 rounded-2xl bg-brand-background px-4 py-3 text-xs leading-5 text-[#555555] dark:bg-[#16352f] dark:text-[#9eb5af]">
              <FaWhatsapp className="mt-0.5 size-4 shrink-0 text-[#25d366]" aria-hidden="true" />
              <span>{tReview("contact.loginHint")}</span>
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
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#555555] md:text-sm dark:text-[#e8c4c4]">
                  {syncError ?? t("errorBody")}
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

      <CreateContractOtpLoginDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        initialMobile={contactWhatsapp}
        onVerified={handleVerified}
      />

      <AttachmentPreviewDialog
        open={previewAttachment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewAttachment(null);
          }
        }}
        labels={{
          title: reviewLabels.attachmentPreviewTitle,
          close: reviewLabels.close,
          print: reviewLabels.print,
          download: reviewLabels.download,
          view: reviewLabels.view,
        }}
        fileName={previewAttachment?.fileName}
        url={previewUrl}
        kind={previewKind}
      />
    </div>
  );
}
