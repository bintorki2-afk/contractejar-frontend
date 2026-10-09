import type { PropertyContractType } from "@/features/create-property/utils/contract-type";
import type {
  ContractJourneyStep,
  ContractStatusType,
} from "@/features/requests/types/contract-journey";

export type ContractListItem = {
  id: number;
  uuid: string;
  contract_type: PropertyContractType;
  name_real_estate: string | null;
  property_owner_id_num: string | null;
  tenant_id_num: string | null;
  instrument_type: string | null;
  is_completed: boolean;
  is_draft: boolean;
  step: number;
  contract_status_id: number | null;
  contract_status_name: string | null;
  contract_status_color: string | null;
  status?: string | null;
  /** Batch D: stable status key (`new`, `paid`, `under_review`, …, `refunded`). */
  status_key?: string | null;
  status_label?: string | null;
  status_type?: ContractStatusType | string | null;
  status_id?: number | null;
  status_color?: string | null;
  status_description?: string | null;
  journey_status?: string | null;
  journey_status_label?: string | null;
  journey?: ContractJourneyStep[] | null;
  created_at: string;
  time_to_documentation_contract: string | null;
  total_price?: number | null;
  doc_fee?: number | null;
  amount?: number | null;
  payable_amount?: number | null;
  refund?: { status?: string | null; amount?: number | string | null; refunded_at?: string | null } | null;
  refunded_amount?: number | string | null;
  is_refunded?: boolean;
};

export type ContractsPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ContractsListApiData = {
  data: ContractListItem[];
  pagination: ContractsPagination;
};

export type ContractsListApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: ContractsListApiData;
};
