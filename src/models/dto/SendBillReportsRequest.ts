import type {SendBillReportItem} from "./SendBillReportItem";

export interface SendBillReportsRequest {
  reports: SendBillReportItem[];
  email: string;
}