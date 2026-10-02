"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpLeft, Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AuthEmailField from "@/features/auth/components/auth-email-field";
import ForgotPasswordFooter from "@/features/auth/components/forgot-password-footer";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password-schema";
import { requestForgotPassword } from "@/features/auth/services/request-forgot-password";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [sent, setSent] = useState(false);

  const schema = createForgotPasswordSchema({
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ForgotPasswordFormValues) {
    const response = await requestForgotPassword(values);

    if (!response.ok) {
      toast.error(response.error || t("submitError"));
      return;
    }

    toast.success(response.message || t("submitSuccess"));
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-brand-background-green/60 px-6 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white">
            <MailCheck className="size-7" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-extrabold text-brand">{t("sentTitle")}</h2>
          <p className="text-sm leading-6 text-[#5b5b5b]">{t("sentHint")}</p>
        </div>

        <ForgotPasswordFooter
          orLabel={t("or")}
          rememberedPassword={t("rememberedPassword")}
          backToLogin={t("backToLogin")}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <AuthEmailField
        control={form.control}
        name="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="group h-12 w-full rounded-full bg-brand text-base font-semibold text-white hover:bg-brand/90"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <>
            {t("submit")}
            <ArrowUpLeft
              className="size-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0"
              aria-hidden="true"
            />
          </>
        )}
      </Button>

      <ForgotPasswordFooter
        orLabel={t("or")}
        rememberedPassword={t("rememberedPassword")}
        backToLogin={t("backToLogin")}
      />
    </form>
  );
}
