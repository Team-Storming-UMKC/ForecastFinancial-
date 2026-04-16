import type { SxProps, Theme } from "@mui/material/styles";
import { cardContentSx, cardSurfaceSx } from "@/theme/tintedGlass";

export const containerSx: SxProps<Theme> = {
  ...cardSurfaceSx,
  p: { xs: 2.5, sm: 3 },
  mb: 2,
};

export const contentSx: SxProps<Theme> = {
  ...cardContentSx,
};

export const headerRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "flex-start" },
  justifyContent: "space-between",
  gap: 1.5,
  mb: 2.5,
  pb: 3,
};

export const titleSx: SxProps<Theme> = {
  color: "text.primary",
  letterSpacing: "-0.3px",
  fontWeight: 700,
};

export const supportingTextSx: SxProps<Theme> = {
  mt: 0.75,
  color: "text.secondary",
  maxWidth: 560,
};

export const stackSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  columnGap: { xs: 0, md: 2 },
  rowGap: { xs: 2.5, md: 4 },
};

export const categoryChipsSx: SxProps<Theme> = {
  gridColumn: "1 / -1",
};

export const submitButtonSx: SxProps<Theme> = {
  minWidth: 120,
  borderRadius: (theme) => `${theme.customTokens.radii.control}px`,
  justifySelf: { xs: "stretch", md: "flex-start" },
  gridColumn: { xs: "1 / -1", md: "auto" },
  mt: { xs: 1, md: 0 },
  py: 1.75,
  fontWeight: 700,
  background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
  boxShadow: "0px 4px 20px rgba(255,107,0,0.35)",
  "&:hover": {
    background: "linear-gradient(135deg, #ff7a1a 0%, #ffa020 100%)",
    boxShadow: "0px 8px 24px rgba(255,107,0,0.5)",
    transform: "translateY(-1px)",
  },
};
