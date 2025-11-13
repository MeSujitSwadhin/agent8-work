import { createTheme, responsiveFontSizes, PaletteMode } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    neutral?: { main: string; contrastText?: string };
    surface?: { main: string };
  }
  interface PaletteOptions {
    neutral?: { main: string; contrastText?: string };
    surface?: { main: string };
  }
}

// Function to fetch palette based on mode
const getPalette = (mode: PaletteMode) => ({
  mode,
  primary: {
    main: "#00a181", // Brand green
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#EF752F", // Action red
    contrastText: "#ffffff",
  },
  error: {
    main: "#d32f2f", // Error red
    contrastText: "#ffffff",
  },
  warning: {
    main: "#ff9800", // Warning amber
    contrastText: "#ffffff",
  },
  info: {
    main: "#2196f3", // Information blue
    contrastText: "#ffffff",
  },
  success: {
    main: "#4caf50", // Success green
    contrastText: "#ffffff",
  },
  neutral: {
    main: mode === "dark" ? "#6e6e6e" : "#8c8c8c", // Neutral grey
    contrastText: "#ffffff",
  },
  text: {
    primary: mode === "dark" ? "#ffffff" : "#121212",
    secondary: mode === "dark" ? "#a1a1a1" : "#666666",
    disabled:
      mode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
  },
  background: {
    default: mode === "dark" ? "#121212" : "#f5f5f5",
    paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
  },
  surface: {
    main: mode === "dark" ? "#2b2b2b" : "#e0e0e0",
  },
});

// Integrate Google Fonts in Typography
const theme = createTheme({
  palette: getPalette("dark"),
  typography: {
    fontFamily: `"Inter", "Roboto", "Poppins", Arial, sans-serif`, // Priority order
    allVariants: {
      color: "#ffffff",
    },
    h1: {
      fontSize: "6rem",
      fontWeight: 700,
      lineHeight: 1.167,
      fontFamily: `"Poppins", "Inter", "Roboto", Arial, sans-serif`, // Slight flair for headers
    },
    h2: {
      fontSize: "3.75rem",
      fontWeight: 600,
      lineHeight: 1.2,
      fontFamily: `"Poppins", "Inter", "Roboto", Arial, sans-serif`,
    },
    h3: {
      fontSize: "2.125rem",
      fontWeight: 500,
      lineHeight: 1.235,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      fontFamily: `"Roboto", "Inter", "Poppins", Arial, sans-serif`, // Cleaner for body text
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.43,
      fontFamily: `"Roboto", "Inter", "Poppins", Arial, sans-serif`,
    },
    button: {
      fontWeight: 600,
      textTransform: "uppercase",
      fontFamily: `"Inter", "Roboto", Arial, sans-serif`, // Bold, clear for buttons
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          "&.Mui-uppercase": {
            textTransform: "uppercase",
          },
          "&.Mui-lowercase": {
            textTransform: "lowercase",
          },
          "&.Mui-capitalize": {
            textTransform: "capitalize",
          },
          "&.Mui-disabled": {
            backgroundColor: "#808080",
            color: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.8)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00a181",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00a181",
          },
          "& .MuiInputBase-input": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#a1a1a1",
          "&.Mui-focused": {
            color: "#00a181",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          minHeight: "48px",
        },
        indicator: {
          backgroundColor: "#00a181",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#a1a1a1",
          textTransform: "capitalize",
          fontWeight: 500,
          "&.Mui-selected": {
            color: "#00a181",
            fontWeight: 600,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "inherit", // Use parent color by default
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRadius: "4px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }),
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "#ffffff", // Default icon color
          fontSize: "1.5rem", // Default icon size
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
