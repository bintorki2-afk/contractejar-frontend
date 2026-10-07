import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import type {
  PropertyUnitApiItem,
  PropertyWithUnitsApiData,
} from "@/features/property-units/types/property-units-api";

type ContractSessionBase = {
  contractId: number;
  uuid: string;
  contractType: PropertyContractType;
  /**
   * Customer-facing order reference — a stable 6-digit number generated when a
   * fresh (account-less) order starts, so the customer always sees an order
   * number from the first step even before any backend id exists. For a real
   * backend-backed contract the displayable number is the numeric `uuid`
   * (matches the dashboard); this reference is the fallback for the fresh flow.
   */
  orderReference?: string;
  /**
   * Set once the draft has been replayed onto the backend (submit step): the
   * real contract id/uuid used for payment, tracking and the dashboard. The
   * customer-facing order number becomes `serverUuid` from then on.
   */
  serverContractId?: number;
  serverUuid?: string;
};

export type FreshContractSession = ContractSessionBase & {
  isReal: false;
};

export type ExistingPropertyContractSession = ContractSessionBase & {
  isReal: true;
  realId: number;
  realUnitsId: number;
  unitIds: number[];
  unitsCount: number;
};

export type ContractSession = FreshContractSession | ExistingPropertyContractSession;

export type ExistingPropertyContractContext = {
  property: PropertyWithUnitsApiData;
  units: PropertyUnitApiItem[];
};
