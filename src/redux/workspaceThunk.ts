import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { workspaceServices } from "@/services";

export const fetchWorkspaces = createAsyncThunk(
    "workspace/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await workspaceServices.getWorkspaces();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || "Could not load workspaces",
                );
            }

            return rejectWithValue("Could not load workspaces");
        }
    },
);
