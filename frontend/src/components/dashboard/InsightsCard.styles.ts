import type { SxProps, Theme } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import { tintedGlass } from "@/theme/tintedGlass";

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export const rootSx = {
  ...tintedGlass,
  borderRadius: (theme) => `${theme.customTokens.radii.card}px`,
  p: { xs: 3, md: 3.5 },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
    pointerEvents: "none",
    zIndex: 0,
  },
} satisfies SxProps<Theme>;

export const contentSx = {
  position: "relative",
  zIndex: 1,
  px: { xs: 1, md: 1.5 },
  py: { xs: 1, md: 1.5 },
} satisfies SxProps<Theme>;

export const headerSx = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
} satisfies SxProps<Theme>;

export const titleSx = {
  color: "text.primary",
  letterSpacing: "-0.3px",
  fontWeight: 800,
} satisfies SxProps<Theme>;

export const subtitleSx = {
  color: "rgba(255,255,255,0.55)",
} satisfies SxProps<Theme>;

export const dividerSx = {
  my: 2,
  borderColor: "rgba(255,255,255,0.06)",
} satisfies SxProps<Theme>;

export const listSx = {
  display: "grid",
  gap: 1.5,
  m: 0,
  p: 0,
  listStyle: "none",
} satisfies SxProps<Theme>;

export const listItemSx = {
  display: "flex",
  gap: 1.25,
  alignItems: "baseline",
  color: "rgba(255,255,255,0.84)",
  fontSize: "0.95rem",
  lineHeight: 1.55,
} satisfies SxProps<Theme>;

export const bulletSx = {
  width: 8,
  height: 8,
  minWidth: 8,
  borderRadius: "50%",
  transform: "translateY(-1px)",
  backgroundColor: "primary.main",
  boxShadow: "0 0 12px rgba(255,135,15,0.55)",
} satisfies SxProps<Theme>;

export const loadingLineSx = {
  height: 16,
  borderRadius: 1,
  position: "relative",
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,0.08)",
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)",
    animation: `${shimmer} 1.35s ease-in-out infinite`,
  },
} satisfies SxProps<Theme>;

export const emptySx = {
  color: "rgba(255,255,255,0.45)",
} satisfies SxProps<Theme>;
