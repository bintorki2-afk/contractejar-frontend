import { getTenantRoles } from "@/features/create-contract/services/get-tenant-roles";
import { submitContractStep1 } from "@/features/create-contract/services/submit-contract-step1";
import { submitContractStep2 } from "@/features/create-contract/services/submit-contract-step2";
import { submitContractStep3 } from "@/features/create-contract/services/submit-contract-step3";
import { submitContractStep4 } from "@/features/create-contract/services/submit-contract-step4";
import { submitContractStep5 } from "@/features/create-contract/services/submit-contract-step5";
import { submitContractStep6 } from "@/features/create-contract/services/submit-contract-step6";
import { useCreateContractDraftStore } from "@/features/create-contract/stores/use-create-contract-draft-store";
import type { ContractStepFixPayload } from "@/features/create-contract/types/contract-fix-api";
import {
  deedTypeIsDeceasedOwner,
  deedTypeIsWaqfOwner,
} from "@/features/create-contract/types/deed-type";
import { deedTypeSupportsManualEntry } from "@/features/shared/utils/supports-manual-deed-entry";
import type { ContractStep3RepresentativeMode } from "@/features/create-contract/utils/build-contract-step3-form-data";
import { isLeaseRenewalContract } from "@/features/create-contract/utils/is-lease-renewal-contract";
import { isOwnerStepSkipped } from "@/features/create-contract/utils/is-owner-step-skipped";
import { isSubleaseContract } from "@/features/create-contract/utils/is-sublease-contract";
import { mapDeedTypeToInstrumentType } from "@/features/create-contract/utils/map-deed-type-to-instrument-type";
import { isManualDeedEntryComplete } from "@/features/shared/types/manual-deed-entry";
import { persistedToFiles, type PersistedFile } from "@/lib/storage/persisted-files";
import { MAX_SERVER_ACTION_UPLOAD_BYTES, totalBytes } from "@/lib/files/compress-image";

/**
 * إرسال خطوة واحدة من المسودة المحلية إلى الخادم (step1..6) — مشترك بين إرسال
 * الطلب كاملاً (`useSyncContractToServer`) ووضع التصحيح (دفعة هـ E4) الذي يرسل
 * الخطوة المطلوبة فقط على طلب مدفوع.
 */

// One step's attachments travel in one request (Vercel: 4.5 MB max) — say so
// clearly instead of a failure the customer cannot act on.
export const STEP_UPLOAD_TOO_LARGE =
  "حجم مرفقات هذه الخطوة أكبر من 4 ميجابايت مجتمعة. صوّر المستندات بدقة أقل أو أرسل ملفات PDF أصغر، ثم أعد الإرسال.";

export type SyncContractStage =
  | "session"
  | "start"
  | "deed"
  | "address"
  | "owner"
  | "tenant"
  | "units"
  | "finance"
  | "contact";

export type StepSyncResult =
  | { ok: true; skipped: false; fix: ContractStepFixPayload | null }
  /** Nothing to send for this step (e.g. sublease has no address). */
  | { ok: true; skipped: true; fix: null }
  | { ok: false; stage: SyncContractStage; error: string; status: number };

type DraftState = ReturnType<typeof useCreateContractDraftStore.getState>;

function firstFile(files: File[], persisted: PersistedFile[]): File | undefined {
  if (files.length > 0 && files[0] instanceof File) {
    return files[0];
  }

  return persistedToFiles(persisted)[0];
}

function allFiles(files: File[], persisted: PersistedFile[]): File[] {
  if (files.length > 0 && files[0] instanceof File) {
    return files;
  }

  return persistedToFiles(persisted);
}

