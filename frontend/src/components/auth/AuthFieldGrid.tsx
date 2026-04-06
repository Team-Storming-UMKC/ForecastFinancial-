import * as React from "react";
import { Box, BoxProps, SxProps, Theme, useTheme } from "@mui/material";

interface AuthFieldGridProps extends Omit<BoxProps, "children"> {
  children: React.ReactNode;
  columns?: number;
}

export default function AuthFieldGrid({
  children,
  columns = 2,
  sx,
  ...props
}: AuthFieldGridProps) {
  const theme = useTheme();
  const baseSx: SxProps<Theme> = {
    display: "grid",
    gap: theme.spacing(2),
    gridTemplateColumns: {
      xs: "1fr",
      sm: `repeat(${columns}, minmax(0, 1fr))`,
    },
  };
  const mergedSx: SxProps<Theme> = sx
    ? [baseSx, ...(Array.isArray(sx) ? sx : [sx])]
    : baseSx;

  return (
    <Box
      sx={mergedSx}
      {...props}
    >
      {children}
    </Box>
  );
}
