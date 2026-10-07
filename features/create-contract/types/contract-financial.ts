export type ContractFinancialPriceDetails = {
  contract_period_price: number;
  application_fees: number;
  tax: number;
  electricity_meter_fee: number;
  water_meter_fee: number;
};

export type ContractFinancialService = {
  id: number;
  name_ar: string;
  name_en: string;
  name: string;
  service_name: string;
  price: number;
  service_price: number;
  contract_type: string;
};

export type ContractSharedMeterTerm = {
  monthly: number;
  months: number;
  total: number;
};

/** «عداد مشترك» amounts — a contract term paid to the owner, never part of our total. */
export type ContractSharedMeters = {
  electricity: ContractSharedMeterTerm | null;
  water: ContractSharedMeterTerm | null;
  total: number;
};

export type ContractSavedPropertyState = {
  show_option: boolean;
  from_saved: boolean;
  saved: boolean;
  real_estate_id: number | null;
};

export type ContractFinancialData = {
  price_details: ContractFinancialPriceDetails;
  services: ContractFinancialService[];
  additional_services: ContractFinancialService[];
  services_total: number;
  meter_fees_total: number;
  total_price: number;
  /** Documentation fee alone (before VAT, surcharge and meter fees). */
  fee?: number | null;
  /** One-time surcharge for specific document types; included in `total_price`. */
  document_surcharge?: number | null;
  document_surcharge_applies?: boolean | null;
  shared_meters?: ContractSharedMeters | null;
  saved_property?: ContractSavedPropertyState | null;
  doc_fee?: number | null;
  doc_fee_lines?: string[] | null;
  duration_preset?: string | null;
};

export function resolveDocumentSurcharge(
  data: ContractFinancialData | null | undefined,
): number {
  if (!data || !data.document_surcharge_applies) {
    return 0;
  }

  const amount = Number(data.document_surcharge ?? 0);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export type ContractFinancialApiResponse = {
  status: string;
  message: string;
  data: ContractFinancialData;
};
