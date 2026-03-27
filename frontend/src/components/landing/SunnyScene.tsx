"use client";

import { motion } from "framer-motion";
import { Box } from "@mui/material";

interface SunnySceneProps {
    visible: boolean;
}

export default function SunnyScene({ visible }: SunnySceneProps) {
    return (
        <motion.div
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 1.1 }}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 2,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: { xs: "10%", md: "12%" },
                    right: { xs: "-10%", md: "8%" },
                    width: { xs: 220, md: 360 },
                    height: { xs: 220, md: 360 },
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,195,90,0.95) 0%, rgba(255,165,60,0.55) 34%, rgba(255,165,60,0.12) 62%, rgba(255,165,60,0) 78%)",
                    filter: "blur(10px)",
                    animation: "sunPulse 4s ease-in-out infinite",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(255,182,72,0.06) 0%, rgba(255,140,66,0.04) 26%, rgba(255,255,255,0) 100%)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 30% 80%, rgba(255,255,255,0.07), transparent 30%)",
                }}
            />

            <style jsx global>{`
        @keyframes sunPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }
      `}</style>
        </motion.div>
    );
}