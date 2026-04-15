"use client";

import { Box, Stack, Typography } from "@mui/material";

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
                    top: { xs: "6%", sm: "8%" },
                    right: { xs: "-18%", sm: "8%" },
                    width: { xs: 220, sm: 320 },
                    height: { xs: 220, sm: 320 },
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,195,90,0.92) 0%, rgba(255,135,15,0.42) 42%, rgba(255,135,15,0) 72%)",
                    filter: "blur(8px)",
                    animation: "authSunBreak 1.25s ease-out forwards",
                }}
            />

            <Stack
                spacing={1.5}
                sx={{
                    position: "absolute",
                    left: "50%",
                    bottom: { xs: "14%", sm: "16%" },
                    width: "min(86vw, 520px)",
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    backgroundColor: "rgba(15,22,34,0.78)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
                    transform: "translate(-50%, 42px)",
                    opacity: 0,
                    animation: "authDashboardRise 1s ease-out 0.28s forwards",
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.62)" }}>
                            Forecast Financial
                        </Typography>
                        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>
                            Dashboard
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: "8px",
                            background:
                                "linear-gradient(135deg, rgba(255,135,15,0.96), rgba(255,195,90,0.78))",
                            boxShadow: "0 10px 30px rgba(255,135,15,0.28)",
                        }}
                    />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ height: 72, alignItems: "flex-end" }}>
                    {[36, 54, 30, 66, 46, 62].map((height, index) => (
                        <Box
                            key={height + index}
                            sx={{
                                flex: 1,
                                height: `${height}%`,
                                borderRadius: "6px 6px 0 0",
                                background:
                                    index % 2 === 0
                                        ? "rgba(118,155,220,0.72)"
                                        : "rgba(255,135,15,0.72)",
                                transformOrigin: "bottom",
                                transform: "scaleY(0.2)",
                                animation: `authChartGrow 0.58s ease-out ${0.48 + index * 0.06}s forwards`,
                            }}
                        />
                    ))}
                </Stack>
            </Stack>

            <style jsx global>{`
        @keyframes authClearWash {
          0% {
            background: rgba(12, 18, 30, 0);
          }
          58% {
            background: rgba(255, 190, 96, 0.18);
          }
          100% {
            background: rgba(14, 24, 38, 0.34);
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

        @keyframes authDashboardRise {
          0% {
            opacity: 0;
            transform: translate(-50%, 42px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }

        @keyframes authChartGrow {
          0% {
            transform: scaleY(0.2);
          }
          100% {
            transform: scaleY(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes authClearWash {
            from,
            to {
              background: rgba(14, 24, 38, 0.34);
            }
          }

          @keyframes authSunBreak {
            from,
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes authDashboardRise {
            from,
            to {
              opacity: 1;
              transform: translate(-50%, 0) scale(1);
            }
          }

          @keyframes authChartGrow {
            from,
            to {
              transform: scaleY(1);
            }
          }
        }
      `}</style>
        </Box>
    );
}
