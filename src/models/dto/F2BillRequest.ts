import type {BillProfile} from "../enums/BillProfile";
import type {VatCategory} from "../enums/VatCategory";

export interface F2BillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  baseAmount: number;
  vatCategory: VatCategory;
  billItemName: string;
  billItemDescription: string;
  billId: number;
  profile: BillProfile;
  orderNumber?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
}