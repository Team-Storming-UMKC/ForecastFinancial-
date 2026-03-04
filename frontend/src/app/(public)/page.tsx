import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: { xs: 6, md: 10 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        Landing Page
      </Typography>
    </Box>
  );
}
