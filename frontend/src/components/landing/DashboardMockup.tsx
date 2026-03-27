"use client";

import { Box, Stack, Typography } from "@mui/material";

export default function DashboardMockup() {
    return (
        <Box
            sx={{
                borderRadius: "28px",
                p: { xs: 2, md: 3 },
                backdropFilter: "blur(22px)",
                background:
                    "linear-gradient(180deg, rgba(17,25,40,0.72) 0%, rgba(20,32,52,0.6) 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow:
                    "0 30px 80px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
        >
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ width: "100%" }}
            >
                <MetricCard title="Net Balance" value="$12,480" positive />
                <MetricCard title="Monthly Spending" value="$2,140" />
                <MetricCard title="Forecast Trend" value="Sunny" highlight />
            </Stack>
        </Box>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    positive?: boolean;
    highlight?: boolean;
}

function MetricCard({
                        title,
                        value,
                        positive = false,
                        highlight = false,
                    }: MetricCardProps) {
    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: "22px",
                p: 2.5,
                background: highlight
                    ? "linear-gradient(135deg, rgba(255,179,71,0.2) 0%, rgba(255,107,44,0.18) 100%)"
                    : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <Typography
                sx={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.92rem",
                    mb: 1,
                }}
            >
                {title}
            </Typography>

            <Typography
                sx={{
                    color: positive ? "#a9ffd0" : "#ffffff",
                    fontSize: { xs: "1.5rem", md: "1.9rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}