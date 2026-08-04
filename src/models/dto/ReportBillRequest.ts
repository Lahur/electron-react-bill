import type { BillProfile } from "../enums/BillProfile";
import type { VatCategory } from "../enums/VatCategory";

export interface ReportBillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  baseAmount: number;
  billItemName: string;
  billItemDescription: string;
  billId: number;
  profile: BillProfile;
  vatCategory: VatCategory;
  reference: string;
  buyerName: string;
  buyerStreet: string;
  buyerCity: string;
  buyerPostalZone: string;
}