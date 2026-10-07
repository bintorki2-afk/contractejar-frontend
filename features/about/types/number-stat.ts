export type NumberStatId =
  | "satisfaction"
  | "contractsValue"
  | "commercial"
  | "residential";

export type NumberStatConfig = {
  id: NumberStatId;
  icon: string;
};

export type NumberStatTranslations = {
  value: string;
  label: string;
};
