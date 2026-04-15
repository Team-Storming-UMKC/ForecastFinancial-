"use client";

import { Box } from "@mui/material";

export default function AuthSuccessTransition() {
    return (
        <Box
            aria-hidden="true"
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                overflow: "hidden",
                pointerEvents: "none",
                animation: "authClearWash 1.35s ease-out forwards",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: { xs: "7%", sm: "8%" },
                    right: { xs: "-18%", sm: "8%" },
                    width: { xs: 220, sm: 330 },
                    height: { xs: 220, sm: 330 },
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,203,112,0.95) 0%, rgba(255,154,58,0.5) 36%, rgba(255,154,58,0.13) 60%, rgba(255,154,58,0) 76%)",
                    filter: "blur(8px)",
                    opacity: 0,
                    transform: "scale(0.72)",
                    animation: "authSunBreak 1.18s ease-out 0.18s forwards",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(255,190,96,0.14) 0%, rgba(118,155,220,0.12) 48%, rgba(255,255,255,0) 100%)",
                    opacity: 0,
                    animation: "authSkyWarm 1s ease-out 0.22s forwards",
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    right: "-12%",
                    bottom: "-14%",
                    left: "-12%",
                    height: "34%",
                    background:
                        "linear-gradient(180deg, rgba(115,153,208,0) 0%, rgba(115,153,208,0.1) 46%, rgba(255,190,96,0.16) 100%)",
                    filter: "blur(18px)",
                    opacity: 0,
                    animation: "authMistLift 1.12s ease-out 0.2s forwards",
                }}
            />

            <style jsx global>{`
        @keyframes authClearWash {
          0% {
            background: rgba(12, 18, 30, 0);
          }
          58% {
            background: rgba(255, 190, 96, 0.16);
          }
          100% {
            background: rgba(19, 36, 56, 0.22);
          }
        }

        @keyframes authSunBreak {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes authSkyWarm {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes authMistLift {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes authClearWash {
            from,
            to {
              background: rgba(19, 36, 56, 0.22);
            }
          }

          @keyframes authSunBreak {
            from,
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes authSkyWarm {
            from,
            to {
              opacity: 1;
            }
          }

          @keyframes authMistLift {
            from,
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
      `}</style>
        </Box>
    );
}
