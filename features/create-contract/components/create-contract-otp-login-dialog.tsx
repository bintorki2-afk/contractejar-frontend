"use client";

import {
  ArrowUpLeft,
  Loader2,
  Pencil,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup } from "@/components/ui/input-otp";
import VerifyOtpSlot from "@/features/auth/components/verify-otp-slot";
import { useOtpTimer } from "@/features/auth/hooks/use-otp-timer";
import { requestPhoneOtp } from "@/features/auth/services/request-phone-otp";
import { verifyPhoneOtp } from "@/features/auth/services/verify-phone-otp";
import { track } from "@/lib/analytics/track";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import type { AuthUser } from "@/features/auth/types/auth-user";
import { formatPhoneDisplay } from "@/features/auth/utils/format-phone-display";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import CreateContractSaudiMobileField from "@/features/create-contract/components/create-contract-saudi-mobile-field";
import { ensureGuestSession } from "@/features/guest-session/services/ensure-guest-session";
import { setGuestContact } from "@/features/guest-session/services/set-guest-contact";
import { toSaudiMobileInputValue } from "@/lib/validation/format-saudi-mobile-for-form";
import { digitsOnly } from "@/lib/utils/digits";

const OTP_MIN_LENGTH = 4;
const OTP_MAX_LENGTH = 6;

type CreateContractOtpLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefill (e.g. a number typed earlier). */
  initialMobile?: string;
  /** Called once the customer is signed in; `mobile` is 05XXXXXXXX. */
  onVerified: (result: { user: AuthUser; mobile: string }) => void;
};

/**
 * Guest checkout gate: mobile → OTP → signed in (same cookies as the phone
 * login form). The guest session gets the mobile first (`/auth/guest/contact`)
 * so an abandoned order can still be tracked, and the backend merges the
 * guest's contracts into the verified account.
 */
