"use client";

import {
  ArrowLeftRight,
  Check,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  IdCard,
  Info,
  Loader2,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import CreateContractBirthDateFields from "@/features/create-contract/components/create-contract-birth-date-fields";
import CreateContractDeedImageUpload from "@/features/create-contract/components/create-contract-deed-image-upload";
import CreateContractFieldLabel from "@/features/create-contract/components/create-contract-field-label";
import CreateContractIconInputField from "@/features/create-contract/components/create-contract-icon-input-field";
import CreateContractOtpLoginDialog from "@/features/create-contract/components/create-contract-otp-login-dialog";
import CreateContractStepNavigation from "@/features/create-contract/components/create-contract-step-navigation";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import {
  EMPTY_BIRTH_DATE,
  type BirthDateValue,
} from "@/features/create-contract/types/owner-step";
import { ensureGuestSession } from "@/features/guest-session/services/ensure-guest-session";
import { setGuestContact } from "@/features/guest-session/services/set-guest-contact";
import { useLessorChangeInfo } from "@/features/lessor-change/hooks/use-lessor-change-info";
import { getLessorChangePaymentUrl } from "@/features/lessor-change/services/get-lessor-change-payment-url";
import { submitLessorChange } from "@/features/lessor-change/services/submit-lessor-change";
import { track } from "@/lib/analytics/track";
import type {
  LessorChangeDraft,
  LessorChangeOrder,
} from "@/features/lessor-change/types/lessor-change";
import CustomIcon from "@/features/shared/components/custom-icon";
import { getIdNumberFieldError } from "@/lib/validation/owner-step-validation";
import { isValidOwnerId } from "@/lib/validation/national-id";
import {
  filesToPersisted,
  persistedToFiles,
  type PersistedFile,
} from "@/lib/storage/persisted-files";

// Survives a page refresh (fields + deed images ≤ 512 KB each); cleared once
// the request is sent and on logout.
export const LESSOR_CHANGE_DRAFT_KEY = "aqdi-lessor-change-draft";

type StoredLessorChangeDraft = {
  step: "documents" | "owner";
  newOwnerIdNumber: string;
  newOwnerBirthDate: LessorChangeDraft["newOwnerBirthDate"];
  notes: string;
  acknowledged: boolean;
  oldDeed: PersistedFile[];
  newDeed: PersistedFile[];
};
import { isAdultBirthDateComplete } from "@/lib/validation/birth-date-year-options";
import { formatSaudiMobileForForm } from "@/lib/validation/format-saudi-mobile-for-form";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/utils/digits";

type LessorChangeFlowProps = {
  deedImageLabels: CreateContractLabels["deed"]["deedImage"];
  birthDateLabels: CreateContractLabels["owner"]["birthDate"];
};

type FlowStep = "documents" | "owner";

const EMPTY_DRAFT: LessorChangeDraft = {
  oldDeedFiles: [],
  newDeedFiles: [],
  newOwnerIdNumber: "",
  newOwnerBirthDate: { ...EMPTY_BIRTH_DATE },
  notes: "",
  acknowledged: false,
};

function Amount({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-extrabold tabular-nums text-brand dark:text-[#48c0b8]">
      {value.toLocaleString("en-US")}
      <CustomIcon src="/icons/ryal.svg" size={14} className="text-brand dark:text-[#48c0b8]" />
    </span>
  );
}

// QA PROPS-26: the server accepts WEBP for both deeds (`mimes:jpg,jpeg,png,webp,pdf`),
// so the picker and its hint offer it too.
const LESSOR_DEED_ACCEPT = "image/png,image/jpeg,image/webp,application/pdf";

function StepBadge({
  index,
  label,
  state,
}: {
  index: number;
  label: string;
  state: "active" | "complete" | "upcoming";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
          state === "complete"
            ? "bg-brand-secondary text-white"
            : state === "active"
              ? "bg-brand text-white shadow-[0_0_0_4px_rgba(0,168,128,0.15)]"
              : "bg-[#eef0ef] text-[#9a9a9a] dark:bg-[#24302c] dark:text-[#6a7a74]",
        )}
      >
        {state === "complete" ? <Check className="size-4" aria-hidden="true" /> : index}
      </span>
      <span
        className={cn(
          "truncate text-sm font-bold",
          state === "upcoming"
            ? "text-[#9a9a9a] dark:text-[#6a7a74]"
            : "text-brand dark:text-[#48c0b8]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

/** Business notification (Telegram) with a labelled payload — best-effort. */
async function notifyLessorChangeOrder(
  order: LessorChangeOrder,
  draft: LessorChangeDraft,
  mobile: string,
  labels: { serviceLabel: string; sectionTitle: string; idNumber: string; birthDate: string; notes: string; fee: string },
) {
  try {
    const dob = draft.newOwnerBirthDate;
    const payload = {
      orderNumber: order.order_number,
      contractType: labels.serviceLabel,
      whatsappNumber: mobile,
      sections: [
        {
          title: labels.sectionTitle,
          fields: [
            { label: labels.idNumber, value: draft.newOwnerIdNumber },
            {
              label: labels.birthDate,
              value: `${dob.day}/${dob.month}/${dob.year} (${dob.calendarType === "hijri" ? "هجري" : "ميلادي"})`,
            },
            { label: labels.fee, value: `${order.fee.toLocaleString("en-US")} ريال` },
            { label: labels.notes, value: draft.notes },
          ],
        },
      ],
      notes: `${labels.serviceLabel} — ${order.status_label}`,
    };

    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const files = [
      ...draft.oldDeedFiles.map((file) => ({ file, label: "صك المالك القديم" })),
      ...draft.newDeedFiles.map((file) => ({ file, label: "صك المالك الجديد" })),
    ];
    if (files.length > 0) {
      const form = new FormData();
      form.append("orderNumber", order.order_number);
      for (const { file, label } of files) {
        form.append("files", file, file.name);
        form.append("labels", label);
      }
      await fetch("/api/order-attachments", { method: "POST", body: form });
    }
  } catch {
    // Best-effort only — the order already exists on the backend.
  }
}

/**
 * «تغيير المؤجر»: two short steps (documents → new owner), the transfer notice
 * with an acknowledgement, then guest OTP (if needed) → `POST /lessor-change`
 * → Moyasar via `GET /payment/lessor-change/{uuid}`.
 */
export default function LessorChangeFlow({
  deedImageLabels,
  birthDateLabels,
}: LessorChangeFlowProps) {
  const t = useTranslations("lessorChange.flow");
  const { info } = useLessorChangeInfo();
  const lessorDeedLabels = { ...deedImageLabels, acceptedFormats: "png - jpeg - webp - pdf" };
  const authUser = useAuthStore((state) => state.user);
  const accountMobile = formatSaudiMobileForForm(authUser?.phone || authUser?.mobile || "");
  const isLoggedIn = authUser !== null && getSaudiNationalMobile(accountMobile) !== null;

  const [step, setStep] = useState<FlowStep>("documents");
  const [draft, setDraft] = useState<LessorChangeDraft>(EMPTY_DRAFT);
  const [showErrors, setShowErrors] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<LessorChangeOrder | null>(null);
  const restored = useRef(false);

  // Restore the saved draft once (client only).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(LESSOR_CHANGE_DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as StoredLessorChangeDraft;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft({
        oldDeedFiles: persistedToFiles(saved.oldDeed ?? []),
        newDeedFiles: persistedToFiles(saved.newDeed ?? []),
        newOwnerIdNumber: saved.newOwnerIdNumber ?? "",
        newOwnerBirthDate: saved.newOwnerBirthDate ?? { ...EMPTY_BIRTH_DATE },
        notes: saved.notes ?? "",
        acknowledged: Boolean(saved.acknowledged),
      });
      if (saved.step === "owner") setStep("owner");
    } catch {
      // Corrupt/unavailable storage: start empty.
    }
  }, []);

  // Save on every change (until the request has been sent).
  useEffect(() => {
    if (!restored.current || order) return;
    let cancelled = false;
    void (async () => {
      const [oldDeed, newDeed] = await Promise.all([
        filesToPersisted(draft.oldDeedFiles),
        filesToPersisted(draft.newDeedFiles),
      ]);
      if (cancelled) return;
      try {
        const value: StoredLessorChangeDraft = {
          step,
          newOwnerIdNumber: draft.newOwnerIdNumber,
          newOwnerBirthDate: draft.newOwnerBirthDate,
          notes: draft.notes,
          acknowledged: draft.acknowledged,
          oldDeed,
          newDeed,
        };
        localStorage.setItem(LESSOR_CHANGE_DRAFT_KEY, JSON.stringify(value));
      } catch {
        // Quota/private mode: keep working without persistence.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [draft, step, order]);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);

  function update<K extends keyof LessorChangeDraft>(key: K, value: LessorChangeDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const documentsComplete = draft.oldDeedFiles.length > 0 && draft.newDeedFiles.length > 0;
  const idError = getIdNumberFieldError(
    draft.newOwnerIdNumber,
    { required: t("idNumberRequired"), length: t("idNumberLength") },
    { showEmpty: showErrors, allowEstablishment: true },
  );
  const idComplete = isValidOwnerId(draft.newOwnerIdNumber);
  const dobComplete = isAdultBirthDateComplete(draft.newOwnerBirthDate);
  const ownerComplete = idComplete && dobComplete && draft.acknowledged;

  function handleDocumentsContinue() {
    if (!documentsComplete) {
      setShowErrors(true);
      toast.error(t("incomplete"));
      return;
    }
    setShowErrors(false);
    setStep("owner");
  }

  async function handleContinue() {
    if (isSubmitting) {
      return;
    }

    if (!ownerComplete) {
      setShowErrors(true);
      toast.error(draft.acknowledged ? t("incomplete") : t("acknowledgeRequired"));
      return;
    }

    if (!isLoggedIn) {
      setOtpOpen(true);
      return;
    }

    await runSubmit(accountMobile);
  }

  async function openPayment(uuid: string) {
    setIsOpeningPayment(true);
    setPaymentError(null);

    try {
      const payment = await getLessorChangePaymentUrl(uuid);
      if (!payment.ok) {
        // The gateway's own message («غير مسموح» …) means nothing to the
        // customer: show our hint and keep «ادفع الآن» for a retry.
        setPaymentError(t("paymentUnavailable"));
        return;
      }

      if ("alreadyPaid" in payment) {
        toast.success(t("alreadyPaid"));
        return;
      }

      window.location.assign(payment.paymentUrl);
    } finally {
      setIsOpeningPayment(false);
    }
  }

  async function runSubmit(mobile: string) {
    setIsSubmitting(true);

    try {
      // Same session handling as the contract wizard: a guest token is created
      // when needed and the contact mobile is attached for tracking.
      const session = await ensureGuestSession();
      if (!session.ok) {
        toast.error(t("submitError"));
        return;
      }
      if (!isLoggedIn) {
        await setGuestContact(mobile);
      }

      const form = new FormData();
      form.append("old_deed_image", draft.oldDeedFiles[0]!, draft.oldDeedFiles[0]!.name);
      form.append("new_deed_image", draft.newDeedFiles[0]!, draft.newDeedFiles[0]!.name);
      form.append("new_owner_id_number", digitsOnly(draft.newOwnerIdNumber));
      // Plain integers (no leading zeros — the server's `integer` rule rejects "06").
      form.append("new_owner_dob_day", String(Number(digitsOnly(draft.newOwnerBirthDate.day))));
      form.append("new_owner_dob_month", String(Number(digitsOnly(draft.newOwnerBirthDate.month))));
      form.append("new_owner_dob_year", String(Number(digitsOnly(draft.newOwnerBirthDate.year))));
      form.append("new_owner_dob_type", draft.newOwnerBirthDate.calendarType);
      form.append("mobile", digitsOnly(mobile));
      if (draft.notes.trim()) {
        form.append("notes", draft.notes.trim());
      }
      form.append("acknowledged", "1");
      form.append("platform", "web");

      const result = await submitLessorChange(form);
      if (!result.ok) {
        toast.error(result.error || t("submitError"));
        return;
      }

      setOrder(result.order);
      try {
        localStorage.removeItem(LESSOR_CHANGE_DRAFT_KEY);
      } catch {
        // ignore
      }
      track("lessor_change_submitted", {
        order_number: String(result.order.order_number ?? result.order.uuid ?? ""),
        value: typeof result.order.fee === "number" ? result.order.fee : undefined,
      });
      toast.success(t("submitted"));

      void notifyLessorChangeOrder(result.order, draft, mobile, {
        serviceLabel: t("serviceLabel"),
        sectionTitle: t("newOwnerTitle"),
        idNumber: t("idNumberLabel"),
        birthDate: t("birthDateLabel"),
        notes: t("notesLabel"),
        fee: t("feeLabel"),
      });

      if (result.order.awaiting_payment !== false) {
        await openPayment(result.order.uuid);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (order) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="size-16 text-brand-secondary" aria-hidden="true" />
          <p className="text-xl font-extrabold text-brand md:text-2xl dark:text-[#48c0b8]">
            {t("successTitle")}
          </p>
          <p className="max-w-md text-sm leading-relaxed text-[#5c6b68] dark:text-[#9eb5af]">
            {t("successBody")}
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-brand-background-green px-4 py-4 text-center dark:bg-[#121a18]">
          <p className="text-xs font-medium text-[#5c6b68] dark:text-[#9eb5af]">
            {t("orderNumberLabel")}
          </p>
          <p
            dir="ltr"
            className="mt-2 inline-flex rounded-lg bg-brand px-3 py-1.5 text-lg font-extrabold tracking-wide text-white dark:bg-[#0f6b5c]"
          >
            {order.order_number}
          </p>
          <p className="mt-2 text-sm text-[#333333] dark:text-white">
            {t("feeLabel")}: <Amount value={order.fee} />
          </p>
        </div>

        {paymentError ? (
          <p className="mt-3 rounded-xl bg-[#fff5f5] px-3 py-2 text-center text-xs text-[#c62828] dark:bg-[#2a1818] dark:text-[#f87171]">
            {paymentError}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {order.awaiting_payment !== false ? (
            <Button
              type="button"
              onClick={() => void openPayment(order.uuid)}
              disabled={isOpeningPayment}
              className="h-12 w-full rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90 dark:bg-[#0f6b5c]"
            >
              {isOpeningPayment ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <CreditCard className="size-5" aria-hidden="true" />
              )}
              {t("payNow")}
            </Button>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-brand/25 text-sm font-bold text-brand hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8]"
            >
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                {t("homeCta")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-brand/25 text-sm font-bold text-brand hover:bg-brand-background-green dark:border-[#2f403b] dark:text-[#48c0b8]"
            >
              <Link href={`/r/${order.order_number}`}>
                <ClipboardList className="size-4" aria-hidden="true" />
                {t("trackCta")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-[#f0f0f0] px-4 py-4 md:px-6 dark:border-[#2f403b]">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
            <ArrowLeftRight className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-brand md:text-xl dark:text-[#48c0b8]">
              {t("title")}
            </h1>
            <p className="text-xs leading-5 text-[#7f7f7f] dark:text-[#9eb5af]">
              {t("subtitle")} · <Amount value={info.fee} />
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StepBadge
            index={1}
            label={t("stepDocuments")}
            state={step === "documents" ? "active" : "complete"}
          />
          <StepBadge
            index={2}
            label={t("stepOwner")}
            state={step === "owner" ? "active" : "upcoming"}
          />
        </div>
      </div>

      <div className="p-4 md:p-6">
        {step === "documents" ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-2xl bg-brand-background px-4 py-3 text-xs leading-5 text-[#555555] dark:bg-[#16352f] dark:text-[#9eb5af]">
              <FileText className="mt-0.5 size-4 shrink-0 text-brand-secondary" aria-hidden="true" />
              <span>{t("documentsHint")}</span>
            </div>

            <CreateContractDeedImageUpload
              labels={lessorDeedLabels}
              accept={LESSOR_DEED_ACCEPT}
              fieldLabel={t("oldDeedLabel")}
              value={draft.oldDeedFiles}
              onChange={(files) => update("oldDeedFiles", files)}
              single
              variant="dashed"
              invalid={showErrors && draft.oldDeedFiles.length === 0}
            />

            <CreateContractDeedImageUpload
              labels={lessorDeedLabels}
              accept={LESSOR_DEED_ACCEPT}
              fieldLabel={t("newDeedLabel")}
              value={draft.newDeedFiles}
              onChange={(files) => update("newDeedFiles", files)}
              single
              variant="dashed"
              invalid={showErrors && draft.newDeedFiles.length === 0}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleDocumentsContinue}
                className="h-11 rounded-2xl bg-brand px-6 text-sm font-bold text-white hover:bg-brand/90 dark:bg-[#0f6b5c]"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="flex items-center justify-center gap-2 text-lg font-extrabold text-brand dark:text-[#48c0b8]">
                <UserRound className="size-5" aria-hidden="true" />
                {t("newOwnerTitle")}
              </h2>
              <p className="text-sm text-[#9a9a9a]">{t("newOwnerDescription")}</p>
            </div>

            <CreateContractIconInputField
              label={t("idNumberLabel")}
              placeholder={t("idNumberPlaceholder")}
              value={draft.newOwnerIdNumber}
              onChange={(value) => update("newOwnerIdNumber", digitsOnly(value).slice(0, 10))}
              icon={IdCard}
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              errorMessage={idError}
              invalid={showErrors && !idComplete}
              valid={idComplete}
            />

            <CreateContractBirthDateFields
              labels={{ ...birthDateLabels, label: t("birthDateLabel") }}
              value={draft.newOwnerBirthDate}
              onChange={(value: BirthDateValue) => update("newOwnerBirthDate", value)}
              invalid={showErrors && !dobComplete}
            />

            <div>
              <CreateContractFieldLabel label={t("notesLabel")} required={false} />
              <Textarea
                value={draft.notes}
                onChange={(event) => update("notes", event.target.value.slice(0, 500))}
                placeholder={t("notesPlaceholder")}
                rows={3}
                className="rounded-2xl border-[#e4e4e4] bg-white text-sm dark:border-[#2f403b] dark:bg-[#121a18]"
              />
            </div>

            <div
              className={cn(
                "rounded-2xl border px-4 py-3",
                showErrors && !draft.acknowledged
                  ? "border-[#e57373] bg-[#fff5f5] dark:border-[#5c2a2a] dark:bg-[#2a1818]"
                  : "border-[#f1e3c4] bg-[#fdf8ee] dark:border-[#4a3a22] dark:bg-[#2b2316]",
              )}
            >
              <p className="flex items-start gap-2 text-sm font-bold leading-6 text-[#6f5b3d] dark:text-[#e5c892]">
                <Info className="mt-1 size-4 shrink-0 text-[#c9962e]" aria-hidden="true" />
                <span>{info.notice}</span>
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#555555] dark:text-[#9eb5af]">
                <Checkbox
                  checked={draft.acknowledged}
                  onCheckedChange={(checked) => update("acknowledged", checked === true)}
                  className="mt-0.5 size-5 rounded-md border-[#c9962e] data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                />
                <span>{t("acknowledge")}</span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-background-green px-4 py-3 dark:bg-[#16352f]">
              <span className="text-sm font-bold text-brand dark:text-[#48c0b8]">
                {t("feeLabel")}
              </span>
              <Amount value={info.fee} />
            </div>

            <CreateContractStepNavigation
              previousLabel={t("previous")}
              continueLabel={t("submit")}
              isSubmitting={isSubmitting}
              onPrevious={() => setStep("documents")}
              onContinue={() => void handleContinue()}
            />
          </div>
        )}
      </div>

      <CreateContractOtpLoginDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onVerified={({ mobile }) => {
          setOtpOpen(false);
          void runSubmit(mobile);
        }}
      />
    </>
  );
}