/** الصك (step1). */
export async function syncDeedStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  const { deed } = store;
  const deedType = deed.selectedDeedType;
  if (deedType === "") {
    return { ok: false, stage: "deed", error: "missing deed type", status: 400 };
  }

  const isDeceased = deedTypeIsDeceasedOwner(deedType);
  const isWaqf = deedTypeIsWaqfOwner(deedType);
  const deedPages = allFiles(deed.deedFiles, deed.deedPersistedFiles);
  const useManual =
    deed.useManualDeedEntry &&
    deedTypeSupportsManualEntry(deedType) &&
    isManualDeedEntryComplete(deed.manualDeedEntry);

  const step1Files = [
    ...deedPages,
    firstFile(deed.deedFrontFiles, deed.deedFrontPersistedFiles),
    firstFile(deed.deedBackFiles, deed.deedBackPersistedFiles),
    isDeceased ? firstFile(deed.deedInheritanceFiles, deed.deedInheritancePersistedFiles) : undefined,
    isDeceased ? firstFile(deed.deedHeirsPoaFiles, deed.deedHeirsPoaPersistedFiles) : undefined,
    isWaqf ? firstFile(deed.deedEndowmentCertFiles, deed.deedEndowmentCertPersistedFiles) : undefined,
    isWaqf ? firstFile(deed.deedTrusteeshipFiles, deed.deedTrusteeshipPersistedFiles) : undefined,
    (isDeceased && deed.hasMinorHeirs) || (isWaqf && deed.isMultipleTrusteeshipDeedCopy)
      ? firstFile(deed.deedGuardiansPoaFiles, deed.deedGuardiansPoaPersistedFiles)
      : undefined,
  ];
  if (totalBytes(step1Files) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
    return { ok: false, stage: "deed", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
  }

  const step1 = await submitContractStep1({
    contractId,
    instrumentType: mapDeedTypeToInstrumentType(deedType),
    imageInstrument: deedPages[0],
    imageInstrumentPages: deedPages.length > 1 ? deedPages.slice(1) : undefined,
    imageInstrumentFront: firstFile(deed.deedFrontFiles, deed.deedFrontPersistedFiles),
    imageInstrumentBack: firstFile(deed.deedBackFiles, deed.deedBackPersistedFiles),
    imageInheritanceCertificate: isDeceased
      ? firstFile(deed.deedInheritanceFiles, deed.deedInheritancePersistedFiles)
      : undefined,
    copyPowerOfAttorneyFromHeirsToAgent: isDeceased
      ? firstFile(deed.deedHeirsPoaFiles, deed.deedHeirsPoaPersistedFiles)
      : undefined,
    copyOfTheEndowmentRegistrationCertificate: isWaqf
      ? firstFile(deed.deedEndowmentCertFiles, deed.deedEndowmentCertPersistedFiles)
      : undefined,
    copyOfTheTrusteeshipDeed: isWaqf
      ? firstFile(deed.deedTrusteeshipFiles, deed.deedTrusteeshipPersistedFiles)
      : undefined,
    isMultipleTrusteeshipDeedCopy: isWaqf ? deed.isMultipleTrusteeshipDeedCopy : undefined,
    copyOfGuardiansPowerOfAttorneyForAgent:
      (isDeceased && deed.hasMinorHeirs) || (isWaqf && deed.isMultipleTrusteeshipDeedCopy)
        ? firstFile(deed.deedGuardiansPoaFiles, deed.deedGuardiansPoaPersistedFiles)
        : undefined,
    manualDeedEntry: useManual ? deed.manualDeedEntry : undefined,
  });
  if (!step1.ok) {
    return { ok: false, stage: "deed", error: step1.error, status: step1.status };
  }
  store.setContractStep1Data(step1.data);
  return { ok: true, skipped: false, fix: step1.fix ?? null };
}

/** العنوان الوطني (step2) — لا يُرسل للباطن، ولا عند تجديد عقد بنفس العنوان. */
export async function syncAddressStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  const { deed } = store;
  const deedType = deed.selectedDeedType;
  if (deedType === "") {
    return { ok: false, stage: "address", error: "missing deed type", status: 400 };
  }
  const skipState = { selectedDeedType: deedType };
  const sendAddress =
    !isSubleaseContract(skipState) &&
    !(isLeaseRenewalContract(skipState) && deed.leaseRenewalAddressMode === "same") &&
    deed.nationalAddressMethod !== "";

  if (!sendAddress || deed.nationalAddressMethod === "") {
    return { ok: true, skipped: true, fix: null };
  }

  const step2 = await submitContractStep2({
    contractId,
    addressMethod: deed.nationalAddressMethod,
    latitude: deed.mapLocation.lat,
    longitude: deed.mapLocation.lng,
    imageAddress: firstFile(deed.nationalAddressPhotoFiles, deed.nationalAddressPhotoPersistedFiles),
    addressUrl: deed.nationalAddressLinkUrl.trim() || undefined,
    manualAddress: deed.nationalAddressManual,
  });
  if (!step2.ok) {
    return { ok: false, stage: "address", error: step2.error, status: step2.status };
  }
  store.setContractStep2Data(step2.data);
  return { ok: true, skipped: false, fix: step2.fix ?? null };
}

