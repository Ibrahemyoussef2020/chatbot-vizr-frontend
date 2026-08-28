import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { store, checkAuthStatusAsync } from "./redux";
import router from "./router";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

// Initial authentication check on app load
store.dispatch(checkAuthStatusAsync());

if (import.meta.env.DEV) {
  localStorage.removeItem("tanstack_devtools_state");
  localStorage.removeItem("tanstack_devtools_settings");
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
        <TanStackDevtools
          config={{
            defaultOpen: false,
            hideUntilHover: true,
            position: "bottom-right",
            triggerMode: "fixed",
            inspectHotkey: ["Alt"],
            sourceAction: "ide-warp",
          }}
        />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
