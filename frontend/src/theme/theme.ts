import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // Switch to dark mode
    primary: {
      main: "#ff6b00", // Vibrant Orange
      contrastText: "#ffffff",
    },
    background: {
      default: "#050a15", // Deep midnight blue/black background
      paper: "rgba(15, 20, 30, 0.6)", // Translucent dark glass
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },

  shape: {
    borderRadius: 16, // Slightly more rounded for that "liquid" feel
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "10px 24px",
          textTransform: "none",
          fontWeight: 700,
          // Liquid Glow effect
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 20px rgba(255, 107, 0, 0.4)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(4px)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "#ff6b00",
          },
        },
      },
    },
  },
});

export default theme;