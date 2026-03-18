import Image from "next/image";
import { Box, Typography, useTheme } from "@mui/material";
import { getBrandHeaderStyles } from "@/components/auth/BrandHeader.styles";

interface BrandHeaderProps {
  title: string;
}

export default function BrandHeader({ title }: BrandHeaderProps) {
  const theme = useTheme();
  const styles = getBrandHeaderStyles(theme);

  return (
    <Box sx={styles.root}>
      <Box sx={styles.brandRow}>
        <Box sx={styles.logo}>
          <Image src="/logo.svg" alt="Forecast Financial logo" fill style={styles.logoImage} />
        </Box>
        <Typography sx={styles.brandText}>Forecast Financial</Typography>
      </Box>
      <Typography sx={styles.title}>{title}</Typography>
    </Box>
  );
}
