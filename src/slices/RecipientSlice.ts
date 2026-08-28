import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {RecipientService} from "../services/RecipientService";

interface RecipientState {
  emails: string[];
}

const initialState: RecipientState = {
  emails: [],
};

export const fetchRecipients = createAsyncThunk(
  'recipient/fetchAll',
  () => RecipientService.findAll(),
);

const recipientSlice = createSlice({
  name: 'recipient',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipients.fulfilled, (state, action) => { state.emails = action.payload; })
  },
});

export default recipientSlice.reducer;
