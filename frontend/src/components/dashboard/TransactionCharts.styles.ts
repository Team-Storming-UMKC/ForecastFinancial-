import type { SxProps, Theme } from "@mui/material/styles";
import { cardContentSx, cardSurfaceSx } from "@/theme/tintedGlass";

export const rootSx: SxProps<Theme> = {
  ...cardSurfaceSx,
  p: { xs: 2, md: 3 },
};

export const contentSx: SxProps<Theme> = {
  ...cardContentSx,
  backgroundColor: "transparent",
  borderRadius: 0,
  px: { xs: 1.5, md: 2 },
  py: { xs: 1.5, md: 2 },
  border: "none",
};

export const headerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 2,
  mb: 1,
};

export const titleSx: SxProps<Theme> = {
  color: "text.primary",
  letterSpacing: "-0.3px",
  fontWeight: 800,
};

export const subtitleSx: SxProps<Theme> = {
  color: "rgba(255,255,255,0.55)",
};

export const toggleButtonSx: SxProps<Theme> = {
  color: "rgba(255,255,255,0.5)",
  borderColor: "rgba(255,255,255,0.1)",
  fontWeight: 700,
  fontSize: 12,
  px: 1.5,
  "&.Mui-selected": {
    color: "#fff",
    bgcolor: "rgba(255,107,0,0.25)",
    borderColor: "rgba(255,107,0,0.4)",
    "&:hover": { bgcolor: "rgba(255,107,0,0.35)" },
  },
  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
};

export const dividerSx: SxProps<Theme> = {
  my: 2,
  borderColor: "rgba(255,255,255,0.06)",
};

export const loadingSx: SxProps<Theme> = {
  py: 6,
  display: "flex",
  justifyContent: "center",
};

export const emptySx: SxProps<Theme> = {
  color: "rgba(255,255,255,0.4)",
};

export const chartGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
  gap: { xs: 1.75, md: 2 },
};
