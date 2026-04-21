import { Theme } from "@mui/material/styles";

export const getRegisterPageStyles = (theme: Theme) => ({
  errorText: {
    ...theme.typography.body1,
    color: "error.main",
    fontSize: "0.85rem",
  },
});
