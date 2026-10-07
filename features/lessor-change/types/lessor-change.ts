import type { BirthDateValue } from "@/features/create-contract/types/owner-step";

export type LessorChangeInfo = {
  fee: number;
  currency: string;
  notice: string;
  required: { key: string; label: string }[];
};

export type LessorChangeInfoApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: LessorChangeInfo;
};

export type LessorChangeStatus =
  | "pending_payment"
  | "paid"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

export type LessorChangeOrder = {
  kind: "lessor_change";
  order_number: string;
  uuid: string;
  status: LessorChangeStatus | string;
  status_label: string;
  fee: number;
  awaiting_payment: boolean;
  payment_url: string | null;
  smart_link?: string | null;
};

export type LessorChangeApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: LessorChangeOrder;
  errors?: Record<string, string[]>;
};

/** Draft of the two-step «تغيير المؤجر» form (kept in component state only). */
export type LessorChangeDraft = {
  oldDeedFiles: File[];
  newDeedFiles: File[];
  newOwnerIdNumber: string;
  newOwnerBirthDate: BirthDateValue;
  notes: string;
  acknowledged: boolean;
};

export const FALLBACK_LESSOR_CHANGE_INFO: LessorChangeInfo = {
  fee: 400,
  currency: "SAR",
  notice: "جميع العقود المرتبطة بالصك القديم ستنتقل إلى الصك الجديد.",
  required: [],
};
