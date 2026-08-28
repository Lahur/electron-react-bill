import type {UnitOfMeasure} from "../enums/UnitOfMeasure";
import type {BillVatRate} from "../enums/BillVatRate";

export interface BillItemInfo {
  name: string;
  description: string;
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
  unitPrice: number | null;
  baseAmount: number;
  totalAmount: number;
  taxAmount: number | null;
  vatRate: BillVatRate;
  currency: string | null;
}