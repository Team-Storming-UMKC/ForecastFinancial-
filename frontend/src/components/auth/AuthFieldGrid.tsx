import * as React from "react";
import { Box, BoxProps, useTheme } from "@mui/material";

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

  return (
    <Box
      sx={[
        {
          display: "grid",
          gap: theme.spacing(2),
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${columns}, minmax(0, 1fr))`,
          },
        },
        sx,
      ]}
      {...props}
    >
      {children}
    </Box>
  );
}
