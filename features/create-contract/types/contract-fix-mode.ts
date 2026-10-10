import type { CreateContractStep } from "@/features/create-contract/types/create-contract-step";
import type { PropertyContractType } from "@/features/create-property/utils/contract-type";

/**
 * دفعة هـ (E4) — وضع التصحيح: الموظف طلب مرفقاً/تصحيحاً، والعميل يفتح المعالج
 * على الخطوة المطلوبة فقط (مُعبّأة من الخادم)، يعدّلها ويرسلها عبر نقطة الخطوة
 * نفسها (`POST /contract/stepN`) بلا إعادة تعبئة ولا إعادة دفع.
 */
export type ContractFixModeState = {
  requestId: number;
  orderUuid: string;
  contractId: number;
  contractType: PropertyContractType;
  /** خطوات الخادم المفتوحة للتعديل (من `pending_data_requests[].steps`). */
  steps: number[];
  /** الخطوة التي يفتح عليها المعالج (الخادم يحدّدها). */
  step: number;
  wizardStep: CreateContractStep;
  sectionLabel: string;
  items: string[];
  note: string | null;
  banner: string;
  /** `true` عندما تعذّر جلب بيانات الخطوة كاملة من الخادم (تعبئة جزئية فقط). */
  partialPrefill: boolean;
};

/** خطوة الخادم ← خطوة المعالج (الصك+العنوان شاشة واحدة، المستأجر+الوحدات شاشة واحدة). */
export function fixWizardStepFor(step: number): CreateContractStep {
  if (step <= 2) return "deed";
  if (step === 3) return "owner";
  if (step === 4 || step === 5) return "tenant";
  return "finance";
}

/** الخطوات الخلفية التي تُرسل عند إكمال شاشة المعالج في وضع التصحيح (المطلوبة فقط). */
export function backendStepsForWizardStep(wizardStep: CreateContractStep, allowed: number[]): number[] {
  const owned: Record<string, number[]> = {
    deed: [1, 2],
    owner: [3],
    tenant: [4, 5],
    finance: [6],
  };
  const candidates = owned[wizardStep] ?? [];
  return candidates.filter((step) => allowed.includes(step));
}
