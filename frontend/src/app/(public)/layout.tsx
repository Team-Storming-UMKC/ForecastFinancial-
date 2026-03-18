"use client";

import { Box, useTheme } from "@mui/material";
import { usePathname } from "next/navigation";
import PublicNavbar from "@/components/nav/PublicNavbar";
import { getPublicLayoutStyles } from "./layout.styles";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const styles = getPublicLayoutStyles(theme);

    const hideNavbarOn = ["/login", "/get-started"];
    const shouldHideNavbar = hideNavbarOn.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

  return (
    <Box sx={styles.root}>
        {!shouldHideNavbar && <PublicNavbar />}
      <Box sx={styles.content}>{children}</Box>
    </Box>
  );
}
