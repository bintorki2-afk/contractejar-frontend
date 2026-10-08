import type { ContractPaymentStatusData } from "@/features/create-contract/types/contract-payment";
import { resolvePaidAmountFromStatusPayload } from "@/features/payment/utils/parse-payment-status-amount";
import { hasSuccessfulPayment } from "@/features/payment/utils/resolve-contract-payment-outcome";

export type PaymentStatusUiVariant = "success" | "error";

export type PaymentStatusUiLabels = {
  completedMessage: string;
  failedMessage: string;
};

export type PaymentStatusUiState = {
  variant: PaymentStatusUiVariant;
  message: string;
  statusData: ContractPaymentStatusData | null;
  isPaid: boolean;
};

type RawPaymentStatusPayload = {
  message?: string;
  success?: boolean;
  data?: {
    result: "success" | "error";
    resolved_result?: "success" | "error" | null;
    kind?: string | null;
    contract_uuid: string;
    contract_id: number;
    contract_type?: string | null;
    contract_type_trans?: string | null;
    paid_amount?: number | string | null;
    cart_amount?: number | string | null;
    amount?: number | string | null;
    is_completed: boolean;
    payment_confirmed?: boolean | null;
    employee_paid_record: ContractPaymentStatusData["employeePaidRecord"];
    payment: ContractPaymentStatusData["payment"];
  };
};

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

export function normalizePaymentStatusData(
  data: NonNullable<RawPaymentStatusPayload["data"]>,
): ContractPaymentStatusData {
  return {
    result: data.result,
    resolvedResult: data.resolved_result ?? null,
    kind: asNullableString(data.kind),
    contractUuid: data.contract_uuid,
    contractId: data.contract_id,
    contractType: asNullableString(data.contract_type),
    contractTypeTrans: asNullableString(data.contract_type_trans),
    paidAmount: resolvePaidAmountFromStatusPayload(data),
    isCompleted: data.is_completed,
    paymentConfirmed: data.payment_confirmed ?? null,
    employeePaidRecord: data.employee_paid_record,
    payment: data.payment,
  };
}

export function resolvePaymentStatusUi(
  payload: RawPaymentStatusPayload | null,
  labels: PaymentStatusUiLabels,
): PaymentStatusUiState {
  const statusData = payload?.data ? normalizePaymentStatusData(payload.data) : null;
  const isPaid = hasSuccessfulPayment(statusData);

  if (isPaid) {
    return {
      variant: "success",
      message: payload?.message?.trim() || labels.completedMessage,
      statusData,
      isPaid: true,
    };
  }

  return {
    variant: "error",
    message: labels.failedMessage,
    statusData,
    isPaid: false,
  };
}
