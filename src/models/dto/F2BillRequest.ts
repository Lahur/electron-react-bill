import type {BillProfile} from "../enums/BillProfile";
import type {VatCategory} from "../enums/VatCategory";
import type {BillItemRequest} from "./BillItemRequest";

export interface F2BillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  items: BillItemRequest[];
  vatCategory: VatCategory;
  billId: number;
  profile: BillProfile;
  orderNumber?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerPostalCode?: string;
}