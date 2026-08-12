import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import B2BBillSlice from "../slices/B2BBillSlice.ts";
import B2CBillSlice from "../slices/B2CBillSlice.ts";
import B2BReportBillSlice from "../slices/B2BReportBillSlice.ts";
import IngoingBillSlice from "../slices/IngoingBillSlice.ts";
import BusinessEntitySlice from "../slices/BusinessEntitySlice.ts";
import BillInfoSlice from "../slices/BillInfoSlice.ts";
import DocumentSlice from "../slices/DocumentSlice.ts";
import BankStatementSlice from "../slices/BankStatementSlice.ts";
import PosTransactionSlice from "../slices/PosTransactionSlice.ts";
import AccountsStatementSlice from "../slices/AccountsStatementSlice.ts";
import CashWithdrawalBalanceSlice from "../slices/CashWithdrawalBalanceSlice.ts";
import { setDispatch } from "./storeAccessor";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
    b2b: B2BBillSlice,
    b2c: B2CBillSlice,
    b2bReport: B2BReportBillSlice,
    ingoing: IngoingBillSlice,
    businessEntity: BusinessEntitySlice,
    billInfo: BillInfoSlice,
    document: DocumentSlice,
    bankStatement: BankStatementSlice,
    posTransaction: PosTransactionSlice,
    accountsStatement: AccountsStatementSlice,
    cashWithdrawalBalance: CashWithdrawalBalanceSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setDispatch(store.dispatch);