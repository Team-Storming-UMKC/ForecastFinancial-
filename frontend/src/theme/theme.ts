import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    customTokens: {
      surfaces: {
        pageGradient: string;
        authCard: string;
      };
      borders: {
        subtle: string;
        input: string;
      };
      radii: {
        card: number;
        control: number;
      };
      elevation: {
        authCardInset: string;
      };
      text: {
        placeholder: string;
        link: string;
        input: string;
        linkMuted: string;
      };
    };
  }

  interface ThemeOptions {
    customTokens?: {
      surfaces?: {
        pageGradient?: string;
        authCard?: string;
      };
      borders?: {
        subtle?: string;
        input?: string;
      };
      radii?: {
        card?: number;
        control?: number;
      };
      elevation?: {
        authCardInset?: string;
      };
      text?: {
        placeholder?: string;
        link?: string;
        input?: string;
        linkMuted?: string;
      };
    };
  }
}

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ff870f",
      contrastText: "#ffffff",
    },
    background: {
      default: "#1f2124",
      paper: "rgba(255, 255, 255, 0.02)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
    },
    divider: "rgba(255, 255, 255, 0.05)",
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-inter), Inter, sans-serif",
    h3: {
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "0",
    },
    h5: {
      fontSize: "1.875rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "0",
    },
    h6: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "-0.01em",
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "0",
    },
    button: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1,
      textTransform: "none",
      letterSpacing: "0",
    },
  },
  customTokens: {
    surfaces: {
      pageGradient: "radial-gradient(circle at 10% 10%, #26282d 0%, #1f2124 60%, #1b1d20 100%)",
      authCard: "rgba(255, 255, 255, 0.02)",
    },
    borders: {
      subtle: "0.5px solid rgba(255, 255, 255, 0.05)",
      input: "1px solid #d9d9d9",
    },
    radii: {
      card: 23,
      control: 8,
    },
    elevation: {
      authCardInset:
        "inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
    },
    text: {
      placeholder: "#b3b3b3",
      link: "#ffffff",
      input: "#1f2124",
      linkMuted: "rgba(255, 255, 255, 0.85)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1f2124",
          backgroundImage:
            "radial-gradient(circle at 10% 10%, #26282d 0%, #1f2124 60%, #1b1d20 100%)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
        },
        input: {
          padding: "12px 16px",
          color: "#1f2124",
        },
        notchedOutline: {
          border: "1px solid #d9d9d9",
        },
      },
    },
  },
});

export default theme;