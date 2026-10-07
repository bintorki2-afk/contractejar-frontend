export type RealEstateUnitPayload = {
  unit_id?: number;
  id?: number;
  real_unit_id?: number;
  unit_type_id?: number;
  unit_usage_id?: number;
  unit_number?: string;
  floor_number?: number;
  unit_area?: number;
  contract_type?: "housing" | "commercial";
  tootal_rooms?: number;
  The_number_of_halls?: number;
  The_number_of_kitchens?: number;
  The_number_of_toilets?: number;
  window_ac?: number;
  split_ac?: number;
  electricity_meter_number?: string;
  water_meter_number?: string;
  kitchen_tank?: boolean;
  furnished?: boolean;
  type_furnished?: string | boolean | null;
  electricity_meter?: boolean;
  water_meter?: boolean;
  electricity_meter_ownership?: "owner" | "tenant" | "shared" | null;
  electricity_shared_monthly_fee?: number | string | null;
  water_meter_ownership?: "owner" | "tenant" | "shared" | null;
  water_shared_monthly_fee?: number | string | null;
  Number_parking_spaces?: string;
  Services?: [];
  number_of_rooms?: number;
  The_number_of_the_toilet?: number;
};

export type RealEstateStep3Request = {
  id: number;
  units: RealEstateUnitPayload[];
  unit_ids?: number[];
};

export type RealEstateStep3ApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: {
    id: number;
    step: number;
    units: Array<{
      id: number;
      real_estates_units_id: number;
      unit_number: string | null;
      unit_type_id: number | null;
      unit_type_name?: string | null;
      unit_usage_id?: number | null;
      unit_usage_name?: string | null;
      floor_number?: string | null;
      unit_area?: string | null;
    }>;
    units_count?: number;
  };
  units_count?: number;
};
