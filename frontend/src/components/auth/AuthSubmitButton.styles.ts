import { Theme } from "@mui/material/styles";

export const getAuthSubmitButtonStyles = (theme: Theme) => ({
  root: {
    width: "100%",
    minHeight: 44,
    borderRadius: `${theme.customTokens.radii.control}px`,
    backgroundColor: "primary.main",
    color: "primary.contrastText",
    ...theme.typography.button,
    "&:hover": {
      backgroundColor: "primary.main",
      filter: "brightness(1.05)",
    },
    "&.Mui-disabled": {
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      opacity: 0.6,
    },
  },
});
