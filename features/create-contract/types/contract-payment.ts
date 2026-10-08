export type ContractPaymentData = {
  paymentUrl: string;
  paymentSuccessUrl: string | null;
  paymentErrorUrl: string | null;
  invoiceId: string | null;
  contractUuid: string;
  cartAmount: number | null;
};

export type ContractPaymentGatewayRecord = {
  status?: string | null;
  amount?: number | string | null;
};

export type ContractEmployeePaidRecord = {
  is_paid?: boolean | number | null;
};

export type ContractPaymentStatusData = {
  result: "success" | "error";
  resolvedResult?: "success" | "error" | null;
  /** `contract` (default) or `lessor_change` — drives the success copy. */
  kind?: "contract" | "lessor_change" | string | null;
  contractUuid: string;
  contractId: number;
  contractType: string | null;
  contractTypeTrans: string | null;
  paidAmount: number | null;
  isCompleted: boolean;
  paymentConfirmed?: boolean | null;
  employeePaidRecord: ContractEmployeePaidRecord | null;
  payment: ContractPaymentGatewayRecord | null;
};

export type ContractPaymentApiResponse = {
  Payment_url?: string;
  payment_url?: string;
  payment_success_url?: string;
  payment_error_url?: string;
  invoice_id?: string;
  contract_uuid?: string;
  cart_amount?: number;
  message?: string;
  success?: boolean;
  data?: {
    Payment_url?: string;
    payment_url?: string;
    payment_success_url?: string;
    payment_error_url?: string;
    invoice_id?: string;
    contract_uuid?: string;
    cart_amount?: number;
  };
};

export type ContractPaymentStatusApiResponse = {
  message: string;
  code: number;
  success: boolean;
  data?: {
    result: "success" | "error";
    resolved_result?: "success" | "error" | null;
    contract_uuid: string;
    contract_id: number;
    contract_type?: string | null;
    contract_type_trans?: string | null;
    paid_amount?: number | string | null;
    cart_amount?: number | string | null;
    amount?: number | string | null;
    is_completed: boolean;
    payment_confirmed?: boolean | null;
    employee_paid_record: unknown;
    payment: unknown;
  };
};
