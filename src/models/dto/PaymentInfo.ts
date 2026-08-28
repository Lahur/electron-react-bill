import type {BillPaymentMethod} from "../enums/BillPaymentMethod";

export interface PaymentInfo {
  paymentMethod: BillPaymentMethod;
  dueDate: string;
  iban: string;
  model: string;
  reference: string;
  note: string;
}