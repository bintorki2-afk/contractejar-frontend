"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, LoaderCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import CreateContractDeedStep from "@/features/create-contract/components/create-contract-deed-step";
import CreateContractFinanceStep from "@/features/create-contract/components/create-contract-finance-step";
import CreateContractHeader from "@/features/create-contract/components/create-contract-header";
import CreateContractOtpLoginDialog from "@/features/create-contract/components/create-contract-otp-login-dialog";
import CreateContractOwnerStep from "@/features/create-contract/components/create-contract-owner-step";
import CreateContractTenantStep from "@/features/create-contract/components/create-contract-tenant-step";
import { loadContractForFix } from "@/features/create-contract/services/load-contract-for-fix";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractStepFixPayload } from "@/features/create-contract/types/contract-fix-api";
import {
  backendStepsForWizardStep,
  fixWizardStepFor,
  type ContractFixModeState,
} from "@/features/create-contract/types/contract-fix-mode";
import type { ContractTypeId } from "@/features/create-contract/types/contract-type";
import type { CreateContractLabels } from "@/features/create-contract/types/create-contract-labels";
import { STEP_SYNCERS } from "@/features/create-contract/utils/sync-contract-steps";
import { track } from "@/lib/analytics/track";

export type CreateContractFixParams = {
  requestId: number;
  orderUuid: string;
  contractId: number;
  /** الخطوة من الرابط (`?step=`) — الخادم يبقى المرجع عند الاختلاف. */
  step: number | null;
};

const DRAFT_STORAGE_KEY = "aqdi-create-contract-draft";
const DRAFT_BACKUP_KEY = "aqdi-create-contract-draft:before-fix";

/** تُحفظ مسودة الطلب الجديد (إن وُجدت) قبل تحميل طلب التصحيح، وتُعاد عند الخروج. */
function backupDraftBeforeFix() {
  try {
    const current = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (current && !window.localStorage.getItem(DRAFT_BACKUP_KEY)) {
      const parsed = JSON.parse(current)?.state;
      // Only a real in-progress draft is worth keeping (not an empty intro or a previous fix).
      if (parsed && parsed.currentStep && parsed.currentStep !== "intro" && !parsed.fixMode) {
        window.localStorage.setItem(DRAFT_BACKUP_KEY, current);
      }
    }
  } catch {
    // Storage unavailable: nothing to back up.
  }
}

function restoreDraftAfterFix() {
  const store = useCreateContractDraftStore;
  store.getState().setFixMode(null);
  store.getState().resetDraft();
  try {
    const backup = window.localStorage.getItem(DRAFT_BACKUP_KEY);
    window.localStorage.removeItem(DRAFT_BACKUP_KEY);
    if (backup) {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, backup);
      void store.persist.rehydrate();
    }
  } catch {
    // Storage unavailable: the reset above is enough.
  }
}

type FixPhase = "loading" | "login" | "ready" | "done" | "error";

type CreateContractFixModeProps = {
  labels: CreateContractLabels;
  contractType: ContractTypeId;
  fix: CreateContractFixParams;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
};

/**
 * دفعة هـ (E4) — وضع التصحيح: الموظف طلب مرفقاً/تصحيحاً (`pending_data_requests`)،
 * والعميل يصل من «مطلوب منك» أو من الرابط العميق `/r/{order}?fix=`. يُحمَّل الطلب
 * من الخادم، تُفتح الخطوة المطلوبة فقط، وعند «متابعة» تُرسل تلك الخطوة عبر نقطة
 * الخطوة نفسها — بلا إعادة تعبئة للمعالج ولا إعادة دفع — ثم «تم الإرسال —
 * سيراجعها الموظف». الخادم يحلّ الطلب تلقائياً عند تغيّر الحقول المطلوبة.
 */
