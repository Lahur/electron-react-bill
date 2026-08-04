import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: string | null;
}

const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStarted(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSucceeded(state, action: PayloadAction<AuthUser>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailed(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
  },
});

export const { loginStarted, loginSucceeded, loginFailed } = authSlice.actions;
export default authSlice.reducer;