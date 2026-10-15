import type {BankTransactionResponse} from "../models/dto/BankTransactionResponse";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {BankTransactionService} from "../services/BankTransactionService";

interface BankTransactionState {
    transactions: BankTransactionResponse[];
}

const initialState: BankTransactionState = {
    transactions: [],
};

export const fetchBankTransactionsByStatement = createAsyncThunk(
    'bankTransaction/fetchByStatement',
    (bankStatementId: string) => BankTransactionService.findAllByBankStatementId(bankStatementId),
);

const bankTransactionSlice = createSlice({
    name: 'bankTransaction',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBankTransactionsByStatement.pending, (state) => { state.transactions = []; })
            .addCase(fetchBankTransactionsByStatement.fulfilled, (state, action) => { state.transactions = action.payload; })
    },});

export default bankTransactionSlice.reducer;
