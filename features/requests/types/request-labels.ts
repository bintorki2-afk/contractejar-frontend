import type { ContractPaymentMethodLabels } from "@/features/create-contract/hooks/use-contract-payment-method-flow";
import type { RequestIncompleteProgressDialogLabels } from "@/features/requests/components/request-incomplete-progress-dialog";
import type { RequestReceiveContractDialogLabels } from "@/features/requests/components/request-receive-contract-dialog";
import type { RequestDetailsDialogLabels } from "@/features/requests/utils/map-contract-to-request-details";
import type { RequestContractDialogLabels } from "@/features/requests/utils/map-completed-contract-to-details";
import type { RequestInvoiceDialogLabels } from "@/features/requests/types/request-invoice-labels";

export type RequestCardLabels = {
  requestNumberLabel: string;
  copyRequestNumber: string;
  lastUpdatedLabel: string;
  requestStatusLabel: string;
  paymentSuccessful: string;
  awaitingClientPayment: string;
  unitType: {
    residential: string;
    commercial: string;
  };
  contractTypes: {
    housing: string;
    commercial: string;
  };
  viewData: string;
  viewShort: string;
  completeRequest: string;
  draftIncompleteBadge: string;
  incompleteValidityNotice: string;
  editError: string;
  detailsDialog: RequestDetailsDialogLabels;
  contractDialog: RequestContractDialogLabels;
  receiveContractDialog: RequestReceiveContractDialogLabels;
  invoiceDialog: RequestInvoiceDialogLabels;
  incompleteProgressDialog: RequestIncompleteProgressDialogLabels;
  completePayment: string;
  completePaymentWithAmount: string;
  completePaymentLoading: string;
  paymentFlow: ContractPaymentMethodLabels;
  whenReceiveContract: string;
  downloadInvoice: string;
  whatsappLabel: string;
  whatsappHref: string;
  status: {
    completed: string;
    completedWithAmount: string;
    incomplete: string;
    inProgress: string;
    returned: string;
  };
};

export type RequestsHowItWorksStep = {
  title: string;
  description: string;
};

export type RequestLabels = {
  backLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  howItWorks: {
    title: string;
    subtitle: string;
    steps: RequestsHowItWorksStep[];
  };
  searchPlaceholder: string;
  filtersLabel: string;
  emptyState: string;
  filterAll: string;
  tabs: {
    residential: string;
    commercial: string;
  };
  contractTypes: {
    housing: string;
    commercial: string;
  };
  filtersDialog: {
    title: string;
    close: string;
    contractTypeLabel: string;
    requestTypeLabel: string;
    all: string;
    allTypes: string;
    completed: string;
    draftContract: string;
    incomplete: string;
    cancelled: string;
    showResults: string;
  };
  card: RequestCardLabels;
};
