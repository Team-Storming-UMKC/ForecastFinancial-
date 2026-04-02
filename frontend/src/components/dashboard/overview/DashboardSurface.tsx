import * as React from "react";
import { Box, BoxProps, SxProps, Theme, useTheme } from "@mui/material";

export default function DashboardSurface({ sx, children, ...props }: BoxProps) {
  const theme = useTheme();
  const baseSx: SxProps<Theme> = {
    position: "relative",
    overflow: "hidden",
    borderRadius: `${theme.customTokens.radii.card}px`,
    border: theme.customTokens.borders.subtle,
    backgroundColor: theme.customTokens.surfaces.authCard,
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    boxShadow:
      "inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.25)",
  };
  const mergedSx: SxProps<Theme> = sx
    ? [baseSx, ...(Array.isArray(sx) ? sx : [sx])]
    : baseSx;

  return (
    <Box
      sx={mergedSx}
      {...props}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</Box>
    </Box>
  );
}
