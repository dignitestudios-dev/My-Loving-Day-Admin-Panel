import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/lib/utils/cookies";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{ user: AuthUser | null; token: string | null }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = Boolean(action.payload.token);
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { setCredentials, hydrateAuth, logout } = authSlice.actions;
export default authSlice.reducer;