export default function CreateContractOtpLoginDialog({
  open,
  onOpenChange,
  initialMobile = "",
  onVerified,
}: CreateContractOtpLoginDialogProps) {
  // The flow state lives in the body, which (un)mounts with the dialog, so
  // every opening starts fresh at the mobile phase.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <OtpLoginFlow
          initialMobile={initialMobile}
          onVerified={onVerified}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

function OtpLoginFlow({
  initialMobile,
  onVerified,
  onOpenChange,
}: {
  initialMobile: string;
  onVerified: CreateContractOtpLoginDialogProps["onVerified"];
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("createContract.otpDialog");
  const tLogin = useTranslations("auth.phoneLogin");
  const setUser = useAuthStore((state) => state.setUser);
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [mobile, setMobile] = useState(() =>
    toSaudiMobileInputValue(initialMobile),
  );
  const [showMobileError, setShowMobileError] = useState(false);
  const [code, setCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const timer = useOtpTimer(59);

  const mobileValid = getSaudiNationalMobile(mobile) !== null;
  const codeDigits = digitsOnly(code);
  const codeValid = codeDigits.length >= OTP_MIN_LENGTH;
  const busy = isSending || isVerifying;

  async function sendCode(): Promise<boolean> {
    // Guest session + contact number first: tracking (order number + mobile)
    // keeps working even if the customer leaves before verifying.
    const session = await ensureGuestSession();
    if (session.ok) {
      await setGuestContact(mobile);
    }

    const response = await requestPhoneOtp(mobile);
    if (!response.ok) {
      toast.error(
        response.status === 429
          ? tLogin("tooManyRequests")
          : response.error || tLogin("sendError"),
      );
      return false;
    }

    track("otp_requested", { context: "checkout" });
    return true;
  }

  async function handleSendCode() {
    if (busy) {
      return;
    }

    if (!mobileValid) {
      setShowMobileError(true);
      return;
    }

    setShowMobileError(false);
    setIsSending(true);

    try {
      const sent = await sendCode();
      if (!sent) {
        return;
      }

      setCode("");
      timer.reset();
      setPhase("otp");
      toast.success(tLogin("sendSuccess"));
    } finally {
      setIsSending(false);
    }
  }

  async function handleResend() {
    if (busy || !timer.isExpired) {
      return;
    }

    setIsSending(true);
    try {
      const sent = await sendCode();
      if (sent) {
        timer.reset();
        toast.success(tLogin("sendSuccess"));
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify() {
    if (busy || !codeValid) {
      return;
    }

    setIsVerifying(true);

    try {
      const response = await verifyPhoneOtp({
        phone: mobile,
        code: codeDigits,
      });
      if (!response.ok) {
        toast.error(response.error || tLogin("verifyError"));
        setCode("");
        return;
      }

      setUser(response.user);
      track("otp_verified", { context: "checkout" });
      toast.success(tLogin("verifySuccess"));
      onVerified({ user: response.user, mobile });
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="gap-0 rounded-3xl p-5 sm:max-w-md dark:bg-[#1a2421]"
      onInteractOutside={(event) => {
        if (busy) {
          event.preventDefault();
        }
      }}
      onEscapeKeyDown={(event) => {
        if (busy) {
          event.preventDefault();
        }
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#ececec] pb-3 dark:border-[#2f403b]">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#16352f] dark:text-[#48c0b8]">
            {phase === "phone" ? (
              <Smartphone className="size-5" aria-hidden="true" />
            ) : (
              <ShieldCheck className="size-5" aria-hidden="true" />
            )}
          </span>
          <div>
            <DialogTitle className="text-base font-extrabold leading-snug text-brand dark:text-[#48c0b8]">
              {phase === "phone" ? t("phoneTitle") : t("otpTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-relaxed text-[#7f7f7f] dark:text-[#9eb5af]">
              {phase === "phone" ? t("phoneDescription") : t("otpDescription")}
            </DialogDescription>
          </div>
        </div>

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#24302c]"
            aria-label={t("close")}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </DialogClose>
      </div>

      {phase === "phone" ? (
        <div className="mt-4 space-y-4">
          <CreateContractSaudiMobileField
            label={t("mobileLabel")}
            placeholder="05XXXXXXXX"
            value={mobile}
            onChange={(next) => {
              setMobile(next);
              if (showMobileError) {
                setShowMobileError(false);
              }
            }}
            errorMessage={showMobileError ? t("mobileInvalid") : undefined}
            valid={mobileValid}
          />

          <p className="flex items-start gap-2 text-xs leading-5 text-[#7f7f7f] dark:text-[#9eb5af]">
            <FaWhatsapp
              className="mt-0.5 size-3.5 shrink-0 text-[#25d366]"
              aria-hidden="true"
            />
            <span>{t("mobileHint")}</span>
          </p>

          <Button
            type="button"
            onClick={() => void handleSendCode()}
            disabled={busy}
            className="group h-12 w-full gap-2 rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90 dark:bg-[#0f6b5c]"
          >
            {isSending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowUpLeft className="size-5" aria-hidden="true" />
            )}
            {t("sendCode")}
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-brand-secondary/10 px-4 py-3 text-sm">
            <p className="text-[#7f7f7f] dark:text-[#9eb5af]">
              {tLogin("codeSentTo")}
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span dir="ltr" className="font-bold text-foreground">
                {formatPhoneDisplay(mobile)}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => setPhase("phone")}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand underline underline-offset-2 dark:text-[#48c0b8]"
              >
                <Pencil className="size-3" aria-hidden="true" />
                {tLogin("changeNumber")}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-black dark:text-white">
              {tLogin("otpLabel")}
              <span className="text-red-500"> *</span>
            </p>
            <div dir="ltr" className="w-full">
              <InputOTP
                dir="ltr"
                maxLength={OTP_MAX_LENGTH}
                inputMode="numeric"
                value={code}
                onChange={(next) => setCode(digitsOnly(next))}
                onComplete={() => void handleVerify()}
                containerClassName="justify-center"
              >
                <InputOTPGroup
                  dir="ltr"
                  className="gap-2 border-0 shadow-none ring-0"
                >
                  {Array.from({ length: OTP_MAX_LENGTH }).map((_, index) => (
                    <VerifyOtpSlot
                      key={index}
                      index={index}
                      className="size-11"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-center text-[11px] text-[#9a9a9a] dark:text-[#9eb5af]">
              {t("otpLengthHint")}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => void handleVerify()}
            disabled={busy || !codeValid}
            className="h-12 w-full rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90 disabled:opacity-60 dark:bg-[#0f6b5c]"
          >
            {isVerifying ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : null}
            {t("verifyAndSubmit")}
          </Button>

          <p className="text-center text-sm text-[#7f7f7f] dark:text-[#9eb5af]">
            {timer.isExpired ? (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={busy}
                className="font-bold text-brand underline underline-offset-2 disabled:opacity-60 dark:text-[#48c0b8]"
              >
                {isSending ? tLogin("resending") : tLogin("resend")}
              </button>
            ) : (
              <span dir="ltr">
                {tLogin("resendIn")} {timer.formatted}
              </span>
            )}
          </p>
        </div>
      )}
    </DialogContent>
  );
}
