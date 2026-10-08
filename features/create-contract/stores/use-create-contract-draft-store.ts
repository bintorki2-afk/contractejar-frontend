"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  filesToPersisted,
  persistedToFiles,
  type PersistedFile,
} from "@/lib/storage/persisted-files";
import type { DeedTypeId } from "@/features/create-contract/types/deed-type";
import { deedTypeIsLeaseRenewal } from "@/features/create-contract/types/deed-type";
import type { LeaseRenewalAddressMode } from "@/features/create-contract/types/lease-renewal-address-mode";
import type { LeaseRenewalUnitMode } from "@/features/create-contract/types/lease-renewal-unit-mode";
import type { NationalAddressMethodId } from "@/features/create-contract/types/national-address";
import {
  DEFAULT_NATIONAL_ADDRESS_LOCATION,
  type NationalAddressMapLocation,
} from "@/features/create-contract/types/national-address";
import {
  EMPTY_MANUAL_NATIONAL_ADDRESS,
  type ManualNationalAddressData,
} from "@/features/shared/types/manual-national-address";
import {
  EMPTY_MANUAL_DEED_ENTRY,
  type ManualDeedEntryData,
} from "@/features/shared/types/manual-deed-entry";
import {
  createEmptyFinanceData,
  normalizeFinanceData,
  type FinanceDataState,
} from "@/features/create-contract/types/finance-step";
import {
  EMPTY_PAYMENT_DATA,
  type PaymentDataState,
} from "@/features/create-contract/types/payment-step";
import {
  EMPTY_AGENT_DATA,
  EMPTY_OWNER_DATA,
  type AgentDataState,
  type OwnerDataState,
} from "@/features/create-contract/types/owner-step";
import {
  EMPTY_RENTED_UNIT_DATA,
  type RentedUnitDataState,
} from "@/features/create-contract/types/rented-unit-step";
import {
  CREATE_CONTRACT_STEPS,
  type CreateContractStep,
} from "@/features/create-contract/types/create-contract-step";
import {
  EMPTY_TENANT_DATA,
  type TenantDataState,
  type TenantStatusOption,
} from "@/features/create-contract/types/tenant-step";
import type {
  ContractSession,
  ExistingPropertyContractContext,
  ExistingPropertyContractSession,
  FreshContractSession,
} from "@/features/create-contract/types/contract-session";
import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import type { ContractStep1ApiData } from "@/features/create-contract/types/contract-step1-api";
import type { ContractStep2ApiData } from "@/features/create-contract/types/contract-step2-api";
import type { ContractStep3ApiData } from "@/features/create-contract/types/contract-step3-api";
import type { ContractStep4ApiData } from "@/features/create-contract/types/contract-step4-api";
import type { ContractStep5ApiData } from "@/features/create-contract/types/contract-step5-api";
import type { ContractStep6ApiData } from "@/features/create-contract/types/contract-step6-api";
import type { ContractFinancialData } from "@/features/create-contract/types/contract-financial";
import { mapInstrumentTypeToDeedType } from "@/features/create-contract/utils/map-instrument-type-to-deed-type";
import {
  buildContractAgentData,
  buildContractOwnerData,
  buildRentedUnitData,
} from "@/features/create-contract/utils/build-existing-contract-draft";
import {
  buildFinanceDataFromStep6,
} from "@/features/create-contract/utils/build-finance-data-from-step6";
import {
  buildAgentDataFromStep3,
  buildOwnerDataFromStep3,
  mapBackendStepToWizardStep,
} from "@/features/create-contract/utils/build-uncompleted-contract-draft";
import { isOwnerStepSkipped } from "@/features/create-contract/utils/is-owner-step-skipped";
import type { UncompletedContractData } from "@/features/create-contract/types/uncompleted-contract";

type DeedDraftState = {
  currentPhaseIndex: number;
  selectedDeedType: DeedTypeId | "";
  deedFiles: File[];
  deedPersistedFiles: PersistedFile[];
  deedFrontFiles: File[];
  deedFrontPersistedFiles: PersistedFile[];
  deedBackFiles: File[];
  deedBackPersistedFiles: PersistedFile[];
  deedInheritanceFiles: File[];
  deedInheritancePersistedFiles: PersistedFile[];
  deedHeirsPoaFiles: File[];
  deedHeirsPoaPersistedFiles: PersistedFile[];
  deedEndowmentCertFiles: File[];
  deedEndowmentCertPersistedFiles: PersistedFile[];
  deedTrusteeshipFiles: File[];
  deedTrusteeshipPersistedFiles: PersistedFile[];
  isMultipleTrusteeshipDeedCopy: boolean;
  hasMinorHeirs: boolean;
  deedGuardiansPoaFiles: File[];
  deedGuardiansPoaPersistedFiles: PersistedFile[];
  useManualDeedEntry: boolean;
  manualDeedEntry: ManualDeedEntryData;
  leaseRenewalAddressMode: LeaseRenewalAddressMode;
  nationalAddressMethod: NationalAddressMethodId | "";
  nationalAddressPhotoFiles: File[];
  nationalAddressPhotoPersistedFiles: PersistedFile[];
  nationalAddressLinkUrl: string;
  nationalAddressManual: ManualNationalAddressData;
  mapLocation: NationalAddressMapLocation;
};

type OwnerDraftState = {
  currentPhaseIndex: number;
  ownerData: OwnerDataState;
  agentData: AgentDataState;
  agentPersistedFiles: PersistedFile[];
};

type TenantDraftState = {
  currentPhaseIndex: number;
  tenantData: TenantDataState;
  tenantPersistedFiles: PersistedFile[];
  rentedUnits: RentedUnitDataState[];
  leaseRenewalUnitMode: LeaseRenewalUnitMode;
  leaseRenewalAddNotes: boolean;
  leaseRenewalNotes: string;
};

