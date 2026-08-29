import type {BusinessCheckResponse} from "../models/dto/BusinessCheckResponse";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {BusinessEntityService} from "../services/BusinessEntityService";

interface BusinessEntityState {
    checkResult: BusinessCheckResponse | null;
    checkedOib: string | null;
}

const initialState: BusinessEntityState = {
    checkResult: null,
    checkedOib: null
};

export const checkBusinessEntityByOib = createAsyncThunk(
    'businessEntity/checkByOib',
    (oib: string) => BusinessEntityService.checkByOib(oib),
);

const businessEntitySlice = createSlice({
    name: 'businessEntity',
    initialState,
    reducers: {
        resetBusinessEntityCheck: (state) => { state.checkResult = null; state.checkedOib = null; },
    },
    extraReducers: (builder) => {
        builder
    .addCase(checkBusinessEntityByOib.fulfilled, (state, action) => { state.checkResult = action.payload; state.checkedOib = action.meta.arg; })
    },});

export const { resetBusinessEntityCheck } = businessEntitySlice.actions;
export default businessEntitySlice.reducer;