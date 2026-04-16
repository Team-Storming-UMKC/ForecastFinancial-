"use client";

import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { tintedGlass } from "@/theme/tintedGlass";

type ValueTone = "auto" | "positive" | "negative" | "neutral" | "orange";

interface DashboardValueCardProps {
    title: string;
    value: string;
    amount?: number;
    tone?: ValueTone;
    sx?: SxProps<Theme>;
}

const toneColors = {
    positive: "#4b944b",
    negative: "#d85b5b",
    neutral: "rgba(255,255,255,0.86)",
    orange: "#ff870f",
} as const;

function resolveTone(amount: number | undefined, tone: ValueTone) {
    if (tone !== "auto") return tone;
    if (typeof amount !== "number" || amount === 0) return "neutral";
    return amount > 0 ? "positive" : "negative";
}

export default function DashboardValueCard({
    title,
    value,
    amount,
    tone = "auto",
    sx,
}: DashboardValueCardProps) {
    const resolvedTone = resolveTone(amount, tone);

    return (
        <Box
            sx={[
                (theme) => ({
                    ...tintedGlass,
                    minHeight: { xs: 150, sm: 170 },
                    borderRadius: `${theme.customTokens.radii.card}px`,
                    position: "relative",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateRows: "auto 1fr",
                    placeItems: "center",
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 2.5, sm: 3 },
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    },
                }),
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Typography
                component="h3"
                sx={{
                    color: "rgba(164,164,164,0.64)",
                    fontSize: 16,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    color: toneColors[resolvedTone],
                    fontSize: { xs: 34, sm: 40 },
                    fontWeight: 600,
                    lineHeight: 1.5,
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                    overflowWrap: "anywhere",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}