/** المالك / الممثل (step3) — يُتخطّى لتجديد العقد والباطن. */
export async function syncOwnerStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  const { deed, owner } = store;
  const deedType = deed.selectedDeedType;
  if (deedType === "") {
    return { ok: false, stage: "owner", error: "missing deed type", status: 400 };
  }
  if (isOwnerStepSkipped({ selectedDeedType: deedType })) {
    return { ok: true, skipped: true, fix: null };
  }

  const representativeMode: ContractStep3RepresentativeMode = deedTypeIsDeceasedOwner(deedType)
    ? "deceased"
    : deedTypeIsWaqfOwner(deedType)
      ? "waqf"
      : null;
  const agentFiles = allFiles(owner.agentData.powerOfAttorneyFiles, owner.agentPersistedFiles);
  if (totalBytes(agentFiles) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
    return { ok: false, stage: "owner", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
  }
  const step3 = await submitContractStep3({
    contractId,
    ownerData: owner.ownerData,
    agentData: { ...owner.agentData, powerOfAttorneyFiles: agentFiles },
    representativeMode,
  });
  if (!step3.ok) {
    return { ok: false, stage: "owner", error: step3.error, status: step3.status };
  }
  store.setContractStep3Data(step3.data);
  return { ok: true, skipped: false, fix: step3.fix ?? null };
}

/** المستأجر (step4). */
export async function syncTenantStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  const { deed, tenant } = store;
  const isLeaseRenewal = isLeaseRenewalContract({ selectedDeedType: deed.selectedDeedType });
  const tenantData = tenant.tenantData;
  const tenantOrgFiles = allFiles(
    tenantData.organization.powerOfAttorneyFiles,
    tenant.tenantPersistedFiles,
  );
  if (totalBytes(tenantOrgFiles) > MAX_SERVER_ACTION_UPLOAD_BYTES) {
    return { ok: false, stage: "tenant", error: STEP_UPLOAD_TOO_LARGE, status: 413 };
  }
  const step4 = await submitContractStep4({
    contractId,
    tenantData: {
      ...tenantData,
      organization: {
        ...tenantData.organization,
        powerOfAttorneyFiles: tenantOrgFiles,
      },
    },
    isLeaseRenewal,
    notes:
      isLeaseRenewal && tenant.leaseRenewalAddNotes
        ? tenant.leaseRenewalNotes.trim() || undefined
        : undefined,
  });
  if (!step4.ok) {
    return { ok: false, stage: "tenant", error: step4.error, status: step4.status };
  }
  store.setContractStep4Data(step4.data);
  return { ok: true, skipped: false, fix: step4.fix ?? null };
}

/** الوحدات (step5) — تجديد العقد بنفس الوحدة لا يرسل شيئاً. */
export async function syncUnitsStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  const { deed, tenant } = store;
  const isLeaseRenewal = isLeaseRenewalContract({ selectedDeedType: deed.selectedDeedType });
  const sendUnits =
    tenant.rentedUnits.length > 0 &&
    !(isLeaseRenewal && (tenant.leaseRenewalUnitMode ?? "same") === "same");
  if (!sendUnits) {
    return { ok: true, skipped: true, fix: null };
  }
  const step5 = await submitContractStep5({ contractId, rentedUnits: tenant.rentedUnits });
  if (!step5.ok) {
    return { ok: false, stage: "units", error: step5.error, status: step5.status };
  }
  store.setContractStep5Data(step5.data);
  return { ok: true, skipped: false, fix: step5.fix ?? null };
}

/** المالية (step6). */
export async function syncFinanceStep(store: DraftState, contractId: number): Promise<StepSyncResult> {
  let roles: Awaited<ReturnType<typeof getTenantRoles>> = [];
  try {
    roles = await getTenantRoles();
  } catch {
    // Roles are only needed to label deposit/fine; the ids still go through.
  }
  const step6 = await submitContractStep6({ contractId, financeData: store.financeData, roles });
  if (!step6.ok) {
    return { ok: false, stage: "finance", error: step6.error, status: step6.status };
  }
  store.setContractStep6Data(step6.data);
  return { ok: true, skipped: false, fix: step6.fix ?? null };
}

/** خطوة الخادم (1..6) → دالة الإرسال. */
export const STEP_SYNCERS: Record<number, (store: DraftState, contractId: number) => Promise<StepSyncResult>> = {
  1: syncDeedStep,
  2: syncAddressStep,
  3: syncOwnerStep,
  4: syncTenantStep,
  5: syncUnitsStep,
  6: syncFinanceStep,
};
