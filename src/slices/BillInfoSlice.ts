import type {BillInfoResponse} from "../models/dto/BillInfoResponse.ts";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {F1BillService} from "../services/F1BillService";
import {F2BillService} from "../services/F2BillService";
import {B2BReportBillService} from "../services/B2BReportBillService";
import {IngoingBillService} from "../services/IngoingBillService";

export type BillInfoType = "f1" | "f2" | "b2b-report" | "ingoing";

interface BillInfoState {
    billInfo: BillInfoResponse | null;
}

const initialState: BillInfoState = {
    billInfo: null
};

export const getBillInfo = createAsyncThunk(
    'bill/getBillInfo',
    ({ billType, id }: { billType: BillInfoType; id: string }) => {
        switch (billType) {
            case "f1":
                return F1BillService.getBillInfo(Number(id));
            case "f2":
                return F2BillService.getBillInfo(Number(id));
            case "b2b-report":
                return B2BReportBillService.getBillInfo(id);
            case "ingoing":
                return IngoingBillService.getBillInfo(Number(id));
        }
    }
)

const billInfoSlice = createSlice({
    name: 'billInfo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getBillInfo.fulfilled, (state, action) => { state.billInfo = action.payload; })
    },
});

export default billInfoSlice.reducer;