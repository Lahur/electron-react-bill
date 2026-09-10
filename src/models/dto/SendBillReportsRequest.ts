import type {SendBillReportItem} from "./SendBillReportItem";

export interface SendBillReportsRequest {
  reports: SendBillReportItem[];
  email: string;
  /**
   * When true, each generated PDF is attached individually to the email.
   * When false (default), they are merged into a single document.
   * The backend rejects individual sends of more than 6 reports.
   */
  separated?: boolean;
}