import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./authSlice";
import workspaceReducer from "./workspaceSlice";
import inboxReducer from "./inboxSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
        inbox: inboxReducer,
    },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
