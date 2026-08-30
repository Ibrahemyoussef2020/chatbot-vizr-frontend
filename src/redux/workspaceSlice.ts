import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Workspace } from "@/services/core/workspace";
import { fetchWorkspaces } from "./workspaceThunk";

interface WorkspaceState {
    items: Workspace[];
    active: Workspace | null;
    loading: boolean;
    error: string | null;
}

const initialState: WorkspaceState = {
    items: [],
    active: null,
    loading: false,
    error: null,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setActiveWorkspace: (state, action: PayloadAction<Workspace>) => {
            state.active = action.payload;
            localStorage.setItem("active_workspace", action.payload.slug);
        },
        clearWorkspaces: (state) => {
            state.items = [];
            state.active = null;
            state.error = null;
            localStorage.removeItem("active_workspace");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;

                const savedSlug = localStorage.getItem("active_workspace");
                state.active = action.payload.find((item) => item.slug === savedSlug)
                    ?? action.payload[0]
                    ?? null;
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.error = String(action.payload || "Could not load workspaces");
            });
    },
});

export const { clearWorkspaces, setActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
