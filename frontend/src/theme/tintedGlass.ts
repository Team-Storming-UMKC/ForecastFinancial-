import { cardSurfaceTokens } from "./cardSurface";
import type { SxProps, Theme } from "@mui/material/styles";

export const tintedGlass = {
  background: cardSurfaceTokens.background,
  backdropFilter: cardSurfaceTokens.backdropFilter,
  WebkitBackdropFilter: cardSurfaceTokens.backdropFilter,
  border: cardSurfaceTokens.border,
  boxShadow: cardSurfaceTokens.shadow,
};

export const cardHighlight = {
  background: cardSurfaceTokens.highlight,
};

export const cardSurfaceSx = {
  ...tintedGlass,
  borderRadius: (theme) => `${theme.customTokens.radii.card}px`,
  position: "relative",
  overflow: "hidden",
  isolation: "isolate",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    background: (theme) => theme.customTokens.surfaces.cardHighlight,
    pointerEvents: "none",
    zIndex: 0,
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
} satisfies SxProps<Theme>;

export const cardContentSx = {
  position: "relative",
  zIndex: 1,
} satisfies SxProps<Theme>;
