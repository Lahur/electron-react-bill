import type {BillProfile} from "../enums/BillProfile";
import type {VatCategory} from "../enums/VatCategory";
import type {BillItemRequest} from "./BillItemRequest";

export interface BillReviewResponse {
  billNumber: string;
  profile: BillProfile;
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  orderNumber?: string;
  buyerOib: string;
  buyerName: string;
  buyerAddress: string;
  buyerCity: string;
  buyerPostalZone: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  pdvType: VatCategory;
  items: BillItemRequest[];
}