"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import AuthEmailField from "@/features/auth/components/auth-email-field";
import AuthOrDivider from "@/features/auth/components/auth-or-divider";
import AuthSocialButtons from "@/features/auth/components/auth-social-buttons";
import LoginPasswordField from "@/features/auth/components/login-password-field";
import {
  createLoginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login-schema";
import { loginUser } from "@/features/auth/services/login-user";
import { useAuthStore } from "@/features/auth/stores/use-auth-store";
import { getSafeCallbackUrl } from "@/lib/auth/auth-routes";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const schema = createLoginSchema({
    emailRequired: t("validation.emailRequired"),
    emailInvalid: t("validation.emailInvalid"),
    passwordRequired: t("validation.passwordRequired"),
    passwordMin: t("validation.passwordMin"),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginFormValues) {
    const response = await loginUser(values);

    if (!response.ok) {
      toast.error(response.error || t("submitError"));
      return;
    }

    setUser(response.user);
    toast.success(response.message || t("submitSuccess"));
    router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <AuthEmailField
        control={form.control}
        name="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
      />

      <LoginPasswordField
        control={form.control}
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        toggleVisibilityLabel={t("togglePasswordVisibility")}
      />

      <div className="flex items-center justify-between gap-4">
        <Controller
          name="rememberMe"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid}
              className="w-auto items-center gap-2"
            >
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={fieldState.invalid}
                className="data-[state=checked]:bg-brand data-[state=checked]:text- bg-brand-background"
              />
              <FieldLabel htmlFor="rememberMe" className="font-normal">
                {t("rememberMe")}
              </FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Link
          href="/forgot-password"
          className="shrink-0 text-sm font-medium text-brand transition-colors hover:text-brand/80"
        >
          {t("forgotPassword")}
        </Link>
      </div>

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

      <AuthOrDivider label={t("or")} />
      <AuthSocialButtons />
    </form>
  );
}
