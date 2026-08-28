import type {MainDataInfo} from "./MainDataInfo";
import type {BuyerInfo} from "./BuyerInfo";
import type {SupplierInfo} from "./SupplierInfo";
import type {BillItemInfo} from "./BillItemInfo";
import type {PaymentInfo} from "./PaymentInfo";
import type {FiscalInfo} from "./FiscalInfo";
import type {PriceInfo} from "./PriceInfo";

export interface BillInfoResponse {
  mainDataInfo: MainDataInfo;
  buyerInfo: BuyerInfo;
  supplierInfo: SupplierInfo;
  itemInfos: BillItemInfo[];
  paymentInfo: PaymentInfo | null;
  fiscalInfo: FiscalInfo | null;
  priceInfo: PriceInfo;
}