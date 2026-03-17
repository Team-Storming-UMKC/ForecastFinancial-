"use client";

import { Box, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import PublicNavbar from "@/components/nav/PublicNavbar";
import { getPublicLayoutStyles } from "./layout.styles";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const styles = getPublicLayoutStyles(theme);
  

  return (
    <Box sx={styles.root}>
      <PublicNavbar />
      <Box sx={styles.content}>{children}</Box>
    </Box>
  );
}
