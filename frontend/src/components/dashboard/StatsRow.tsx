"use client";

import { Box, Typography } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";

function money(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                ...tintedGlass,
                borderRadius: "16px",
                p: { xs: 2, sm: 2.5 },
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                    pointerEvents: "none",
                    zIndex: 0,
                },
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.5px" }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
}

interface StatsRowProps {
    totalSpending: number;
    transactionCount: number;
}

export default function StatsRow({ totalSpending, transactionCount }: StatsRowProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
                mb: 2,
            }}
        >
            <Stat label="Total spending" value={money(totalSpending)} />
            <Stat label="Transactions" value={String(transactionCount)} />
            <Stat
                label="Avg / transaction"
                value={money(totalSpending / Math.max(1, transactionCount))}
            />
        </Box>
    );
}