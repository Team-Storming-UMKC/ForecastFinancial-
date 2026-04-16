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
}

export default function StatsRow({ netBalance, totalSpending }: StatsRowProps) {
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
                tone="negative"
            />
            <DashboardValueCard
                title="Forecast Trend"
                value="Coming Soon"
                tone="neutral"
            />
        </Box>
    );
}