type CreateContractDraftStore = {
  currentStep: CreateContractStep;
  maxReachedStepIndex: number;
  contractSession: ContractSession | null;
  contractStep1Data: ContractStep1ApiData | null;
  contractStep2Data: ContractStep2ApiData | null;
  contractStep3Data: ContractStep3ApiData | null;
  contractStep4Data: ContractStep4ApiData | null;
  contractStep5Data: ContractStep5ApiData | null;
  contractStep6Data: ContractStep6ApiData | null;
  contractFinancialData: ContractFinancialData | null;
  contractFinanceSummaryData: ContractFinancialData | null;
  existingPropertyContext: ExistingPropertyContractContext | null;
  deed: DeedDraftState;
  owner: OwnerDraftState;
  tenant: TenantDraftState;
  financeData: FinanceDataState;
  paymentData: PaymentDataState;
  contactWhatsapp: string;
  skippingOwnerStep: boolean;
  setCurrentStep: (step: CreateContractStep) => void;
  goNextStep: () => void;
  goBackStep: () => void;
  skipOwnerToTenant: () => void;
  clearSkippingOwnerStep: () => void;
  setDeedPhaseIndex: (index: number) => void;
  setSelectedDeedType: (value: DeedTypeId | "") => void;
  setDeedFiles: (files: File[]) => Promise<void>;
  setDeedFrontFiles: (files: File[]) => Promise<void>;
  setDeedBackFiles: (files: File[]) => Promise<void>;
  setDeedInheritanceFiles: (files: File[]) => Promise<void>;
  setDeedHeirsPoaFiles: (files: File[]) => Promise<void>;
  setDeedEndowmentCertFiles: (files: File[]) => Promise<void>;
  setDeedTrusteeshipFiles: (files: File[]) => Promise<void>;
  setIsMultipleTrusteeshipDeedCopy: (value: boolean) => void;
  setHasMinorHeirs: (value: boolean) => void;
  setDeedGuardiansPoaFiles: (files: File[]) => Promise<void>;
  setUseManualDeedEntry: (value: boolean) => void;
  setManualDeedEntry: (value: ManualDeedEntryData) => void;
  setLeaseRenewalAddressMode: (mode: LeaseRenewalAddressMode) => void;
  setNationalAddressMethod: (method: NationalAddressMethodId) => void;
  setNationalAddressPhotoFiles: (files: File[]) => Promise<void>;
  setNationalAddressLinkUrl: (url: string) => void;
  setNationalAddressManual: (value: ManualNationalAddressData) => void;
  setMapLocation: (location: NationalAddressMapLocation) => void;
  setOwnerPhaseIndex: (index: number) => void;
  setOwnerData: (data: OwnerDataState) => void;
  setAgentData: (data: AgentDataState) => void;
  setTenantPhaseIndex: (index: number) => void;
  setTenantData: (data: TenantDataState) => void;
  setRentedUnits: (units: RentedUnitDataState[]) => void;
  setLeaseRenewalUnitMode: (mode: LeaseRenewalUnitMode) => void;
  setLeaseRenewalAddNotes: (value: boolean) => void;
  setLeaseRenewalNotes: (value: string) => void;
  setFinanceData: (
    data: FinanceDataState | ((current: FinanceDataState) => FinanceDataState),
  ) => void;
  saveTenantRoles: (roleIds: number[]) => void;
  saveOtherConditions: (conditions: string[]) => void;
  setPaymentData: (data: PaymentDataState) => void;
  setContactWhatsapp: (value: string) => void;
  setFreshContractSession: (session: FreshContractSession) => void;
  setServerContractIdentity: (identity: { contractId: number; uuid: string }) => void;
  setContractStep1Data: (data: ContractStep1ApiData | null) => void;
  setContractStep2Data: (data: ContractStep2ApiData | null) => void;
  setContractStep3Data: (data: ContractStep3ApiData | null) => void;
  setContractStep4Data: (data: ContractStep4ApiData | null) => void;
  setContractStep5Data: (data: ContractStep5ApiData | null) => void;
  setContractStep6Data: (data: ContractStep6ApiData | null) => void;
  setContractFinancialData: (data: ContractFinancialData | null) => void;
  setContractFinanceSummaryData: (data: ContractFinancialData | null) => void;
  startExistingPropertyContractFlow: (payload: {
    session: ExistingPropertyContractSession;
    context: ExistingPropertyContractContext;
  }) => void;
  loadUncompletedContract: (data: UncompletedContractData) => void;
  resetDraft: () => void;
  hydrateFilesFromPersisted: () => void;
};

const INITIAL_DEED: DeedDraftState = {
  currentPhaseIndex: 0,
  selectedDeedType: "",
  deedFiles: [],
  deedPersistedFiles: [],
  deedFrontFiles: [],
  deedFrontPersistedFiles: [],
  deedBackFiles: [],
  deedBackPersistedFiles: [],
  deedInheritanceFiles: [],
  deedInheritancePersistedFiles: [],
  deedHeirsPoaFiles: [],
  deedHeirsPoaPersistedFiles: [],
  deedEndowmentCertFiles: [],
  deedEndowmentCertPersistedFiles: [],
  deedTrusteeshipFiles: [],
  deedTrusteeshipPersistedFiles: [],
  isMultipleTrusteeshipDeedCopy: false,
  hasMinorHeirs: false,
  deedGuardiansPoaFiles: [],
  deedGuardiansPoaPersistedFiles: [],
  useManualDeedEntry: false,
  manualDeedEntry: { ...EMPTY_MANUAL_DEED_ENTRY },
  leaseRenewalAddressMode: "same",
  nationalAddressMethod: "link" as NationalAddressMethodId | "",
  nationalAddressPhotoFiles: [],
  nationalAddressPhotoPersistedFiles: [],
  nationalAddressLinkUrl: "",
  nationalAddressManual: { ...EMPTY_MANUAL_NATIONAL_ADDRESS },
  mapLocation: DEFAULT_NATIONAL_ADDRESS_LOCATION,
};

