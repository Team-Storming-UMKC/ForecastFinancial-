import {Box, Toolbar} from "@mui/material";
import PublicNavbar from "@/components/nav/PublicNavbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <PublicNavbar />
        <Box
            component="main"
            sx={{
                pt: { xs: 12, md: 14 },
                px: { xs: 2, md: 0 },
            }}
        >{children}</Box>
    </Box>
  );
}
