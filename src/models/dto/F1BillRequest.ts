import type {F1TaxRate} from "../enums/F1TaxRate";

export interface F1BillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  baseAmount: number;
  billItemName: string;
  billItemDescription: string;
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPostalCode: string;
  taxRate: F1TaxRate;
}
