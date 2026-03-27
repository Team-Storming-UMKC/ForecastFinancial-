"use client";

import { motion } from "framer-motion";
import { Button, Stack, Typography } from "@mui/material";

interface HeroTextProps {
    eyebrow: string;
    title: string;
    subtitle: string;
    showButton?: boolean;
    dark?: boolean;
}

export default function HeroText({
                                     eyebrow,
                                     title,
                                     subtitle,
                                     showButton = false,
                                     dark = false,
                                 }: HeroTextProps) {
    return (
        <Stack
            spacing={2.5}
            alignItems="center"
            textAlign="center"
            sx={{
                pt: { xs: 14, md: 8 },
                pb: { xs: 24, md: 26 },
            }}
        >
            <Typography
                sx={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: dark ? "rgba(255,255,255,0.7)" : "rgba(255,210,140,0.95)",
                }}
            >
                {eyebrow}
            </Typography>

            <Typography
                sx={{
                    fontSize: { xs: "2.6rem", sm: "3.6rem", md: "5rem" },
                    lineHeight: 1,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: "#ffffff",
                    textShadow: dark
                        ? "0 12px 40px rgba(0,0,0,0.4)"
                        : "0 12px 40px rgba(255,170,60,0.18)",
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    maxWidth: 720,
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.76)",
                }}
            >
                {subtitle}
            </Typography>

            {showButton && (
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                >
                    <Button
                        size="large"
                        variant="contained"
                        sx={{
                            mt: 1,
                            px: 4,
                            py: 1.4,
                            borderRadius: "10px",
                            fontWeight: 700,
                            fontSize: "1rem",
                            textTransform: "none",
                            backgroundColor: "#ff870f",
                            color: "#ffffff",
                            "&:hover": {
                                backgroundColor: "#e67a0a",
                            },
                            boxShadow: "0 4px 12px rgba(255, 135, 15, 0.3)",
                        }}
                    >
                        Get Started
                    </Button>
                </motion.div>
            )}
        </Stack>
    );
}