"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import AuthEmailField from "@/features/auth/components/auth-email-field";
import AuthOrDivider from "@/features/auth/components/auth-or-divider";
import AuthSocialButtons from "@/features/auth/components/auth-social-buttons";
import RegisterNameField from "@/features/auth/components/register-name-field";
import RegisterPasswordField from "@/features/auth/components/register-password-field";
import RegisterTermsField from "@/features/auth/components/register-terms-field";
import { registerUser } from "@/features/auth/services/register-user";
import {
  createRegisterSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register-schema";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const schema = createRegisterSchema({
    fullNameRequired: t("validation.fullNameRequired"),
    fullNameMin: t("validation.fullNameMin"),
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    passwordRequired: t("validation.passwordRequired"),
    passwordMin: t("validation.passwordMin"),
    termsRequired: t("validation.termsRequired"),
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    const response = await registerUser(values);

    if (!response.ok) {
      toast.error(response.error || t("submitError"));
      return;
    }

    // Backend signs the customer in and emails a confirmation link.
    setUser(response.user);
    toast.success(response.message || t("submitSuccess"));
    router.push("/");
  }
  const {isSubmitting} = form.formState;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <RegisterNameField
        control={form.control}
        label={t("fullNameLabel")}
        placeholder={t("fullNamePlaceholder")}
      />

      <AuthEmailField
        control={form.control}
        name="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
      />

      <RegisterPasswordField
        control={form.control}
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        toggleVisibilityLabel={t("togglePasswordVisibility")}
      />

      <RegisterTermsField
        control={form.control}
        prefix={t("terms.prefix")}
        termsLink={t("terms.termsLink")}
        andLabel={t("terms.and")}
        privacyLink={t("terms.privacyLink")}
        termsHref={t("terms.termsHref")}
        privacyHref={t("terms.privacyHref")}
      />

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
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

      <AuthOrDivider label={t("or")} />
      <AuthSocialButtons />
    </form>
  );
}
