import { Box } from "@mui/material";
import AuthNavbar from "@/components/nav/AuthNavbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
            <AuthNavbar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", // This centers the Container
                    pt: { xs: 6, md: 12 },
                    px: { xs: 2, md: 0 },
                    gap: 4,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