export default function CreateContractFixMode({
  labels,
  contractType,
  fix,
  isDarkMode = false,
  onToggleDarkMode,
}: CreateContractFixModeProps) {
  const router = useRouter();
  const fixMode = useCreateContractDraftStore((state) => state.fixMode);
  const [phase, setPhase] = useState<FixPhase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; resolved: boolean } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const loadedKey = useRef<string | null>(null);
  const trackHref = `/r/${encodeURIComponent(fix.orderUuid)}`;

  const pageTitle =
    contractType === "residential" ? labels.pageTitleResidential : labels.pageTitleCommercial;

  async function load() {
    setPhase("loading");
    setError(null);
    const loaded = await loadContractForFix({
      orderUuid: fix.orderUuid,
      contractId: fix.contractId,
      requestId: fix.requestId,
    });

    if (!loaded.ok) {
      if (loaded.needsLogin) {
        setPhase("login");
        return;
      }
      setError(loaded.error);
      setPhase(loaded.alreadyResolved ? "done" : "error");
      if (loaded.alreadyResolved) {
        setResult({ message: loaded.error, resolved: true });
      }
      return;
    }

    const store = useCreateContractDraftStore.getState();
    backupDraftBeforeFix();
    store.loadUncompletedContract(loaded.data);
    const step = loaded.request.step ?? fix.step ?? 1;
    const wizardStep = fixWizardStepFor(step);
    const next: ContractFixModeState = {
      requestId: loaded.request.id,
      orderUuid: fix.orderUuid,
      contractId: fix.contractId,
      contractType: loaded.contractType,
      steps: loaded.request.steps.length > 0 ? loaded.request.steps : [step],
      step,
      wizardStep,
      sectionLabel: loaded.request.section_label,
      items: loaded.request.items.map((item) => item.label),
      note: loaded.request.note,
      banner: loaded.request.banner,
      partialPrefill: loaded.partial,
    };
    store.setFixMode(next);
    store.setCurrentStep(wizardStep);
    setPhase("ready");
  }

  useEffect(() => {
    const key = `${fix.orderUuid}:${fix.requestId}`;
    if (loadedKey.current === key) {
      return;
    }
    loadedKey.current = key;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fix.orderUuid, fix.requestId]);

  function exitToTracking() {
    restoreDraftAfterFix();
    router.push(trackHref);
  }

  async function submitFix() {
    if (isSubmitting || !fixMode) {
      return;
    }
    setIsSubmitting(true);
    try {
      const store = useCreateContractDraftStore.getState();
      const steps = backendStepsForWizardStep(fixMode.wizardStep, fixMode.steps);
      if (steps.length === 0) {
        toast.error("هذه الخطوة غير مفتوحة للتعديل. تواصل معنا إن احتجت تعديلاً آخر.");
        return;
      }

      const fixes: ContractStepFixPayload[] = [];
      let sentAnything = false;
      let failure: string | null = null;
      for (const step of steps) {
        const outcome = await STEP_SYNCERS[step](store, fixMode.contractId, { fixMode: true });
        if (!outcome.ok) {
          if (outcome.status === 401 || outcome.status === 403 || outcome.status === 404) {
            setLoginOpen(true);
            return;
          }
          failure = outcome.error || "تعذّر إرسال التعديل. حاول مرة أخرى.";
          break;
        }
        if (!outcome.skipped) {
          sentAnything = true;
          if (outcome.fix) fixes.push(outcome.fix);
        }
      }

      const changed = fixes.some((payload) => payload.changed_fields.length > 0);
      const resolved = fixes.some((payload) => payload.resolved_request_ids.includes(fixMode.requestId));

      if (failure && !resolved) {
        toast.error(failure);
        return;
      }
      if (failure) {
        // The requested item already reached the server; only a later step failed.
        toast.warning(failure);
      }
      if (!sentAnything || (!changed && !resolved)) {
        toast.warning("لم يتغيّر شيء — ارفع المرفق المطلوب أو عدّل البيانات ثم اضغط متابعة.");
        return;
      }

      track("data_request_completed", {
        order_number: fixMode.orderUuid,
        request_id: fixMode.requestId,
        section: fixMode.sectionLabel,
        step: fixMode.step,
        resolved,
      });

      const message =
        fixes.find((payload) => payload.message)?.message ?? "تم الإرسال — سيراجعها الموظف.";
      setResult({ message, resolved });
      setPhase("done");
      restoreDraftAfterFix();
    } finally {
      setIsSubmitting(false);
    }
  }

  const ready = phase === "ready" && fixMode !== null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-2">
      <CreateContractHeader
        pageTitle={pageTitle}
        labels={labels.header}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode ?? (() => undefined)}
      />

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:border dark:border-[#2f403b] dark:bg-[#1a2421]">
        <div className="space-y-4 p-5 md:p-6" data-testid="fix-mode">
          {phase === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#8a8a8a]" aria-busy="true">
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              جاري تحميل بيانات الطلب…
            </div>
          ) : null}

          {phase === "login" ? (
            <div className="space-y-4 rounded-2xl bg-amber-50 p-5 text-center dark:bg-amber-950/30">
              <LogIn className="mx-auto size-8 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <p className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                سجّل دخولك برقم جوال الطلب لإرسال المطلوب
              </p>
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                هذا الطلب مرتبط برقم جوال محدد. أدخل الرقم وسيصلك رمز تحقق، ثم تفتح الخطوة المطلوبة مباشرة.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  onClick={() => setLoginOpen(true)}
                  className="h-11 rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand/90"
                >
                  تسجيل الدخول بالجوال
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-6 text-sm font-bold">
                  <Link href={trackHref}>العودة لتتبّع الطلب</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "error" ? (
            <div className="space-y-3 rounded-2xl bg-red-50 p-5 text-center dark:bg-red-950/30">
              <p className="text-sm font-bold text-red-700 dark:text-red-200">{error}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={() => void load()} className="h-11 rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand/90">
                  إعادة المحاولة
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-6 text-sm font-bold">
                  <Link href={trackHref}>العودة لتتبّع الطلب</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {phase === "done" && result ? (
            <div className="space-y-4 py-6 text-center" data-testid="fix-done">
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-background-green text-brand dark:bg-[#12302a] dark:text-[#48c0b8]">
                <CheckCircle2 className="size-9" aria-hidden="true" />
              </span>
              <p className="text-xl font-extrabold text-brand dark:text-[#48c0b8]">{result.message}</p>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[#6f6f6f] dark:text-[#9eb5af]">
                {result.resolved
                  ? "وصلتنا بياناتك وأُغلق طلب المرفق الناقص. سيكمل موظفنا توثيق العقد ويصلك إشعار بكل خطوة."
                  : "وصلتنا بياناتك. إن بقي شيء مطلوباً ستجده في صفحة تتبّع الطلب."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild className="h-11 rounded-full bg-brand px-6 text-sm font-bold text-white hover:bg-brand/90">
                  <Link href={trackHref}>تتبّع الطلب</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-6 text-sm font-bold">
                  <Link href="/">الرئيسية</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {ready && fixMode ? (
            <>
              <div
                role="alert"
                data-testid="fix-banner"
                className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-extrabold leading-relaxed text-amber-900 dark:text-amber-200">
                      {fixMode.banner}
                    </p>
                    <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300">
                      الطلب رقم {fixMode.orderUuid} · {fixMode.sectionLabel}. عدّل المطلوب في هذه الخطوة فقط ثم اضغط «متابعة» — لا حاجة لإعادة تعبئة الطلب أو الدفع.
                    </p>
                    {fixMode.partialPrefill ? (
                      <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300">
                        تعذّر جلب كل بيانات هذه الخطوة؛ أكمل الحقول الفارغة إن وُجدت.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="relative">
                {isSubmitting ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-[#1a2421]/70" aria-busy="true">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand shadow dark:bg-[#1a2421]">
                      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                      جاري الإرسال…
                    </span>
                  </div>
                ) : null}

                {fixMode.wizardStep === "deed" ? (
                  <CreateContractDeedStep labels={labels.deed} onBack={exitToTracking} onComplete={() => void submitFix()} />
                ) : null}
                {fixMode.wizardStep === "owner" ? (
                  <CreateContractOwnerStep labels={labels.owner} onBack={exitToTracking} onComplete={() => void submitFix()} />
                ) : null}
                {fixMode.wizardStep === "tenant" ? (
                  <CreateContractTenantStep
                    labels={labels.tenant}
                    contractType={contractType}
                    onBack={exitToTracking}
                    onComplete={() => void submitFix()}
                  />
                ) : null}
                {fixMode.wizardStep === "finance" ? (
                  <CreateContractFinanceStep
                    labels={labels.finance}
                    summaryLabels={labels.payment.summary}
                    contractType={contractType}
                    onBack={exitToTracking}
                    onComplete={() => void submitFix()}
                  />
                ) : null}
              </div>

              <button
                type="button"
                onClick={exitToTracking}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8a8a8a] underline-offset-2 hover:underline dark:text-[#9eb5af]"
              >
                <ArrowRight className="size-3.5" aria-hidden="true" />
                إلغاء والعودة لتتبّع الطلب
              </button>
            </>
          ) : null}
        </div>
      </div>

      <CreateContractOtpLoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onVerified={() => {
          setLoginOpen(false);
          loadedKey.current = null;
          void load();
        }}
      />
    </div>
  );
}
