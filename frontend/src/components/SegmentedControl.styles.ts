import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

type SegmentedControlStyles = {
  container: SxProps<Theme>;
  indicator: SxProps<Theme>;
  item: SxProps<Theme>;
  itemActive: SxProps<Theme>;
};

export const getSegmentedControlStyles = (theme: Theme): SegmentedControlStyles => ({
  container: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    borderRadius: theme.customTokens.radii.card,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    width: "fit-content",
    height: "fit-content",
    overflow: "hidden",
  },
  indicator: {
    position: "absolute",
    top: theme.spacing(0.5),
    left: 0,
    height: theme.spacing(4),
    borderRadius: theme.customTokens.radii.card,
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[1],
    transition: "transform 0.3s ease, width 0.3s ease, opacity 0.2s ease",
    zIndex: 0,
  },
  item: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${theme.spacing(1.5)}`,
    height: theme.spacing(4),
    borderRadius: theme.customTokens.radii.card,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "color 0.3s ease, opacity 0.2s ease",
    typography: "body1",
    fontWeight: 500,
    color: theme.palette.text.primary,
    "&:hover": {
      opacity: 0.8,
    },
    "&:active": {
      opacity: 0.7,
    },
  },
  itemActive: {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    "&:hover": {
      opacity: 1,
    },
  },
});
