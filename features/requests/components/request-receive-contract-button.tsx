"use client";

import { Clock3 } from "lucide-react";
import { useState } from "react";

import RequestReceiveContractDialog, {
  type RequestReceiveContractDialogLabels,
} from "@/features/requests/components/request-receive-contract-dialog";
import type { ContractPaymentMethodLabels } from "@/features/create-contract/hooks/use-contract-payment-method-flow";
import type { RequestActionType } from "@/features/requests/types/request";
import { cn } from "@/lib/utils";

type RequestReceiveContractButtonProps = {
  label: string;
  actionType: RequestActionType;
  contractId: number;
  contractUuid: string;
  contractType?: "residential" | "commercial";
  completePaymentLabel: string;
  completePaymentWithAmountLabel: string;
  completePaymentLoadingLabel: string;
  paymentFlowLabels: ContractPaymentMethodLabels;
  dialogLabels: RequestReceiveContractDialogLabels;
  className?: string;
};

export default function RequestReceiveContractButton({
  label,
  actionType,
  contractId,
  contractUuid,
  contractType,
  completePaymentLabel,
  completePaymentWithAmountLabel,
  completePaymentLoadingLabel,
  paymentFlowLabels,
  dialogLabels,
  className,
}: RequestReceiveContractButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#f3f3f3] px-4 text-sm font-bold text-[#555555] transition-colors hover:bg-[#ebebeb] dark:border-[#262d2c] dark:bg-[#151c1b] dark:text-white dark:hover:bg-[#1a2221]",
          className,
        )}
      >
        <Clock3 className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </button>
      

      <RequestReceiveContractDialog
        open={open}
        onOpenChange={setOpen}
        contractId={contractId}
        contractUuid={contractUuid}
        contractType={contractType}
        actionType={actionType}
        completePaymentLabel={completePaymentLabel}
        completePaymentWithAmountLabel={completePaymentWithAmountLabel}
        completePaymentLoadingLabel={completePaymentLoadingLabel}
        paymentFlowLabels={paymentFlowLabels}
        labels={dialogLabels}
      />
    </>
  );
}
