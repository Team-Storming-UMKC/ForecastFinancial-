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
            <Container maxWidth="lg">
                <Toolbar
                    sx={{
                        borderRadius: "16px", // Rounded Rectangle
                        // DARK GLASS EFFECT
                        bgcolor: "rgba(10, 15, 25, 0.7)",
                        backdropFilter: "blur(16px) saturate(150%)",

                        // The "Light Catch" Border
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.4)",

                        py: { xs: 1, md: 1.5 },
                        px: { xs: 3, md: 4 },
                        display: "flex",
                        justifyContent: "space-between",
                        minHeight: "72px",

                        // Ensuring icons/text don't hug the rounded corners
                        "&.MuiToolbar-root": {
                            paddingLeft: { xs: "24px", md: "32px" },
                            paddingRight: { xs: "16px", md: "20px" },
                        },
                    }}
                >
                    {/* Logo Section */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                bgcolor: "primary.main",
                                boxShadow: "0px 0px 15px rgba(255, 107, 0, 0.5)", // Glow
                            }}
                        />
                        <Typography variant="h6" fontWeight={800} component={Link} href="/" sx={{ color: "#fff", letterSpacing: "-0.5px" }}>
                            Forecast
                        </Typography>
                    </Box>

                    {/* Navigation Items */}
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <Button color="inherit" component={Link} href="/login" sx={{ color: "rgba(255,255,255,0.8)" }}>
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            href="/get-started"
                            sx={{
                                borderRadius: "10px",
                                px: 4,
                            }}
                        >
                            Get Started
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}