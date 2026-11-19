import type {F1TaxRate} from "../enums/F1TaxRate";
import type {BillItemRequest} from "./BillItemRequest";

export interface F1BillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  items: BillItemRequest[];
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPostalCode: string;
  taxRate: F1TaxRate;
}
