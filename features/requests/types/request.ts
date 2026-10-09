export type RequestStatus =
  | "completed"
  | "incomplete"
  | "in-progress"
  | "returned";

export type RequestActionType =
  | "none"
  | "help-center"
  | "complete-payment"
  | "dual-actions";

export type RequestCardData = {
  id: string;
  contractId: number;
  contractType: "residential" | "commercial";
  uuid: string;
  title: string;
  date: string;
  lastUpdated: string;
  requestNumber: string;
  step: number;
  status: RequestStatus;
  statusName: string | null;
  statusColor: string | null;
  statusType: "contract" | "draft";
  statusCode: string | null;
  journeyStatus: string | null;
  journeyStatusLabel: string | null;
  paymentSuccessful: boolean;
  /** «تم الاسترجاع · 349 ريال» / «استرجاع جزئي · …» — batch D refunds. */
  refundLabel: string | null;
  paymentStatusLabel: string | null;
  payableAmount: number | null;
  isIncompleteDraft: boolean;
  showViewEdit: boolean;
  showDownloadInvoice: boolean;
  actionType: RequestActionType;
  searchText: string;
};

export type RequestUnitTab = "residential" | "commercial" | "all";
