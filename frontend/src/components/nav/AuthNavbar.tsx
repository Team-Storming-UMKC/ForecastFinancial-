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
import FloatingNavbar from "@/components/layout/FloatingAppBar";

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
      <FloatingNavbar>
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
          </FloatingNavbar>
    );
}