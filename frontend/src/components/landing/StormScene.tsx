"use client";

import { motion } from "framer-motion";
import { Box } from "@mui/material";

interface StormSceneProps {
    visible: boolean;
}

export default function StormScene({ visible }: StormSceneProps) {
    return (
        <motion.div
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 50% 20%, rgba(60,80,120,0.16), transparent 35%)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                }}
            >
                {Array.from({ length: 65 }).map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: "absolute",
                            top: "-20%",
                            left: `${(i * 1.6) % 100}%`,
                            width: "1.5px",
                            height: `${80 + (i % 5) * 18}px`,
                            opacity: 0.22 + (i % 4) * 0.08,
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(180,210,255,0.85) 100%)",
                            transform: "rotate(12deg)",
                            animation: `rainFall ${0.8 + (i % 5) * 0.18}s linear infinite`,
                            animationDelay: `${(i % 10) * 0.08}s`,
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.06)",
                    opacity: 0,
                    animation: "lightningFlash 2.8s ease-in-out infinite",
                }}
            />

            <style jsx global>{`
        @keyframes rainFall {
          0% {
            transform: translateY(-120px) rotate(12deg);
          }
          100% {
            transform: translateY(120vh) rotate(12deg);
          }
        }

        @keyframes lightningFlash {
          0%,
          100% {
            opacity: 0;
          }
          8% {
            opacity: 0;
          }
          10% {
            opacity: 0.22;
          }
          12% {
            opacity: 0.04;
          }
          14% {
            opacity: 0.3;
          }
          18% {
            opacity: 0;
          }
        }
      `}</style>
        </motion.div>
    );
}