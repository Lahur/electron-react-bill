import type {BillProfile} from "../enums/BillProfile";
import type {VatCategory} from "../enums/VatCategory";
import type {BillItemRequest} from "./BillItemRequest";

export interface ReportBillRequest {
  billDate: string;
  billTime: string;
  dueDate: string;
  note?: string;
  buyerOib: string;
  items: BillItemRequest[];
  billId: number;
  profile: BillProfile;
  vatCategory: VatCategory;
  orderNumber?: string;
  buyerName: string;
  buyerStreet: string;
  buyerCity: string;
  buyerPostalZone: string;
}