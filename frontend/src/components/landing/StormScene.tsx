"use client";

import { motion } from "framer-motion";
import { Box } from "@mui/material";

interface StormSceneProps {
    visible: boolean;
}

const rainDrops = Array.from({ length: 118 }, (_, i) => {
    const lane = (i * 37) % 100;
    const drift = 16 + (i % 9) * 5;
    const length = 56 + (i % 7) * 17;
    const duration = 0.72 + (i % 8) * 0.08;

    return {
        id: `drop-${i}`,
        left: `${lane + ((i % 3) * 0.35)}%`,
        top: `${-28 - (i % 11) * 8}%`,
        width: i % 4 === 0 ? "2px" : "1px",
        height: `${length}px`,
        opacity: 0.16 + (i % 6) * 0.055,
        blur: i % 5 === 0 ? "0.4px" : "0px",
        duration: `${duration}s`,
        delay: `${-(i % 19) * 0.09}s`,
        drift: `${drift}px`,
    };
});

const splashMarks = Array.from({ length: 26 }, (_, i) => ({
    id: `splash-${i}`,
    bottom: `${8 + (i % 4) * 8}px`,
    left: `${(i * 13) % 100}%`,
    width: `${10 + (i % 4) * 5}px`,
    delay: `${-(i % 8) * 0.17}s`,
    duration: `${1.05 + (i % 5) * 0.11}s`,
    opacity: 0.12 + (i % 4) * 0.045,
}));

export default function StormScene({ visible }: StormSceneProps) {
    return (
        <motion.div
            aria-hidden="true"
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
                        "radial-gradient(circle at 28% 12%, rgba(98,120,165,0.22), transparent 28%), radial-gradient(circle at 78% 18%, rgba(33,48,86,0.34), transparent 34%), linear-gradient(180deg, rgba(8,13,25,0.28) 0%, rgba(6,9,17,0.08) 42%, rgba(5,8,14,0.44) 100%)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                }}
            >
                {rainDrops.map((drop) => (
                    <Box
                        key={drop.id}
                        sx={{
                            position: "absolute",
                            top: drop.top,
                            left: drop.left,
                            width: drop.width,
                            height: drop.height,
                            opacity: drop.opacity,
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(191,218,255,0.92) 48%, rgba(132,175,240,0.58) 100%)",
                            filter: `blur(${drop.blur})`,
                            transform: "translate3d(0, 0, 0) rotate(14deg)",
                            animation: `rainFall ${drop.duration} linear infinite`,
                            animationDelay: drop.delay,
                            "--rain-drift": drop.drift,
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    right: "-10%",
                    bottom: "-8%",
                    left: "-10%",
                    height: "34%",
                    background:
                        "linear-gradient(180deg, rgba(7,12,22,0) 0%, rgba(118,156,210,0.1) 46%, rgba(8,12,20,0.42) 100%)",
                    filter: "blur(18px)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    left: 0,
                    height: "18%",
                    overflow: "hidden",
                }}
            >
                {splashMarks.map((splash) => (
                    <Box
                        key={splash.id}
                        sx={{
                            position: "absolute",
                            bottom: splash.bottom,
                            left: splash.left,
                            width: splash.width,
                            height: "2px",
                            borderRadius: "999px",
                            background: "rgba(188,218,255,0.72)",
                            opacity: splash.opacity,
                            transform: "scaleX(0.4)",
                            animation: `rainSplash ${splash.duration} ease-out infinite`,
                            animationDelay: splash.delay,
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 62% 18%, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 24%, rgba(255,255,255,0) 48%)",
                    opacity: 0,
                    animation: "lightningFlash 5.8s ease-in-out infinite",
                }}
            />

            <style jsx global>{`
        @keyframes rainFall {
          0% {
            transform: translate3d(0, -140px, 0) rotate(14deg);
          }
          100% {
            transform: translate3d(var(--rain-drift), 128vh, 0) rotate(14deg);
          }
        }

        @keyframes rainSplash {
          0%,
          68% {
            transform: scaleX(0.3);
            opacity: 0;
          }
          76% {
            transform: scaleX(1);
            opacity: 0.4;
          }
          100% {
            transform: scaleX(1.8);
            opacity: 0;
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
            opacity: 0.18;
          }
          12% {
            opacity: 0.02;
          }
          14% {
            opacity: 0.26;
          }
          18%,
          62% {
            opacity: 0;
          }
          64% {
            opacity: 0.12;
          }
          66%,
          100% {
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes rainFall {
            from,
            to {
              transform: translate3d(0, 20vh, 0) rotate(14deg);
            }
          }

          @keyframes rainSplash {
            from,
            to {
              opacity: 0;
            }
          }

          @keyframes lightningFlash {
            from,
            to {
              opacity: 0;
            }
          }
        }
      `}</style>
        </motion.div>
    );
}
