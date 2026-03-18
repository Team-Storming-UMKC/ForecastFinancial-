import { Theme } from "@mui/material/styles";

export const getSegmentedControlStyles = (theme: Theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px",
    borderRadius: "23px",
    backgroundColor: "rgba(255, 135, 15, 0.05)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    width: "fit-content",
    height: "fit-content",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
    height: "32px",
    borderRadius: "23px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ...theme.typography.body1,
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
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      opacity: 1,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
  },
});
