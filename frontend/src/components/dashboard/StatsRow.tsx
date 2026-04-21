"use client";

import { Box } from "@mui/material";
import DashboardValueCard from "./DashboardValueCard";

function money(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function signedMoney(n: number) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        signDisplay: "exceptZero",
    });
}

interface StatsRowProps {
    netBalance: number;
    totalSpending: number;
    forecastTrend?: string;
}

function forecastTone(forecastTrend: string) {
    const normalized = forecastTrend.toLowerCase().replace(/\s+/g, "");

    if (normalized.includes("thunderstorm")) return "thunderstorm";
    if (normalized.includes("rain")) return "raining";
    if (normalized.includes("cloud")) return "cloudy";
    if (normalized.includes("sun")) return "sunny";

    return "neutral";
}

export default function StatsRow({ netBalance, totalSpending, forecastTrend = "Loading" }: StatsRowProps) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
            }}
        >
            <DashboardValueCard
                title="Net Balance"
                value={signedMoney(netBalance)}
                amount={netBalance}
            />
            <DashboardValueCard
                title="Monthly Spending"
                value={money(totalSpending)}
                tone="orange"
            />
            <DashboardValueCard
                title="Spending vs Income"
                value={forecastTrend}
                tone={forecastTone(forecastTrend)}
            />
        </Box>
    );
}
