"use client";

import * as React from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";

export interface AuthCardProps {
    /** e.g. "Welcome back" or "Create an account" */
    title: string;
    /** Label for the submit button */
    submitLabel: string;
    /** Called when form is submitted */
    onSubmit: (e: React.FormEvent) => void;
    /** The form fields to render (inputs, checkboxes, etc.) */
    children: React.ReactNode;
    /** Optional footer link e.g. "Forgot password?" or "Already have an account?" */
    footerLink?: {
        label: string;
        href: string;
    };
    /** Optional loading state for the submit button */
    loading?: boolean;
}

export default function AuthCard({
                                     title,
                                     submitLabel,
                                     onSubmit,
                                     children,
                                     footerLink,
                                     loading = false,
                                 }: AuthCardProps) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}
        >
            <Box
                component="form"
                onSubmit={onSubmit}
                sx={{
                    ...tintedGlass,
                    borderRadius: "24px",
                    p: { xs: "10 px !important", sm: "14px !important" },
                    width: "100%",
                    maxWidth: 360,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                    }}
                >
                    {/* Logo + Brand */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "8px",
                                    bgcolor: "primary.main",
                                    boxShadow: "0px 0px 14px rgba(255,107,0,0.55)",
                                    flexShrink: 0,
                                }}
                            />
                            <Typography
                                variant="body1"
                                fontWeight={800}
                                sx={{ color: "primary.main", letterSpacing: "-0.3px" }}
                            >
                                Forecast Financial
                            </Typography>
                        </Box>

                        <Typography
                            variant="h5"
                            fontWeight={800}
                            sx={{
                                color: "text.primary",
                                letterSpacing: "-0.5px",
                                mt: 0.5,
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>

                    {/* Slot for fields */}
                    {children}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{
                            borderRadius: "12px",
                            py: 1.5,
                            fontWeight: 700,
                            fontSize: "1rem",
                            background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
                            boxShadow: "0px 4px 20px rgba(255,107,0,0.35)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #ff7a1a 0%, #ffa020 100%)",
                                boxShadow: "0px 8px 24px rgba(255,107,0,0.5)",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        {loading ? "Loading..." : submitLabel}
                    </Button>

                    {/* Footer Link */}
                    {footerLink && (
                        <Link
                            href={footerLink.href}
                            underline="hover"
                            sx={{
                                color: "rgba(255,255,255,0.5)",
                                fontSize: "0.85rem",
                                alignSelf: "flex-start",
                                cursor: "pointer",
                                "&:hover": { color: "rgba(255,255,255,0.8)" },
                            }}
                        >
                            {footerLink.label}
                        </Link>
                    )}
                </Box>
            </Box>
        </Box>
    );
}