"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpLeft, Loader2, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlagImage } from "react-international-phone";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import VerifyOtpInput from "@/features/auth/components/verify-otp-input";
import { useOtpTimer } from "@/features/auth/hooks/use-otp-timer";
import {
  createVerifyOtpSchema,
  type VerifyOtpFormValues,
} from "@/features/auth/schemas/verify-otp-schema";
import { requestPhoneOtp } from "@/features/auth/services/request-phone-otp";
import { verifyPhoneOtp } from "@/features/auth/services/verify-phone-otp";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { formatPhoneDisplay } from "@/features/auth/utils/format-phone-display";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import { getSafeCallbackUrl } from "@/lib/auth/auth-routes";
import { cn } from "@/lib/utils";

type PhoneFormValues = { phone: string };

/**
 * Sign in with mobile + OTP — the same flow as the app. No password, no
 * separate registration: the backend creates the account on first use.
 */
export default function PhoneLoginForm() {
  const t = useTranslations("auth.phoneLogin");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [isResending, setIsResending] = useState(false);
  const timer = useOtpTimer(59);

  const phoneSchema = z.object({
    phone: z
      .string()
      .min(1, t("validation.phoneRequired"))
      .refine((value) => getSaudiNationalMobile(value) !== null, t("validation.phoneInvalid")),
  });
  const otpSchema = createVerifyOtpSchema({
    otpRequired: t("validation.otpRequired"),
    otpInvalid: t("validation.otpInvalid"),
  });

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });
  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function sendCode(value: string) {
    const response = await requestPhoneOtp(value);
    if (!response.ok) {
      toast.error(
        response.status === 429 ? t("tooManyRequests") : response.error || t("sendError"),
      );
      return false;
    }
    return true;
  }

  async function onSubmitPhone(values: PhoneFormValues) {
    const sent = await sendCode(values.phone);
    if (!sent) {
      return;
    }

    setPhone(values.phone);
    otpForm.reset({ otp: "" });
    timer.reset();
    setPhase("otp");
    toast.success(t("sendSuccess"));
  }

  async function onSubmitOtp(values: VerifyOtpFormValues) {
    const response = await verifyPhoneOtp({ phone, code: values.otp });
    if (!response.ok) {
      toast.error(response.error || t("verifyError"));
      otpForm.setValue("otp", "");
      return;
    }

    setUser(response.user);
    toast.success(t("verifySuccess"));
    router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
    router.refresh();
  }

  async function handleResend() {
    if (!timer.isExpired || isResending) {
      return;
    }
    setIsResending(true);
    const sent = await sendCode(phone);
    setIsResending(false);
    if (sent) {
      timer.reset();
      toast.success(t("sendSuccess"));
    }
  }

  if (phase === "otp") {
    return (
      <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-5" noValidate>
        <div className="rounded-2xl bg-brand-secondary/10 px-4 py-3 text-sm">
          <p className="text-muted-foreground">{t("codeSentTo")}</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span dir="ltr" className="font-bold text-foreground">
              {formatPhoneDisplay(phone)}
            </span>
            <button
              type="button"
              onClick={() => setPhase("phone")}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand underline underline-offset-2"
            >
              <Pencil className="size-3" aria-hidden="true" />
              {t("changeNumber")}
            </button>
          </div>
        </div>

        <VerifyOtpInput control={otpForm.control} label={t("otpLabel")} />

        <Button
          type="submit"
          disabled={otpForm.formState.isSubmitting}
          className="h-12 w-full rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90"
        >
          {otpForm.formState.isSubmitting ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : null}
          {t("verify")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {timer.isExpired ? (
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={isResending}
              className="font-bold text-brand underline underline-offset-2 disabled:opacity-60"
            >
              {isResending ? t("resending") : t("resend")}
            </button>
          ) : (
            <span dir="ltr">
              {t("resendIn")} {timer.formatted}
            </span>
          )}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-5" noValidate>
      <Controller
        name="phone"
        control={phoneForm.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="login-phone">
              {t("phoneLabel")}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <div
              dir="ltr"
              className={cn(
                "flex h-14 items-center overflow-hidden rounded-lg border bg-white focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/30 dark:bg-[#121a18]",
                fieldState.invalid ? "border-destructive" : "border-[#d6d6d6] dark:border-[#2f403b]",
              )}
            >
              <div className="flex h-full shrink-0 items-center gap-2 border-e border-[#d6d6d6] px-3 dark:border-[#2f403b]">
                <FlagImage iso2="sa" size="22px" aria-hidden="true" />
                <span className="text-sm font-semibold text-muted-foreground">+966</span>
              </div>
              <input
                id="login-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                autoFocus
                placeholder={t("phonePlaceholder")}
                className="h-full flex-1 bg-transparent px-4 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground/70 md:text-sm"
                {...field}
              />
            </div>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )}
      />

      <p className="text-xs leading-relaxed text-muted-foreground">{t("hint")}</p>

      <Button
        type="submit"
        disabled={phoneForm.formState.isSubmitting}
        className="group h-12 w-full gap-2 rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90"
      >
        {phoneForm.formState.isSubmitting ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowUpLeft className="size-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
        )}
        {t("sendCode")}
      </Button>
    </form>
  );
}
