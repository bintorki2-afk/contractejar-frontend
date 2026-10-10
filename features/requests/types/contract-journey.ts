import type { OrderJourneySideState } from "@/features/requests/data/order-journey";
import type { RefundInfo } from "@/features/requests/utils/resolve-refund";
import type { ContractCharge, PaymentState, PendingDataRequest } from "@/features/requests/types/payment-state";

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
  /** Employee who did the step (دفعة هـ). */
  by?: string | null;
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
  /** Journey sentence from the API (falls back to the shared constant). */
  journey_sentence?: string | null;
  /** دفعة هـ: ملغي / مسترجع — يحل محل تقدّم الرحلة. */
  journey_side_state?: OrderJourneySideState | null;
};

export type ContractDetail = ContractStatusSnapshot & {
  uuid?: string;
  /** Batch D refunds (`status`/`status_key` = refunded, or a partial refund amount). */
  refund?: RefundInfo;
  is_completed?: boolean;
  is_draft?: boolean;
  step?: number;
  /** دفعة هـ (E2/E5): حالة الدفع من الخادم — الواجهة لا تحسب أي مبلغ. */
  payment_state?: PaymentState | null;
  /** دفعة هـ (E5): الرسوم الإضافية / فروقات السعر (المعلّقة والمدفوعة). */
  charges?: ContractCharge[];
  /** دفعة هـ (E4): طلبات المرفق الناقص المفتوحة. */
  pending_data_requests?: PendingDataRequest[];
};

export type ContractDetailApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: Record<string, unknown>;
};