function parseMapLocation(
  latitude: string | null,
  longitude: string | null,
): NationalAddressMapLocation {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }

  return DEFAULT_NATIONAL_ADDRESS_LOCATION;
}

function buildDeedDraftFromProperty(
  property: ExistingPropertyContractContext["property"],
): DeedDraftState {
  const addressUrl = property.address_url?.trim() ?? "";
  const nationalAddressMethod: NationalAddressMethodId | "" = addressUrl
    ? /^https?:\/\//i.test(addressUrl)
      ? "link"
      : "manual"
    : property.image_address
      ? "photo"
      : "link";

  return {
    ...INITIAL_DEED,
    selectedDeedType: mapInstrumentTypeToDeedType(property.instrument_type),
    nationalAddressMethod,
    nationalAddressLinkUrl: addressUrl,
    mapLocation: parseMapLocation(property.latitude, property.longitude),
  };
}

function buildDeedDraftFromUncompleted(
  data: UncompletedContractData,
): DeedDraftState {
  const step1 = data.step1;
  const step2 = data.step2;
  const addressUrl = (
    step2?.address_url ??
    step1?.address_url ??
    ""
  ).trim();
  const imageAddress = step2?.image_address ?? null;

  const nationalAddressMethod: NationalAddressMethodId | "" = addressUrl
    ? /^https?:\/\//i.test(addressUrl)
      ? "link"
      : "manual"
    : imageAddress
      ? "photo"
      : "link";

  const latitude = step2?.latitude ?? step1?.latitude ?? null;
  const longitude = step2?.longitude ?? step1?.longitude ?? null;

  return {
    ...INITIAL_DEED,
    selectedDeedType: mapInstrumentTypeToDeedType(step1?.instrument_type),
    nationalAddressMethod,
    nationalAddressLinkUrl: addressUrl,
    mapLocation: parseMapLocation(
      latitude === null ? null : String(latitude),
      longitude === null ? null : String(longitude),
    ),
    isMultipleTrusteeshipDeedCopy: Boolean(step1?.is_multiple_trusteeship_deed_copy),
  };
}

function buildStep1DataFromUncompleted(
  data: UncompletedContractData,
): ContractStep1ApiData | null {
  const step1 = data.step1;

  if (!step1) {
    return null;
  }

  return {
    id: step1.id,
    contract_id: step1.contract_id,
    uuid: step1.uuid,
    contract_type: step1.contract_type,
    contract_type_trans: step1.contract_type_trans,
    real_id: step1.real_id,
    real_units_id: step1.real_units_id,
    instrument_type: step1.instrument_type,
    instrument_type_trans: step1.instrument_type_trans,
    image_instrument: step1.image_instrument,
    image_instrument_from_the_front: step1.image_instrument_from_the_front,
    image_instrument_from_the_back: step1.image_instrument_from_the_back,
    Image_inheritance_certificate: step1.Image_inheritance_certificate,
    copy_power_of_attorney_from_heirs_to_agent:
      step1.copy_power_of_attorney_from_heirs_to_agent,
    copy_of_the_endowment_registration_certificate:
      step1.copy_of_the_endowment_registration_certificate,
    copy_of_the_trusteeship_deed: step1.copy_of_the_trusteeship_deed,
    is_multiple_trusteeship_deed_copy: step1.is_multiple_trusteeship_deed_copy,
    copy_of_guardians_power_of_attorney_for_agent:
      step1.copy_of_guardians_power_of_attorney_for_agent,
    latitude: step1.latitude === null ? null : String(step1.latitude),
    longitude: step1.longitude === null ? null : String(step1.longitude),
    lat: step1.lat === null ? null : String(step1.lat),
    lng: step1.lng === null ? null : String(step1.lng),
    address_url: step1.address_url,
    step: step1.step,
  };
}

function buildStep2DataFromUncompleted(
  data: UncompletedContractData,
): ContractStep2ApiData | null {
  const step2 = data.step2;

  if (!step2) {
    return null;
  }

  return {
    id: step2.id,
    contract_id: data.contract_id,
    uuid: step2.uuid,
    latitude: step2.latitude,
    longitude: step2.longitude,
    lat: step2.latitude,
    lng: step2.longitude,
    address_url: step2.address_url,
    image_address: step2.image_address,
    step: step2.step,
  };
}

function buildStep3DataFromUncompleted(
  data: UncompletedContractData,
): ContractStep3ApiData | null {
  const step3 = data.step3;

  if (!step3) {
    return null;
  }

  return {
    id: step3.id,
    contract_id: data.contract_id,
    uuid: step3.uuid,
    name_owner: step3.name_owner,
    property_owner_id_num: step3.property_owner_id_num,
    type_dob_property_owner: step3.type_dob_property_owner,
    property_owner_mobile: step3.property_owner_mobile,
    property_owner_iban: step3.property_owner_iban,
    add_legal_agent_of_owner: step3.add_legal_agent_of_owner,
    id_num_of_property_owner_agent: step3.id_num_of_property_owner_agent,
    mobile_of_property_owner_agent: step3.mobile_of_property_owner_agent,
    step: step3.step,
  };
}

const INITIAL_OWNER: OwnerDraftState = {
  currentPhaseIndex: 0,
  ownerData: EMPTY_OWNER_DATA,
  agentData: EMPTY_AGENT_DATA,
  agentPersistedFiles: [],
};

const INITIAL_TENANT: TenantDraftState = {
  currentPhaseIndex: 0,
  tenantData: EMPTY_TENANT_DATA,
  tenantPersistedFiles: [],
  rentedUnits: [{ ...EMPTY_RENTED_UNIT_DATA }],
  leaseRenewalUnitMode: "same",
  leaseRenewalAddNotes: false,
  leaseRenewalNotes: "",
};

