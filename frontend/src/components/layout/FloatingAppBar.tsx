"use client";

import * as React from "react";
import { AppBar, Toolbar, Box, AppBarProps } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";
export default function FloatingNavbar({ children, sx, ...props }: AppBarProps) {
    return (
        <AppBar
            position="absolute"
            elevation={0}
            {...props}
            sx={{
                top: { xs: 8, sm: 12, md: 16 },
                left: "50%",
                transform: "translateX(-50%)",

                width: {
                    xs: "calc(100% - 16px)",
                    sm: "calc(100% - 32px)",
                    md: "calc(100% - 64px)",
                },

                bgcolor: "transparent",
                backgroundImage: "none",
                ...sx,
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    borderRadius: "16px",
                    minHeight: "72px",
                    ...tintedGlass,
                    position: "relative",
                    overflow: "hidden",
                    alignItems : "center",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 60%)",
                        opacity: 0.35,
                        pointerEvents: "none",
                        zIndex: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pl: { xs: 1.5, sm: 2, md: 3 },
                        pr: { xs: 1, md: 1 },
                        py: 1,
                        gap: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    {children}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
