"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    Divider,
} from "@mui/material";
import { KeyboardArrowDown, SettingsOutlined, LogoutOutlined } from "@mui/icons-material";
import { useState, useMemo } from "react";
import FloatingNavbar from "@/components/layout/FloatingAppBar";
import SegmentedControl from "@/components/SegmentedControl";

export default function AuthNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Determine active segmented control based on current path
    const activeNav = useMemo(() => {
        if (pathname.includes("dashboard")) return "dashboard";
        if (pathname.includes("transactions")) return "transactions";
        if (pathname.includes("recurring")) return "recurring";
        return "dashboard";
    }, [pathname]);

    const handleNavChange = (id: string) => {
        const routes: Record<string, string> = {
            dashboard: "/dashboard",
            transactions: "/transactions",
            recurring: "/recurring-bills",
        };
        router.push(routes[id]);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        window.location.href = "/login";
    };

    const handleSettings = () => {
        handleMenuClose();
        window.location.href = "/settings";
    };

    return (
        <FloatingNavbar>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 32, height: 32, position: "relative" }}>
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        fill
                        style={{ objectFit: "contain", borderRadius: "6px" }}
                    />
                </Box>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    component={Link}
                    href="/dashboard"
                    sx={{ textDecoration: "none", color: "primary.main" }}
                >
                    Forecast Financial
                </Typography>
            </Box>

            {/* Navigation Segmented Control + Avatar */}
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                {/* Segmented Control */}
                <SegmentedControl
                    items={[
                        { id: "dashboard", label: "Dashboard" },
                        { id: "transactions", label: "Transactions" },
                        { id: "recurring", label: "Recurring Bills" },
                    ]}
                    activeId={activeNav}
                    onChange={handleNavChange}
                />

                {/* Avatar + Arrow trigger */}
                <Box
                    onClick={handleMenuOpen}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.5,
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        bgcolor: open ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                            bgcolor: "rgba(255,255,255,0.08)",
                            borderColor: "rgba(255,255,255,0.2)",
                        },
                    }}
                >
                    {/* Avatar circle */}
                    <Box
                        sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            boxShadow: "0px 0px 8px rgba(255,107,0,0.4)",
                        }}
                    />
                    <KeyboardArrowDown
                        sx={{
                            fontSize: 18,
                            color: "rgba(255,255,255,0.5)",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                        }}
                    />
                </Box>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 180,
                                borderRadius: "14px",
                                bgcolor: "background.paper",
                                color: "text.primary",
                                backdropFilter: "blur(22px)",
                                WebkitBackdropFilter: "blur(22px)",
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                                overflow: "hidden",
                            },
                        },
                    }}
                >
                    <MenuItem
                        onClick={handleSettings}
                        sx={{
                            gap: 1.5,
                            py: 1.25,
                            px: 2,
                            color: "text.primary",
                            fontSize: 14,
                            fontWeight: 600,
                            "&:hover": {
                                bgcolor: "action.hover",
                                color: "text.primary",
                            },
                        }}
                    >
                        <SettingsOutlined sx={{ fontSize: 18, opacity: 0.7 }} />
                        Settings
                    </MenuItem>

                    <Divider sx={{ borderColor: "divider", mx: 1 }} />

                    <MenuItem
                        onClick={handleLogout}
                        sx={{
                            gap: 1.5,
                            py: 1.25,
                            px: 2,
                            color: "error.light",
                            fontSize: 14,
                            fontWeight: 600,
                            "&:hover": {
                                bgcolor: "action.hover",
                                color: "error.main",
                            },
                        }}
                    >
                        <LogoutOutlined sx={{ fontSize: 18 }} />
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </FloatingNavbar>
    );
}