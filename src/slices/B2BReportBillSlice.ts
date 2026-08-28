import type {BillResponse} from "../models/dto/BillResponse.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {B2BReportBillService} from "../services/B2BReportBillService";
import type {ReportBillRequest} from "../models/dto/ReportBillRequest.ts";
import type {BillReviewResponse} from "../models/dto/BillReviewResponse.ts";

interface BillState {
    bills: BillResponse[];
    billReview: BillReviewResponse | null;
}

const initialState: BillState = {
    bills: [],
    billReview: null
};

export const fetchBills = createAsyncThunk(
    'bill/B2BReport/fetchBills',
    () => B2BReportBillService.getBills(),
);

export const createBill = createAsyncThunk(
    'bill/B2BReport/create',
    ({ request, orderDocument }: { request: ReportBillRequest; orderDocument?: File | null }) =>
        B2BReportBillService.createBill(request, orderDocument)
)

export const cancelBill = createAsyncThunk(
    'bill/B2BReport/cancel',
    ({ originalId, newId }: { originalId: number; newId: number }) => B2BReportBillService.cancelBill(originalId, newId)
)

export const reviewBill = createAsyncThunk(
    'bill/B2BReport/review',
    (req: ReportBillRequest) => B2BReportBillService.reviewBill(req)
)

const b2bReportSlice = createSlice({
    name: 'b2bReportBill',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBills.fulfilled, (state, action) => { state.bills = action.payload; })
            .addCase(createBill.fulfilled, (state, action) => { state.bills = [...state.bills, action.payload]; })
            .addCase(cancelBill.fulfilled, (state, action) => { state.bills = [...state.bills, action.payload]; })
            .addCase(reviewBill.fulfilled, (state, action) => { state.billReview = action.payload; })
    },});

export default b2bReportSlice.reducer;