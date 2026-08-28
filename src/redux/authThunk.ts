import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { authServices } from "@/services";

const extractErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            fallback
        );
    }
    if (error instanceof Error) {
        return error.message;
    }
    return fallback;
};

export const checkAuthStatus = createAsyncThunk(
    "auth/checkStatus",
    async (_, { rejectWithValue }) => {
        try {
            const data = await authServices.checkAuthStatus();
            const user = data?.userInfo;

            if (user?.email && user?.name) {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    workspaceId: user.workspaceId,
                };
            }

            return null;
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, "Failed to authenticate"));
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const data = await authServices.loginUser(email, password);

            if (!data) {
                return rejectWithValue("Unable to login");
            }

            const user = data.userInfo;
            if (data.accessToken) localStorage.setItem("token", data.accessToken);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId,
            };
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, "Failed to login"));
        }
    }
);

export const signup = createAsyncThunk(
    "auth/signup",
    async (
        { name, email, password }: {
            name: string;
            email: string;
            password: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const data = await authServices.signupUser(
                name,
                email,
                password
            );

            if (!data) {
                return rejectWithValue("Unable to signup");
            }

            const user = data.userInfo;
            if (data.accessToken) localStorage.setItem("token", data.accessToken);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                workspaceId: user.workspaceId,
            };
        } catch (error: unknown) {
            return rejectWithValue(extractErrorMessage(error, "Failed to signup"));
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authServices.logoutUser();
            localStorage.removeItem("token");
        } catch (error: unknown) {
            localStorage.removeItem("token");
            return rejectWithValue(extractErrorMessage(error, "Failed to logout"));
        }
    }
);

export const loginAsync = login;
export const logoutAsync = logout;
export const checkAuthStatusAsync = checkAuthStatus;
export const signupAsync = signup;
