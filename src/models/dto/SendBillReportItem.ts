import type {BillReportType} from "../enums/BillReportType";

export interface SendBillReportItem {
  id: string | number;
  billId: string;
  type: BillReportType;
}