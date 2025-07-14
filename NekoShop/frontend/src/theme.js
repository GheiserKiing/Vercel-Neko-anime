// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },     // azul corporativo
    secondary: { main: "#f50057" },   // rosa/acento
    background: { default: "#f4f6f8", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    button: { textTransform: "none" },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: "none" } } },
    MuiDrawer: { styleOverrides: { paper: { width: 240 } } },
  },
});

export default theme;
