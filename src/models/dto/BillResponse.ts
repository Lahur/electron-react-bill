import type {DocumentStatus} from "../enums/DocumentStatus";
import type {BillType} from "../enums/BillType";

export interface BillResponse {
  id: string;
  systemId: number;
  fullBillId: string;
  clientName: string;
  clientOib: string;
  billDate: string;
  totalAmount: number;
  documentStatus: DocumentStatus;
  billType: BillType;
  sentCount: number;
}