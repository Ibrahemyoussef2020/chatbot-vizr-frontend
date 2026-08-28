import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    nativeColor: true,
  },
  typography: {
    fontFamily: "var(--font-sans)",
  },
  palette: {
    background: {
      default: "var(--background)",
      paper: "var(--surface)",
    },
    text: {
      primary: "var(--foreground)",
      secondary: "var(--muted-foreground)",
    },
    primary: {
      main: "var(--primary)",
      contrastText: "var(--primary-foreground)",
    },
    secondary: {
      main: "var(--secondary)",
      contrastText: "var(--secondary-foreground)",
    },
    error: { main: "var(--danger)" },
    success: { main: "var(--success)" },
    warning: { main: "var(--warning)" },
    divider: "var(--border)",
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;
