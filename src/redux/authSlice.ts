import { createSlice } from "@reduxjs/toolkit";
import {
  checkAuthStatus,
  login,
  signup,
  logout,
} from "./authThunk";

import { authHelpers } from "@/helpers";

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: "super_admin" | "admin" | "agent";
  workspaceId?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },

    clearAuth: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Check status
      .addCase(checkAuthStatus.pending, authHelpers.handlePending)
      .addCase(checkAuthStatus.fulfilled, authHelpers.handleCheckAuthFulfilled)
      .addCase(checkAuthStatus.rejected, authHelpers.handleCheckAuthRejected)

      // Login
      .addCase(login.pending, authHelpers.handlePending)
      .addCase(login.fulfilled, authHelpers.handleAuthFulfilled)
      .addCase(login.rejected, authHelpers.handleRejected)

      // Signup
      .addCase(signup.pending, authHelpers.handlePending)
      .addCase(signup.fulfilled, authHelpers.handleAuthFulfilled)
      .addCase(signup.rejected, authHelpers.handleRejected)

      // Logout
      .addCase(logout.pending, authHelpers.handlePending)
      .addCase(logout.fulfilled, authHelpers.handleLogoutFulfilled)
      .addCase(logout.rejected, authHelpers.handleRejected);
  },
});

export const { setUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
