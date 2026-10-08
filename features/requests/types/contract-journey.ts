export type ContractJourneyStepState = "completed" | "current" | "pending";

export type ContractStatusType = "contract" | "draft";

export type ContractJourneyStep = {
  key: string;
  status: string;
  status_label: string;
  description: string;
  state: ContractJourneyStepState;
  /** ISO timestamp when the step happened, when the server knows it. */
  at?: string | null;
};

export type ContractStatusSnapshot = {
  contractId: number;
  status: string;
  status_label: string;
  status_type: ContractStatusType;
  status_id: number | null;
  status_color?: string | null;
  status_description?: string | null;
  journey_status: string;
  journey_status_label: string;
  journey: ContractJourneyStep[];
  /** ف2 sentence from the API (falls back to the shared constant). */
  journey_sentence?: string | null;
};

export type ContractDetail = ContractStatusSnapshot & {
  uuid?: string;
  is_completed?: boolean;
  is_draft?: boolean;
  step?: number;
};

export type ContractDetailApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: Record<string, unknown>;
};
