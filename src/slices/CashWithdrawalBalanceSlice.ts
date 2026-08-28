import type {CashWithdrawalBalanceResponse} from "../models/dto/CashWithdrawalBalanceResponse";
import type {CashWithdrawalAccountsStatementRequest} from "../models/dto/CashWithdrawalAccountsStatementRequest";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {CashWithdrawalBalanceService} from "../services/CashWithdrawalBalanceService";

interface CashWithdrawalBalanceState {
    balances: CashWithdrawalBalanceResponse[];
}

const initialState: CashWithdrawalBalanceState = {
    balances: [],
};

export const fetchCashWithdrawalBalances = createAsyncThunk(
    'cashWithdrawalBalance/fetchAll',
    () => CashWithdrawalBalanceService.findAll(),
);

export const createCashWithdrawalAccountsStatement = createAsyncThunk(
    'cashWithdrawalBalance/createAccountsStatement',
    ({ request, file }: { request: CashWithdrawalAccountsStatementRequest; file: File | null }) =>
        CashWithdrawalBalanceService.createAccountsStatement(request, file),
);

const cashWithdrawalBalanceSlice = createSlice({
    name: 'cashWithdrawalBalance',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCashWithdrawalBalances.fulfilled, (state, action) => { state.balances = action.payload; })
            .addCase(createCashWithdrawalAccountsStatement.fulfilled, (state, action) => {
                action.payload.forEach((updated) => {
                    const index = state.balances.findIndex((b) => b.id === updated.id);
                    if (index !== -1) state.balances[index] = updated;
                });
            })
    },});

export default cashWithdrawalBalanceSlice.reducer;