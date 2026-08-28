import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "@/redux/authSlice";

export const handlePending = (state: AuthState) => {
    state.loading = true;
    state.error = null;
};

export const handleRejected = (
    state: AuthState,
    action: PayloadAction<unknown>
) => {
    state.loading = false;
    state.error = action.payload as string;
};

export const handleAuthFulfilled = (
    state: AuthState,
    action: PayloadAction<User>
) => {
    state.loading = false;
    state.user = action.payload;
    state.isLoggedIn = true;
};

export const handleLogoutFulfilled = (state: AuthState) => {
    state.loading = false;
    state.user = null;
    state.isLoggedIn = false;
};

export const handleCheckAuthFulfilled = (
    state: AuthState,
    action: PayloadAction<User | null>
) => {
    state.loading = false;
    state.user = action.payload;
    state.isLoggedIn = !!action.payload;
};

export const handleCheckAuthRejected = (
    state: AuthState,
    action: PayloadAction<unknown>
) => {
    state.loading = false;
    state.user = null;
    state.isLoggedIn = false;
    state.error = action.payload as string;
};