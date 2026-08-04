import type { BillDocumentKind } from "../enums/BillDocumentKind";
import type { BillPaymentMethod } from "../enums/BillPaymentMethod";
import type { F1FiscalStatus } from "../enums/F1FiscalStatus";

export interface MainDataInfo {
  billDate: string | null;
  issueDateTime: string | null;
  dueDate: string;
  documentKind: BillDocumentKind;
  paymentMethod: BillPaymentMethod | null;
  fiscalStatus: F1FiscalStatus | null;
  currency: string | null;
  billPeriodFrom: string | null;
  billPeriodTill: string | null;
}