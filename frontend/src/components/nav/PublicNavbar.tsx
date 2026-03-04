"use client";

import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import FloatingNavbar from "@/components/layout/FloatingAppBar";

export default function PublicNavbar() {
    return (
        <FloatingNavbar>
                {/* Logo Section */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            bgcolor: "primary.main",
                            boxShadow: "0px 0px 15px rgba(255,107,0,0.5)",
                        }}
                    />

                    <Typography
                        variant="h6"
                        fontWeight={800}
                        component={Link}
                        href="/"
                        sx={{
                            color: "#fff",
                            letterSpacing: "-0.5px",
                            textDecoration: "none",
                        }}
                    >
                        Forecast
                    </Typography>
                </Box>

                {/* Navigation Items */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button
                        size="large"
                        color="inherit"
                        component={Link}
                        href="/login"
                        sx={{ color: "rgba(255,255,255,0.8)", px: 2, py: 2 }}
                    >
                        Login
                    </Button>

                    <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        component={Link}
                        href="/get-started"
                        sx={{ borderRadius: "10px", px: 2, py: 2 }}
                    >
                        Get Started
                    </Button>
                </Box>
        </FloatingNavbar>
    );
}