import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { workspaceServices } from "@/services";

export const fetchWorkspaces = createAsyncThunk(
    "workspace/fetchAll",
    async (_options: { force?: boolean } | undefined, { rejectWithValue }) => {
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
    {
        condition: (options, { getState }) => {
            if (options?.force) return true;
            const state = getState() as { workspace?: { items?: unknown[]; loading?: boolean } };
            return !state.workspace?.loading && !state.workspace?.items?.length;
        },
    },
);
