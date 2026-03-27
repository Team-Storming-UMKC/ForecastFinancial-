"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";
import StormScene from "./StormScene";
import SunnyScene from "./SunnyScene";
import HeroText from "./HeroText";
import DashboardMockup from "./DashboardMockup";
import type { HeroPhase } from "./landingHero.types";

export default function LandingHero() {
    const [phase, setPhase] = useState<HeroPhase>("storm");

    useEffect(() => {
        const stormTimer = setTimeout(() => setPhase("transition"), 2600);
        const sunnyTimer = setTimeout(() => setPhase("sunny"), 4200);

        return () => {
            clearTimeout(stormTimer);
            clearTimeout(sunnyTimer);
        };
    }, []);

    return (
        <Box
            sx={{
                position: "relative",
                minHeight: "100vh",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
                background:
                    phase === "sunny"
                        ? "linear-gradient(180deg, #0b1220 0%, #132238 45%, #1c3352 100%)"
                        : "linear-gradient(180deg, #05070d 0%, #0a1020 55%, #101a2d 100%)",
                transition: "background 1.2s ease",
            }}
        >
            <StormScene visible={phase === "storm" || phase === "transition"} />
            <SunnyScene visible={phase === "transition" || phase === "sunny"} />

            <Box
                sx={{
                    position: "relative",
                    zIndex: 5,
                    width: "100%",
                    maxWidth: 1200,
                    mx: "auto",
                }}
            >
                <AnimatePresence mode="wait">
                    {phase === "storm" && (
                        <motion.div
                            key="storm-text"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.7 }}
                        >
                            <HeroText
                                eyebrow="Financial stress feels unpredictable"
                                title="Your finances now"
                                subtitle="Scattered. Unclear. Hard to plan."
                                showButton={false}
                                dark
                            />
                        </motion.div>
                    )}

                    {phase === "transition" && (
                        <motion.div
                            key="transition-text"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.6 }}
                        >
                            <HeroText
                                eyebrow="Things are starting to clear up"
                                title="See the bigger picture"
                                subtitle="Move from uncertainty to clarity."
                                showButton={false}
                                dark
                            />
                        </motion.div>
                    )}

                    {phase === "sunny" && (
                        <motion.div
                            key="sunny-text"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <HeroText
                                eyebrow="Forecast Financial"
                                title="Your finances with Forecast"
                                subtitle="Track spending, understand trends, and plan ahead with confidence."
                                showButton
                                dark={false}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>

            {phase === "sunny" && (
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.9 }}
                    style={{
                        position: "absolute",
                        bottom: 40,
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        zIndex: 6,
                    }}
                >
                    <div style={{ width: "min(92vw, 980px)" }}>
                        <DashboardMockup />
                    </div>
                </motion.div>
            )}
        </Box>
    );
}