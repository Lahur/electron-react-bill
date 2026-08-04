export interface PriceInfo {
  vatExclusiveAmount: number;
  vatAmount: number;
  vatInclusiveAmount: number;
  advanceAmount: number | null;
  totalAmount: number | null;
}