function normalizePersistedRentedUnits(
  tenant: Partial<TenantDraftState> & { rentedUnitData?: RentedUnitDataState },
): RentedUnitDataState[] {
  if (tenant.rentedUnits?.length) {
    return tenant.rentedUnits.map((unit) => ({
      ...EMPTY_RENTED_UNIT_DATA,
      ...unit,
    }));
  }

  if (tenant.rentedUnitData) {
    return [{ ...EMPTY_RENTED_UNIT_DATA, ...tenant.rentedUnitData }];
  }

  return [{ ...EMPTY_RENTED_UNIT_DATA }];
}

function createInitialState() {
  return {
    currentStep: "intro" as CreateContractStep,
    maxReachedStepIndex: 0,
    contractSession: null as ContractSession | null,
    contractStep1Data: null as ContractStep1ApiData | null,
    contractStep2Data: null as ContractStep2ApiData | null,
    contractStep3Data: null as ContractStep3ApiData | null,
    contractStep4Data: null as ContractStep4ApiData | null,
    contractStep5Data: null as ContractStep5ApiData | null,
    contractStep6Data: null as ContractStep6ApiData | null,
    contractFinancialData: null as ContractFinancialData | null,
    contractFinanceSummaryData: null as ContractFinancialData | null,
    existingPropertyContext: null as ExistingPropertyContractContext | null,
    deed: { ...INITIAL_DEED },
    owner: { ...INITIAL_OWNER, ownerData: { ...EMPTY_OWNER_DATA }, agentData: { ...EMPTY_AGENT_DATA } },
    tenant: {
      ...INITIAL_TENANT,
      tenantData: { ...EMPTY_TENANT_DATA, individual: { ...EMPTY_TENANT_DATA.individual }, organization: { ...EMPTY_TENANT_DATA.organization } },
      rentedUnits: [{ ...EMPTY_RENTED_UNIT_DATA }],
    },
    financeData: createEmptyFinanceData(),
    paymentData: { ...EMPTY_PAYMENT_DATA },
    contactWhatsapp: "",
    skippingOwnerStep: false,
  };
}

