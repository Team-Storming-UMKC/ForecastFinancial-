import { Theme } from "@mui/material/styles";

export const getBrandHeaderStyles = (theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
  },
  logo: {
    width: 32,
    height: 32,
    position: "relative",
  },
  logoImage: {
    objectFit: "contain" as const,
  },
  brandText: {
    ...theme.typography.h6,
    color: "primary.main",
  },
  title: {
    ...theme.typography.h3,
    color: "text.primary",
    textAlign: "center",
  },
});
