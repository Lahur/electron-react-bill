import type { BillReportType } from "../enums/BillReportType";

export interface SendBillReportItem {
  id: number;
  billId: string;
  type: BillReportType;
}