import type { CSSProperties } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

type BrandHeaderStyles = {
  root: SxProps<Theme>;
  brandRow: SxProps<Theme>;
  logo: SxProps<Theme>;
  logoImage: CSSProperties;
  brandText: SxProps<Theme>;
  title: SxProps<Theme>;
};

export const getBrandHeaderStyles = (theme: Theme): BrandHeaderStyles => ({
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
    color: "primary.main",
  },
  title: {
    color: "text.primary",
    textAlign: "center",
  },
});
