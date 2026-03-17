import { Theme } from "@mui/material/styles";

export const getPublicLayoutStyles = (theme: Theme) => ({
  root: {
    minHeight: "100vh",
    bgcolor: "background.default",
  },
  content: {
    minHeight: "100vh",
  },
});
