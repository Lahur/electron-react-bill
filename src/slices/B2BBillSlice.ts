import type {BillResponse} from "../models/dto/BillResponse.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {F2BillService} from "../services/F2BillService";
import type {F2BillRequest} from "../models/dto/F2BillRequest.ts";
import type {BillReviewResponse} from "../models/dto/BillReviewResponse.ts";
import type {BillSearchParams} from "../models/dto/BillSearchParams.ts";

interface BillState {
    bills: BillResponse[];
    billReview: BillReviewResponse | null;
}

const initialState: BillState = {
    bills: [],
    billReview: null
};

export const fetchOutgoingBills = createAsyncThunk(
    'bill/B2B/fetchOutgoing',
    () => F2BillService.getBills(),
);

export const fetchBillsFilter = createAsyncThunk(
    'bill/B2B/fetchBillsFilter',
    (params: BillSearchParams) => F2BillService.getBillsFilter(params),
);

export const createBill = createAsyncThunk(
    'bill/B2B/create',
    ({ request, orderDocument }: { request: F2BillRequest; orderDocument?: File | null }) =>
        F2BillService.createBill(request, orderDocument)
)

export const reviewBill = createAsyncThunk(
    'bill/B2B/review',
    (req: F2BillRequest) => F2BillService.reviewBill(req)
)

const b2bSlice = createSlice({
    name: 'b2bBill',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
    .addCase(fetchOutgoingBills.fulfilled, (state, action) => { state.bills = action.payload; })
            .addCase(fetchBillsFilter.fulfilled, (state, action) => { state.bills = action.payload; })
            .addCase(createBill.fulfilled, (state, action) => { state.bills = [...state.bills, action.payload]; })
            .addCase(reviewBill.fulfilled, (state, action) => { state.billReview = action.payload; })
    },});

export default b2bSlice.reducer;

