"use client";

import Link from "next/link";
import {
    AppBar,
    Box,
    Button,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Container,
} from "@mui/material";
import { useState } from "react";

export default function AuthNavbar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login";
    };

    const handleSettings = () => {
        window.location.href = "/settings";
    }
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
                    {/* Logo */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: "primary.main" }} />
                        <Typography variant="h6" fontWeight={700} component={Link} href="/dashboard" sx={{ textDecoration: "none", color: "text.primary" }}>
                            Forecast
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Links */}
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Button component={Link} href="/dashboard" color="inherit" sx={{ borderRadius: "20px" }}>Dashboard</Button>
                        <Button component={Link} href="/accounts" color="inherit" sx={{ borderRadius: "20px" }}>Accounts</Button>

                        <IconButton onClick={handleMenuOpen} sx={{ ml: 1, border: "1px solid", borderColor: "divider" }}>
                            <Box sx={{ width: 18, height: 18, bgcolor: "text.primary", borderRadius: "50%" }} />
                        </IconButton>

                        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                            <MenuItem onClick={handleSettings}>Settings</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}