import type { PosTransactionResponse } from "../models/dto/PosTransactionResponse";
import type { PosTransactionGenerateAndSendRequest } from "../models/dto/PosTransactionGenerateAndSendRequest";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { PosTransactionService } from "../services/PosTransactionService";

interface PosTransactionState {
    transactions: PosTransactionResponse[];
}

const initialState: PosTransactionState = {
    transactions: [],
};

export const fetchPosTransactions = createAsyncThunk(
    'posTransaction/fetchAll',
    () => PosTransactionService.findAll(),
);

export const uploadPosTransactionBill = createAsyncThunk(
    'posTransaction/upload',
    ({ id, file }: { id: string; file: File }) => PosTransactionService.upload(id, file),
);

export const generateAndSendPosTransactions = createAsyncThunk(
    'posTransaction/generateAndSend',
    (request: PosTransactionGenerateAndSendRequest) => PosTransactionService.generateAndSend(request),
);

const posTransactionSlice = createSlice({
    name: 'posTransaction',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPosTransactions.fulfilled, (state, action) => { state.transactions = action.payload; })
            .addCase(uploadPosTransactionBill.fulfilled, (state, action) => {
                const transaction = state.transactions.find((t) => t.id === action.payload.id);
                if (transaction) transaction.hasBill = true;
            })
    },});

export default posTransactionSlice.reducer;