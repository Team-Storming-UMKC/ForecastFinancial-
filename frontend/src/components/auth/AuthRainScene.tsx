"use client";

import { Box } from "@mui/material";

const rainDrops = Array.from({ length: 76 }, (_, i) => ({
    id: `auth-rain-${i}`,
    left: `${(i * 29) % 100}%`,
    top: `${-26 - (i % 9) * 9}%`,
    height: `${46 + (i % 6) * 14}px`,
    opacity: 0.12 + (i % 5) * 0.045,
    duration: `${1.05 + (i % 7) * 0.1}s`,
    delay: `${-(i % 17) * 0.1}s`,
    drift: `${10 + (i % 6) * 4}px`,
}));

const softRipples = Array.from({ length: 18 }, (_, i) => ({
    id: `auth-ripple-${i}`,
    left: `${(i * 19) % 100}%`,
    bottom: `${10 + (i % 3) * 15}px`,
    width: `${12 + (i % 4) * 5}px`,
    opacity: 0.08 + (i % 4) * 0.035,
    duration: `${1.4 + (i % 5) * 0.12}s`,
    delay: `${-(i % 7) * 0.16}s`,
}));

interface AuthRainSceneProps {
    clearing?: boolean;
}

export default function AuthRainScene({ clearing = false }: AuthRainSceneProps) {
    return (
        <Box
            aria-hidden="true"
            sx={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                transition: "background-color 0.8s ease",
                backgroundColor: clearing ? "rgba(255, 176, 72, 0.08)" : "transparent",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "radial-gradient(circle at 24% 18%, rgba(118,155,220,0.22), transparent 30%), radial-gradient(circle at 76% 10%, rgba(255,135,15,0.1), transparent 26%), linear-gradient(180deg, rgba(5,9,18,0.18) 0%, rgba(7,12,23,0.04) 44%, rgba(5,9,18,0.28) 100%)",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: clearing ? 0 : 0.9,
                    transition: "opacity 0.72s ease",
                }}
            >
                {rainDrops.map((drop) => (
                    <Box
                        key={drop.id}
                        sx={{
                            position: "absolute",
                            top: drop.top,
                            left: drop.left,
                            width: "1px",
                            height: drop.height,
                            opacity: drop.opacity,
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(190,216,255,0.82) 56%, rgba(124,166,230,0.36) 100%)",
                            transform: "translate3d(0, 0, 0) rotate(13deg)",
                            animation: `authRainFall ${drop.duration} linear infinite`,
                            animationDelay: drop.delay,
                            "--auth-rain-drift": drop.drift,
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    position: "absolute",
                    right: "-8%",
                    bottom: "-8%",
                    left: "-8%",
                    height: "28%",
                    background:
                        "linear-gradient(180deg, rgba(7,12,22,0) 0%, rgba(115,153,208,0.08) 48%, rgba(7,11,19,0.32) 100%)",
                    filter: "blur(16px)",
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
                {softRipples.map((ripple) => (
                    <Box
                        key={ripple.id}
                        sx={{
                            position: "absolute",
                            bottom: ripple.bottom,
                            left: ripple.left,
                            width: ripple.width,
                            height: "2px",
                            borderRadius: "999px",
                            background: "rgba(188,218,255,0.62)",
                            opacity: ripple.opacity,
                            transform: "scaleX(0.35)",
                            animation: `authRainRipple ${ripple.duration} ease-out infinite`,
                            animationDelay: ripple.delay,
                        }}
                    />
                ))}
            </Box>

            <style jsx global>{`
        @keyframes authRainFall {
          0% {
            transform: translate3d(0, -120px, 0) rotate(13deg);
          }
          100% {
            transform: translate3d(var(--auth-rain-drift), 122vh, 0) rotate(13deg);
          }
        }

        @keyframes authRainRipple {
          0%,
          72% {
            transform: scaleX(0.35);
            opacity: 0;
          }
          82% {
            transform: scaleX(1);
            opacity: 0.24;
          }
          100% {
            transform: scaleX(1.55);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes authRainFall {
            from,
            to {
              transform: translate3d(0, 18vh, 0) rotate(13deg);
            }
          }

          @keyframes authRainRipple {
            from,
            to {
              opacity: 0;
            }
          }
        }
      `}</style>
        </Box>
    );
}
