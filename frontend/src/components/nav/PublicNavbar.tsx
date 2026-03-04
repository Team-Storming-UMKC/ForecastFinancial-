"use client";

import Link from "next/link";
import { AppBar, Box, Button, Toolbar, Typography, Container } from "@mui/material";

export default function PublicNavbar() {
    return (
        <AppBar
            position="absolute"
            elevation={0}
            sx={{
                bgcolor: "transparent",
                top: 24,
                left: 0,
                right: 0,
                width: "100%",      // Ensures the AppBar spans the whole screen
                display: "flex",    // Helps with alignment
                alignItems: "center",
                backgroundImage: "none", // Removes MUI default dark mode gradients
            }}
        >
            <Container maxWidth="md">
                <Toolbar
                    sx={{
                        borderRadius: "100px",
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid",
                        borderColor: "divider",

                        px: { xs: 3, sm: 4, md: 5 },
                        "&.MuiToolbar-root": {
                            paddingLeft: { xs: "24px", md: "32px" },
                            paddingRight: { xs: "12px", md: "16px" },
                        },
                        minHeight: { xs: "56px", md: "64px" },

                        display: "flex",
                        justifyContent: "space-between",

                        "&.MuiToolbar-gutters": {
                            px: { xs: 3, md: 5 },
                        },

                    }}
                >
                    {/* Logo */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "primary.main" }} />
                        <Typography variant="h6" fontWeight={700} component={Link} href="/" sx={{ textDecoration: "none", color: "text.primary" }}>
                            Forecast
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button component={Link} href="/login" color="inherit" sx={{ borderRadius: "20px" }}>
                            Login
                        </Button>
                        <Button
                            component={Link}
                            href="/get-started"
                            variant="contained"
                            sx={{ borderRadius: "20px", px: 3 }}
                        >
                            Get Started
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}