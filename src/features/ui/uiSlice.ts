import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("theme");
  return saved === "dark" ? "dark" : "light";
}

interface UiState {
  theme: Theme;
  isSidebarExpanded: boolean;
  isMobileSidebarOpen: boolean;
  isSidebarHovered: boolean;
  openSubmenuIndex: number | null;
}

const initialState: UiState = {
  theme: getInitialTheme(),
  isSidebarExpanded: true,
  isMobileSidebarOpen: false,
  isSidebarHovered: false,
  openSubmenuIndex: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    toggleSidebar(state) {
      state.isSidebarExpanded = !state.isSidebarExpanded;
    },
    toggleMobileSidebar(state) {
      state.isMobileSidebarOpen = !state.isMobileSidebarOpen;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isMobileSidebarOpen = action.payload;
    },
    setSidebarHovered(state, action: PayloadAction<boolean>) {
      state.isSidebarHovered = action.payload;
    },
    toggleSubmenu(state, action: PayloadAction<number>) {
      state.openSubmenuIndex =
        state.openSubmenuIndex === action.payload ? null : action.payload;
    },
    setSubmenuOpen(state, action: PayloadAction<number | null>) {
      state.openSubmenuIndex = action.payload;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setSidebarHovered,
  toggleSubmenu,
  setSubmenuOpen,
} = uiSlice.actions;

export default uiSlice.reducer;