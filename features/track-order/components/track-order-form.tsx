"use client";

import { CheckCircle2, Clock, CreditCard, LoaderCircle, Search } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSaudiNationalMobile } from "@/features/auth/utils/normalize-saudi-phone";
import {
  trackOrder,
  type TrackedOrder,
} from "@/features/guest-session/services/track-order";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<number, string> = {
  1: "الصك",
  2: "العنوان الوطني",
  3: "بيانات المالك",
  4: "بيانات المستأجر",
  5: "الوحدة",
  6: "البيانات المالية",
  7: "الدفع",
};

function toAsciiDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (d) => String("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(d) % 10));
}

type TrackOrderFormProps = {
  /** Prefilled from a smart link (`/r/{order}`). */
  initialOrder?: string;
  /** Focus the mobile field right away (the order number is already known). */
  autoSubmitWhenReady?: boolean;
};

export default function TrackOrderForm({
  initialOrder = "",
  autoSubmitWhenReady = false,
}: TrackOrderFormProps) {
  const t = useTranslations("trackPage");
  const [order, setOrder] = useState(initialOrder);
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackedOrder | null>(null);

  const orderDigits = toAsciiDigits(order).replace(/\D/g, "");
  const mobileValid = getSaudiNationalMobile(mobile) !== null;
  const canSubmit = orderDigits.length >= 4 && mobileValid && !isLoading;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError(t("validation"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await trackOrder({
      order: orderDigits,
      mobile: toAsciiDigits(mobile).replace(/\D/g, ""),
    });

    setIsLoading(false);

    if (!response.ok) {
      setError(response.notFound ? t("notFound") : t("failed"));
      return;
    }

    setResult(response.order);
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm md:p-7 dark:border-[#2f403b] dark:bg-[#1a2421]"
      >
        <div className="space-y-2">
          <Label htmlFor="track-order">{t("orderLabel")}</Label>
          <Input
            id="track-order"
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("orderPlaceholder")}
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            dir="ltr"
            className="h-12 text-start"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="track-mobile">{t("mobileLabel")}</Label>
          <Input
            id="track-mobile"
            inputMode="tel"
            autoComplete="tel"
            placeholder="05XXXXXXXX"
            autoFocus={autoSubmitWhenReady && initialOrder !== ""}
            value={mobile}
            onChange={(event) => setMobile(event.target.value)}
            dir="ltr"
            className="h-12 text-start"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("mobileHint")}
          </p>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-semibold text-red-600">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-full bg-brand text-base font-bold text-white hover:bg-brand/90"
        >
          {isLoading ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-5" aria-hidden="true" />
          )}
          {isLoading ? t("searching") : t("submit")}
        </Button>
      </form>

      {result ? (
        <section
          aria-live="polite"
          className="space-y-5 rounded-3xl border bg-white p-5 shadow-sm md:p-7 dark:border-[#2f403b] dark:bg-[#1a2421]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground">{t("orderNumber")}</p>
              <p className="text-2xl font-extrabold tracking-wide text-brand" dir="ltr">
                {result.order_number}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.contract_type === "commercial" ? t("typeCommercial") : t("typeHousing")}
                {result.name_real_estate ? ` · ${result.name_real_estate}` : ""}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white"
              style={{ backgroundColor: result.status_color || "#0B5A3C" }}
            >
              {result.is_paid ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : (
                <Clock className="size-4" aria-hidden="true" />
              )}
              {result.status_label}
            </span>
          </div>

          {result.status_client_explanation ? (
            <p className="rounded-2xl bg-brand-secondary/10 px-4 py-3 text-sm leading-relaxed">
              {result.status_client_explanation}
            </p>
          ) : null}

          {result.awaiting_payment && result.payment_url ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {t("awaitingPaymentTitle")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                {t("awaitingPaymentBody")}
              </p>
              <Button
                asChild
                className="mt-3 h-11 w-full rounded-full bg-brand text-sm font-bold text-white hover:bg-brand/90"
              >
                <Link href={result.payment_url}>
                  <CreditCard className="size-4" aria-hidden="true" />
                  {t("payNow")}
                </Link>
              </Button>
            </div>
          ) : null}

          {!result.is_paid && result.step < 7 ? (
            <p className="text-sm text-muted-foreground">
              {t("nextStep", { step: STEP_LABELS[result.step] ?? String(result.step) })}
            </p>
          ) : null}

          {result.timeline.length > 0 ? (
            <ol className="space-y-3 border-s-2 border-brand/20 ps-4">
              {result.timeline.map((item, index) => {
                const isLast = index === result.timeline.length - 1;
                return (
                  <li key={`${item.status_label}-${index}`} className="relative">
                    <span
                      className={cn(
                        "absolute -start-[1.3rem] top-1 size-3 rounded-full border-2 border-white",
                        isLast ? "bg-brand" : "bg-brand/30",
                      )}
                      aria-hidden="true"
                    />
                    <p className={cn("text-sm", isLast ? "font-bold text-brand" : "text-muted-foreground")}>
                      {item.status_label}
                    </p>
                    {item.at ? (
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {new Date(item.at).toLocaleString("ar-SA-u-nu-latn", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {t("lastUpdate", { date: result.updated_at ?? "—" })}
          </p>
        </section>
      ) : null}
    </div>
  );
}
