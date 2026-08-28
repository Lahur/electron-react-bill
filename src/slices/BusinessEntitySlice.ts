import type {BusinessCheckResponse} from "../models/dto/BusinessCheckResponse";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {BusinessEntityService} from "../services/BusinessEntityService";

interface BusinessEntityState {
    checkResult: BusinessCheckResponse | null;
}

const initialState: BusinessEntityState = {
    checkResult: null
};

export const checkBusinessEntityByOib = createAsyncThunk(
    'businessEntity/checkByOib',
    (oib: string) => BusinessEntityService.checkByOib(oib),
);

const businessEntitySlice = createSlice({
    name: 'businessEntity',
    initialState,
    reducers: {
        resetBusinessEntityCheck: (state) => { state.checkResult = null; },
    },
    extraReducers: (builder) => {
        builder
    .addCase(checkBusinessEntityByOib.fulfilled, (state, action) => { state.checkResult = action.payload; })
    },});

export const { resetBusinessEntityCheck } = businessEntitySlice.actions;
export default businessEntitySlice.reducer;