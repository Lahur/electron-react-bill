import type { BillResponse } from "../models/dto/BillResponse";
import type { BillReviewResponse } from "../models/dto/BillReviewResponse";
import type { F1BillRequest } from "../models/dto/F1BillRequest";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { F1BillService } from "../services/F1BillService";

interface B2CBillState {
    bills: BillResponse[];
    billReview: BillReviewResponse | null;
}

const initialState: B2CBillState = {
    bills: [],
    billReview: null
};

export const fetchBills = createAsyncThunk(
    'bill/B2C/fetchBills',
    () => F1BillService.getBills(),
);

export const createBill = createAsyncThunk(
    'bill/B2C/create',
    (req: F1BillRequest) => F1BillService.createBill(req)
)

export const cancelBill = createAsyncThunk(
    'bill/B2C/cancel',
    (originalId: number) => F1BillService.cancelBill(originalId)
)

export const reviewBill = createAsyncThunk(
    'bill/B2C/review',
    (req: F1BillRequest) => F1BillService.reviewBill(req)
)

const b2cSlice = createSlice({
    name: 'b2cBill',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBills.fulfilled, (state, action) => { state.bills = action.payload; })
            .addCase(createBill.fulfilled, (state, action) => { state.bills = [...state.bills, action.payload]; })
            .addCase(cancelBill.fulfilled, (state, action) => { state.bills = [...state.bills, action.payload]; })
            .addCase(reviewBill.fulfilled, (state, action) => { state.billReview = action.payload; })
    },
});

export default b2cSlice.reducer;
