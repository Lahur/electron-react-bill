import type {BillResponse} from "../models/dto/BillResponse.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {IngoingBillService} from "../services/IngoingBillService";
import {DocumentStatus} from "../models/enums/DocumentStatus";

interface IngoingBillState {
    bills: BillResponse[];
}

const initialState: IngoingBillState = {
    bills: [],
};

export const fetchBills = createAsyncThunk(
    'bill/Ingoing/fetchBills',
    () => IngoingBillService.getBills(),
);

export const markAsPaid = createAsyncThunk(
    'bill/Ingoing/markAsPaid',
    async (id: number) => {
        await IngoingBillService.markAsPaid(id);
        return id;
    },
);

const ingoingSlice = createSlice({
    name: 'ingoingBill',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBills.fulfilled, (state, action) => { state.bills = action.payload; })
            .addCase(markAsPaid.fulfilled, (state, action) => {
                const bill = state.bills.find((b) => b.systemId === action.payload);
                if (bill) bill.documentStatus = DocumentStatus.PlacenUPotpunosti;
            })
    },});

export default ingoingSlice.reducer;