export const useCreateContractDraftStore = create<CreateContractDraftStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      setCurrentStep: (step) => set({ currentStep: step, skippingOwnerStep: false }),
      goNextStep: () => {
        const index = CREATE_CONTRACT_STEPS.indexOf(get().currentStep);
        if (index < CREATE_CONTRACT_STEPS.length - 1) {
          set({
            currentStep: CREATE_CONTRACT_STEPS[index + 1],
            maxReachedStepIndex: Math.max(get().maxReachedStepIndex, index + 1),
            skippingOwnerStep: false,
          });
        }
      },
      goBackStep: () => {
        const state = get();

        if (
          state.currentStep === "tenant" &&
          (state.existingPropertyContext !== null ||
            isOwnerStepSkipped({
              selectedDeedType: state.deed.selectedDeedType,
              instrumentType: state.contractStep1Data?.instrument_type,
            }))
        ) {
          set({ currentStep: "deed", skippingOwnerStep: false });
          return;
        }

        const index = CREATE_CONTRACT_STEPS.indexOf(state.currentStep);
        if (index > 0) {
          set({
            currentStep: CREATE_CONTRACT_STEPS[index - 1],
            skippingOwnerStep: false,
          });
        }
      },
      skipOwnerToTenant: () => {
        set({ currentStep: "tenant", skippingOwnerStep: true });
      },
      clearSkippingOwnerStep: () => {
        set({ skippingOwnerStep: false });
      },
      setDeedPhaseIndex: (index) =>
        set((state) => ({ deed: { ...state.deed, currentPhaseIndex: index } })),
      setSelectedDeedType: (value) =>
        set((state) => {
          const shouldClearStep1 =
            state.contractStep1Data !== null &&
            (value === "" ||
              mapInstrumentTypeToDeedType(
                state.contractStep1Data.instrument_type,
              ) !== value);

          // A different deed type asks for different documents (e.g. a sublease
          // PDF is not an ownership deed image): drop every uploaded document and
          // manual entry so stale files are never carried over and re-sent.
          const clearDocs = value === "" || value !== state.deed.selectedDeedType;

          return {
            deed: {
              ...state.deed,
              selectedDeedType: value,
              deedFiles: clearDocs ? [] : state.deed.deedFiles,
              deedPersistedFiles: clearDocs ? [] : state.deed.deedPersistedFiles,
              deedFrontFiles: clearDocs ? [] : state.deed.deedFrontFiles,
              deedFrontPersistedFiles:
                clearDocs ? [] : state.deed.deedFrontPersistedFiles,
              deedBackFiles: clearDocs ? [] : state.deed.deedBackFiles,
              deedBackPersistedFiles:
                clearDocs ? [] : state.deed.deedBackPersistedFiles,
              deedInheritanceFiles:
                clearDocs ? [] : state.deed.deedInheritanceFiles,
              deedInheritancePersistedFiles:
                clearDocs ? [] : state.deed.deedInheritancePersistedFiles,
              deedHeirsPoaFiles: clearDocs ? [] : state.deed.deedHeirsPoaFiles,
              deedHeirsPoaPersistedFiles:
                clearDocs ? [] : state.deed.deedHeirsPoaPersistedFiles,
              deedEndowmentCertFiles:
                clearDocs ? [] : state.deed.deedEndowmentCertFiles,
              deedEndowmentCertPersistedFiles:
                clearDocs ? [] : state.deed.deedEndowmentCertPersistedFiles,
              deedTrusteeshipFiles:
                clearDocs ? [] : state.deed.deedTrusteeshipFiles,
              deedTrusteeshipPersistedFiles:
                clearDocs ? [] : state.deed.deedTrusteeshipPersistedFiles,
              isMultipleTrusteeshipDeedCopy:
                clearDocs ? false : state.deed.isMultipleTrusteeshipDeedCopy,
              hasMinorHeirs: clearDocs ? false : state.deed.hasMinorHeirs,
              deedGuardiansPoaFiles:
                clearDocs ? [] : state.deed.deedGuardiansPoaFiles,
              deedGuardiansPoaPersistedFiles:
                clearDocs ? [] : state.deed.deedGuardiansPoaPersistedFiles,
              useManualDeedEntry: clearDocs ? false : state.deed.useManualDeedEntry,
              manualDeedEntry: clearDocs
                ? { ...EMPTY_MANUAL_DEED_ENTRY }
                : state.deed.manualDeedEntry,
              leaseRenewalAddressMode: deedTypeIsLeaseRenewal(value)
                ? state.deed.leaseRenewalAddressMode || "same"
                : "same",
            },
            contractStep1Data: shouldClearStep1 ? null : state.contractStep1Data,
            contractStep2Data: shouldClearStep1 ? null : state.contractStep2Data,
          };
        }),
      setDeedFiles: async (files) => {
        const deedPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedFiles: files,
            deedPersistedFiles,
            useManualDeedEntry:
              files.length > 0 ? false : state.deed.useManualDeedEntry,
            manualDeedEntry:
              files.length > 0
                ? { ...EMPTY_MANUAL_DEED_ENTRY }
                : state.deed.manualDeedEntry,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedFrontFiles: async (files) => {
        const deedFrontPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedFrontFiles: files,
            deedFrontPersistedFiles,
            useManualDeedEntry:
              files.length > 0 ? false : state.deed.useManualDeedEntry,
            manualDeedEntry:
              files.length > 0
                ? { ...EMPTY_MANUAL_DEED_ENTRY }
                : state.deed.manualDeedEntry,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedFrontFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedBackFiles: async (files) => {
        const deedBackPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedBackFiles: files,
            deedBackPersistedFiles,
            useManualDeedEntry:
              files.length > 0 ? false : state.deed.useManualDeedEntry,
            manualDeedEntry:
              files.length > 0
                ? { ...EMPTY_MANUAL_DEED_ENTRY }
                : state.deed.manualDeedEntry,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedBackFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedInheritanceFiles: async (files) => {
        const deedInheritancePersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedInheritanceFiles: files,
            deedInheritancePersistedFiles,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedInheritanceFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedHeirsPoaFiles: async (files) => {
        const deedHeirsPoaPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedHeirsPoaFiles: files,
            deedHeirsPoaPersistedFiles,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedHeirsPoaFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedEndowmentCertFiles: async (files) => {
        const deedEndowmentCertPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedEndowmentCertFiles: files,
            deedEndowmentCertPersistedFiles,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedEndowmentCertFiles ? state.contractStep1Data : null,
        }));
      },
      setDeedTrusteeshipFiles: async (files) => {
        const deedTrusteeshipPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedTrusteeshipFiles: files,
            deedTrusteeshipPersistedFiles,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedTrusteeshipFiles ? state.contractStep1Data : null,
        }));
      },
      setIsMultipleTrusteeshipDeedCopy: (value) =>
        set((state) => ({
          contractStep1Data:
            value === state.deed.isMultipleTrusteeshipDeedCopy
              ? state.contractStep1Data
              : null,
          deed: {
            ...state.deed,
            isMultipleTrusteeshipDeedCopy: value,
            deedGuardiansPoaFiles: value ? state.deed.deedGuardiansPoaFiles : [],
            deedGuardiansPoaPersistedFiles: value
              ? state.deed.deedGuardiansPoaPersistedFiles
              : [],
          },
        })),
      setHasMinorHeirs: (value) =>
        set((state) => ({
          contractStep1Data:
            value === state.deed.hasMinorHeirs ? state.contractStep1Data : null,
          deed: {
            ...state.deed,
            hasMinorHeirs: value,
            deedGuardiansPoaFiles: value ? state.deed.deedGuardiansPoaFiles : [],
            deedGuardiansPoaPersistedFiles: value
              ? state.deed.deedGuardiansPoaPersistedFiles
              : [],
          },
        })),
      setDeedGuardiansPoaFiles: async (files) => {
        const deedGuardiansPoaPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            deedGuardiansPoaFiles: files,
            deedGuardiansPoaPersistedFiles,
          },
          // Edited documents must be re-sent: drop the stale step-1 submission.
          contractStep1Data:
            files === state.deed.deedGuardiansPoaFiles ? state.contractStep1Data : null,
        }));
      },
      setUseManualDeedEntry: (value) =>
        set((state) => ({
          deed: {
            ...state.deed,
            useManualDeedEntry: value,
            deedFiles: value ? [] : state.deed.deedFiles,
            deedPersistedFiles: value ? [] : state.deed.deedPersistedFiles,
            deedFrontFiles: value ? [] : state.deed.deedFrontFiles,
            deedFrontPersistedFiles: value ? [] : state.deed.deedFrontPersistedFiles,
            deedBackFiles: value ? [] : state.deed.deedBackFiles,
            deedBackPersistedFiles: value ? [] : state.deed.deedBackPersistedFiles,
            manualDeedEntry: value
              ? state.deed.manualDeedEntry
              : { ...EMPTY_MANUAL_DEED_ENTRY },
          },
        })),
      setManualDeedEntry: (value) =>
        set((state) => ({
          deed: { ...state.deed, manualDeedEntry: value },
          contractStep1Data:
            value === state.deed.manualDeedEntry ? state.contractStep1Data : null,
        })),
      setLeaseRenewalAddressMode: (mode) =>
        set((state) => ({
          deed: { ...state.deed, leaseRenewalAddressMode: mode },
        })),
      setNationalAddressMethod: (method) =>
        set((state) => ({
          deed: { ...state.deed, nationalAddressMethod: method },
          contractStep2Data:
            state.deed.nationalAddressMethod === method ? state.contractStep2Data : null,
        })),
      setNationalAddressPhotoFiles: async (files) => {
        const nationalAddressPhotoPersistedFiles = await filesToPersisted(files);
        set((state) => ({
          deed: {
            ...state.deed,
            nationalAddressPhotoFiles: files,
            nationalAddressPhotoPersistedFiles,
          },
          contractStep2Data:
            files === state.deed.nationalAddressPhotoFiles
              ? state.contractStep2Data
              : null,
        }));
      },
      setNationalAddressLinkUrl: (url) =>
        set((state) => ({
          deed: { ...state.deed, nationalAddressLinkUrl: url },
          contractStep2Data:
            url === state.deed.nationalAddressLinkUrl ? state.contractStep2Data : null,
        })),
      setNationalAddressManual: (value) =>
        set((state) => ({
          deed: { ...state.deed, nationalAddressManual: value },
          contractStep2Data:
            value === state.deed.nationalAddressManual
              ? state.contractStep2Data
              : null,
        })),
      setMapLocation: (location) =>
        set((state) => {
          const hasLocationChanged =
            state.deed.mapLocation?.lat !== location.lat ||
            state.deed.mapLocation?.lng !== location.lng;

          return {
            deed: { ...state.deed, mapLocation: location },
            contractStep2Data: hasLocationChanged ? null : state.contractStep2Data,
          };
        }),
      setOwnerPhaseIndex: (index) =>
        set((state) => ({ owner: { ...state.owner, currentPhaseIndex: index } })),
      setOwnerData: (data) =>
        set((state) => {
          const resetAgent =
            data.hasAgent === "no" && state.owner.ownerData.hasAgent === "yes";

          return {
            owner: {
              ...state.owner,
              ownerData: data,
              agentData: resetAgent ? { ...EMPTY_AGENT_DATA } : state.owner.agentData,
              agentPersistedFiles: resetAgent ? [] : state.owner.agentPersistedFiles,
            },
          };
        }),
      setAgentData: (data) => {
        set((state) => {
          const filesChanged =
            data.powerOfAttorneyFiles !== state.owner.agentData.powerOfAttorneyFiles;

          if (filesChanged) {
            void filesToPersisted(data.powerOfAttorneyFiles).then(
              (agentPersistedFiles) => {
                set((current) => ({
                  owner: { ...current.owner, agentPersistedFiles },
                }));
              },
            );
          }

          return {
            owner: { ...state.owner, agentData: data },
          };
        });
      },
      setTenantPhaseIndex: (index) =>
        set((state) => ({ tenant: { ...state.tenant, currentPhaseIndex: index } })),
      setTenantData: (data) => {
        set((state) => {
          const filesChanged =
            data.organization.powerOfAttorneyFiles !==
            state.tenant.tenantData.organization.powerOfAttorneyFiles;

          if (filesChanged) {
            void filesToPersisted(data.organization.powerOfAttorneyFiles).then(
              (tenantPersistedFiles) => {
                set((current) => ({
                  tenant: { ...current.tenant, tenantPersistedFiles },
                }));
              },
            );
          }

          return {
            tenant: { ...state.tenant, tenantData: data },
            // Edited tenant data must be re-sent: drop the stale step-4 submission.
            contractStep4Data:
              data === state.tenant.tenantData ? state.contractStep4Data : null,
          };
        });
      },
      setRentedUnits: (units) =>
        set((state) => ({
          tenant: { ...state.tenant, rentedUnits: units },
          // Edited units must be re-sent: drop the stale step-5 submission.
          contractStep5Data:
            units === state.tenant.rentedUnits ? state.contractStep5Data : null,
        })),
      setLeaseRenewalUnitMode: (mode) =>
        set((state) => ({
          tenant: { ...state.tenant, leaseRenewalUnitMode: mode },
          contractStep5Data:
            mode === state.tenant.leaseRenewalUnitMode
              ? state.contractStep5Data
              : null,
        })),
      setLeaseRenewalAddNotes: (value) =>
        set((state) => ({
          tenant: {
            ...state.tenant,
            leaseRenewalAddNotes: value,
            leaseRenewalNotes: value ? state.tenant.leaseRenewalNotes : "",
          },
        })),
      setLeaseRenewalNotes: (value) =>
        set((state) => ({
          tenant: { ...state.tenant, leaseRenewalNotes: value },
        })),
      setFinanceData: (data) =>
        set((state) => {
          const financeData =
            typeof data === "function" ? data(state.financeData) : data;

          return {
            financeData,
            // Edited finance data must be re-sent: drop the stale step-6 submission
            // so the duration/rent/terms actually saved match what is shown.
            contractStep6Data:
              financeData === state.financeData ? state.contractStep6Data : null,
          };
        }),
      saveTenantRoles: (selectedTenantRoleIds) => {
        get().setFinanceData((current) => ({
          ...current,
          selectedTenantRoleIds,
          addTenantPermissions: selectedTenantRoleIds.length > 0,
          tenantRoleValues: Object.fromEntries(
            Object.entries(current.tenantRoleValues).filter(([key]) =>
              selectedTenantRoleIds.includes(Number(key)),
            ),
          ),
        }));
      },
      saveOtherConditions: (otherConditionsList) => {
        const filled = otherConditionsList
          .map((item) => item.trim())
          .filter(Boolean);

        get().setFinanceData((current) => ({
          ...current,
          otherConditionsList:
            filled.length > 0 ? otherConditionsList : [],
          addOtherConditions: filled.length > 0,
        }));
      },
      setPaymentData: (data) => set({ paymentData: data }),
      setContactWhatsapp: (value) => set({ contactWhatsapp: value }),
      setServerContractIdentity: ({ contractId, uuid }) =>
        set((state) => ({
          // The server contract replaces the local placeholder ids so every
          // consumer (payment, coupon, finance summary, header number) now
          // points at the real order.
          contractSession: state.contractSession
            ? {
                ...state.contractSession,
                contractId,
                uuid,
                orderReference: uuid,
                serverContractId: contractId,
                serverUuid: uuid,
              }
            : state.contractSession,
        })),
      setFreshContractSession: (session) =>
        set((state) => ({
          contractSession: session,
          contractStep1Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep1Data
              : null,
          contractStep2Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep2Data
              : null,
          contractStep3Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep3Data
              : null,
          contractStep4Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep4Data
              : null,
          contractStep5Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep5Data
              : null,
          contractStep6Data:
            state.contractSession?.contractId === session.contractId
              ? state.contractStep6Data
              : null,
          contractFinancialData:
            state.contractSession?.contractId === session.contractId
              ? state.contractFinancialData
              : null,
          contractFinanceSummaryData:
            state.contractSession?.contractId === session.contractId
              ? state.contractFinanceSummaryData
              : null,
        })),
      setContractStep1Data: (data) => set({ contractStep1Data: data }),
      setContractStep2Data: (data) => set({ contractStep2Data: data }),
      setContractStep3Data: (data) => set({ contractStep3Data: data }),
      setContractStep4Data: (data) => set({ contractStep4Data: data }),
      setContractStep5Data: (data) => set({ contractStep5Data: data }),
      setContractStep6Data: (data) =>
        set((state) => ({
          contractStep6Data: data,
          financeData: buildFinanceDataFromStep6(data, state.financeData),
        })),
      setContractFinancialData: (data) => set({ contractFinancialData: data }),
      setContractFinanceSummaryData: (data) =>
        set({ contractFinanceSummaryData: data }),
      startExistingPropertyContractFlow: ({ session, context }) => {
        const base = createInitialState();

        set({
          ...base,
          currentStep: "tenant",
          skippingOwnerStep: true,
          contractSession: session,
          existingPropertyContext: context,
          deed: buildDeedDraftFromProperty(context.property),
          owner: {
            ...base.owner,
            ownerData: buildContractOwnerData(context.property),
            agentData: buildContractAgentData(context.property),
          },
          tenant: {
            ...base.tenant,
            rentedUnits: context.units.map((unit) => buildRentedUnitData(unit)),
          },
        });
      },
      loadUncompletedContract: (data) => {
        const base = createInitialState();
        const contractType: PropertyContractType =
          data.step1?.contract_type === "commercial" ? "commercial" : "housing";
        const step3 = data.step3;
        const step6 = data.step6 ?? null;

        set({
          ...base,
          currentStep: mapBackendStepToWizardStep(data.step),
          contractSession: {
            contractId: data.contract_id,
            uuid: data.uuid,
            contractType,
            isReal: false,
          },
          contractStep1Data: buildStep1DataFromUncompleted(data),
          contractStep2Data: buildStep2DataFromUncompleted(data),
          contractStep3Data: buildStep3DataFromUncompleted(data),
          contractStep6Data: step6
            ? {
                id: step6.id ?? data.contract_id,
                contract_id: step6.contract_id ?? data.contract_id,
                uuid: step6.uuid ?? data.uuid,
                contract_term_in_years: step6.contract_term_in_years ?? null,
                annual_rent_amount_for_the_unit:
                  step6.annual_rent_amount_for_the_unit ?? null,
                payment_type_id: step6.payment_type_id ?? null,
                duration_preset: step6.duration_preset ?? null,
                duration_years: step6.duration_years ?? null,
                duration_months: step6.duration_months ?? null,
                total_months: step6.total_months ?? null,
                doc_fee: step6.doc_fee ?? null,
                doc_fee_lines: step6.doc_fee_lines ?? null,
                conditions: step6.conditions ?? null,
                other_conditions: step6.other_conditions ?? null,
                other_conditions_list: step6.other_conditions_list ?? null,
                tenant_roles: step6.tenant_roles ?? null,
                tenant_role_id: step6.tenant_role_id ?? null,
                tenant_role_ids: step6.tenant_role_ids ?? null,
                tenant_role_values: step6.tenant_role_values ?? null,
                tenant_roles_details: step6.tenant_roles_details ?? null,
                step: step6.step ?? data.step,
              }
            : null,
          deed: buildDeedDraftFromUncompleted(data),
          owner: {
            ...base.owner,
            ownerData: step3 ? buildOwnerDataFromStep3(step3) : base.owner.ownerData,
            agentData: step3 ? buildAgentDataFromStep3(step3) : base.owner.agentData,
          },
          financeData: buildFinanceDataFromStep6(step6, base.financeData),
        });
      },
      resetDraft: () => set(createInitialState()),
      hydrateFilesFromPersisted: () => {
        const state = get();
        set({
          deed: {
            ...state.deed,
            deedFiles: persistedToFiles(state.deed.deedPersistedFiles),
            deedFrontFiles: persistedToFiles(state.deed.deedFrontPersistedFiles),
            deedBackFiles: persistedToFiles(state.deed.deedBackPersistedFiles),
            deedInheritanceFiles: persistedToFiles(
              state.deed.deedInheritancePersistedFiles,
            ),
            deedHeirsPoaFiles: persistedToFiles(
              state.deed.deedHeirsPoaPersistedFiles,
            ),
            deedEndowmentCertFiles: persistedToFiles(
              state.deed.deedEndowmentCertPersistedFiles,
            ),
            deedTrusteeshipFiles: persistedToFiles(
              state.deed.deedTrusteeshipPersistedFiles,
            ),
            deedGuardiansPoaFiles: persistedToFiles(
              state.deed.deedGuardiansPoaPersistedFiles,
            ),
            nationalAddressPhotoFiles: persistedToFiles(
              state.deed.nationalAddressPhotoPersistedFiles,
            ),
          },
          owner: {
            ...state.owner,
            agentData: {
              ...state.owner.agentData,
              powerOfAttorneyFiles: persistedToFiles(state.owner.agentPersistedFiles),
            },
          },
          tenant: {
            ...state.tenant,
            tenantData: {
              ...state.tenant.tenantData,
              organization: {
                ...state.tenant.tenantData.organization,
                powerOfAttorneyFiles: persistedToFiles(
                  state.tenant.tenantPersistedFiles,
                ),
              },
            },
          },
        });
      },
    }),
    {
      name: "aqdi-create-contract-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        maxReachedStepIndex: state.maxReachedStepIndex,
        contractSession: state.contractSession,
        contractStep1Data: state.contractStep1Data,
        contractStep2Data: state.contractStep2Data,
        contractStep3Data: state.contractStep3Data,
        contractStep4Data: state.contractStep4Data,
        contractStep5Data: state.contractStep5Data,
        contractStep6Data: state.contractStep6Data,
        contractFinancialData: state.contractFinancialData,
        contractFinanceSummaryData: state.contractFinanceSummaryData,
        existingPropertyContext: state.existingPropertyContext,
        deed: {
          currentPhaseIndex: state.deed.currentPhaseIndex,
          selectedDeedType: state.deed.selectedDeedType,
          deedPersistedFiles: state.deed.deedPersistedFiles,
          deedFrontPersistedFiles: state.deed.deedFrontPersistedFiles,
          deedBackPersistedFiles: state.deed.deedBackPersistedFiles,
          deedInheritancePersistedFiles: state.deed.deedInheritancePersistedFiles,
          deedHeirsPoaPersistedFiles: state.deed.deedHeirsPoaPersistedFiles,
          deedEndowmentCertPersistedFiles: state.deed.deedEndowmentCertPersistedFiles,
          deedTrusteeshipPersistedFiles: state.deed.deedTrusteeshipPersistedFiles,
          isMultipleTrusteeshipDeedCopy: state.deed.isMultipleTrusteeshipDeedCopy,
          hasMinorHeirs: state.deed.hasMinorHeirs,
          deedGuardiansPoaPersistedFiles: state.deed.deedGuardiansPoaPersistedFiles,
          leaseRenewalAddressMode: state.deed.leaseRenewalAddressMode,
          nationalAddressMethod: state.deed.nationalAddressMethod,
          nationalAddressPhotoPersistedFiles:
            state.deed.nationalAddressPhotoPersistedFiles,
          nationalAddressLinkUrl: state.deed.nationalAddressLinkUrl,
          nationalAddressManual: state.deed.nationalAddressManual,
          mapLocation: state.deed.mapLocation,
        },
        owner: {
          currentPhaseIndex: state.owner.currentPhaseIndex,
          ownerData: state.owner.ownerData,
          agentData: {
            idNumber: state.owner.agentData.idNumber,
            birthDate: state.owner.agentData.birthDate,
            phone: state.owner.agentData.phone,
            poaNumber: state.owner.agentData.poaNumber,
            poaDate: state.owner.agentData.poaDate,
            powerOfAttorneyFiles: [],
          },
          agentPersistedFiles: state.owner.agentPersistedFiles,
        },
        tenant: {
          currentPhaseIndex: state.tenant.currentPhaseIndex,
          tenantData: {
            status: state.tenant.tenantData.status,
            individual: state.tenant.tenantData.individual,
            organization: {
              delegationType: state.tenant.tenantData.organization.delegationType,
              unifiedRecordNumber:
                state.tenant.tenantData.organization.unifiedRecordNumber,
              ownerIdNumber: state.tenant.tenantData.organization.ownerIdNumber,
              ownerBirthDate: state.tenant.tenantData.organization.ownerBirthDate,
              ownerPhone: state.tenant.tenantData.organization.ownerPhone,
              powerOfAttorneyFiles: [],
            },
          },
          tenantPersistedFiles: state.tenant.tenantPersistedFiles,
          rentedUnits: state.tenant.rentedUnits,
          leaseRenewalUnitMode: state.tenant.leaseRenewalUnitMode,
          leaseRenewalAddNotes: state.tenant.leaseRenewalAddNotes,
          leaseRenewalNotes: state.tenant.leaseRenewalNotes,
        },
        financeData: state.financeData,
        paymentData: state.paymentData,
        contactWhatsapp: state.contactWhatsapp,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<CreateContractDraftStore>;
        const initial = createInitialState();

        const persistedOwner = (persisted.owner ?? {}) as Partial<
          CreateContractDraftStore["owner"]
        >;
        const persistedTenant = (persisted.tenant ?? {}) as Partial<
          CreateContractDraftStore["tenant"]
        >;
        const persistedTenantData = (persistedTenant.tenantData ?? {}) as Partial<
          CreateContractDraftStore["tenant"]["tenantData"]
        >;

        return {
          ...currentState,
          ...persisted,
          deed: {
            ...initial.deed,
            ...(persisted.deed ?? {}),
            // The method select is preselected to the Google Maps link.
            nationalAddressMethod:
              persisted.deed?.nationalAddressMethod || initial.deed.nationalAddressMethod,
          },
          owner: {
            ...initial.owner,
            ...persistedOwner,
            ownerData: {
              ...initial.owner.ownerData,
              ...(persistedOwner.ownerData ?? {}),
            },
            agentData: {
              ...initial.owner.agentData,
              ...(persistedOwner.agentData ?? {}),
            },
          },
          tenant: {
            ...initial.tenant,
            ...persistedTenant,
            tenantData: {
              ...initial.tenant.tenantData,
              ...persistedTenantData,
              individual: {
                ...initial.tenant.tenantData.individual,
                ...(persistedTenantData.individual ?? {}),
              },
              organization: {
                ...initial.tenant.tenantData.organization,
                ...(persistedTenantData.organization ?? {}),
              },
            },
            rentedUnits: normalizePersistedRentedUnits(persistedTenant),
          },
          financeData: normalizeFinanceData({
            ...initial.financeData,
            ...(persisted.financeData ?? {}),
            contractPeriodId:
              typeof persisted.financeData?.contractPeriodId === "number"
                ? persisted.financeData.contractPeriodId
                : "",
          }),
          paymentData: { ...initial.paymentData, ...(persisted.paymentData ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.financeData = normalizeFinanceData(state.financeData);
          state.tenant.rentedUnits = normalizePersistedRentedUnits(state.tenant);
        }

        state?.hydrateFilesFromPersisted();
      },
    },
  ),
);

export function updateContractTenantStatus(
  tenantData: TenantDataState,
  status: TenantStatusOption | "",
): TenantDataState {
  // Keep both forms' drafts when toggling status so switching back restores input.
  return {
    ...tenantData,
    status,
  };
}
