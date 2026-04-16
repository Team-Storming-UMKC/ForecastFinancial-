"use client";

import * as React from "react";
import {
    Box,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import type { Transaction } from "@/types/transaction";
import StatsRow from "./StatsRow";
import TopCategoriesChart from "./TopCategoriesChart";
import {
    loadingSx,
    emptySx,
} from "./TransactionCharts.styles";

function parseDateOnly(yyyyMmDd: string) {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
}

interface TransactionChartsProps {
    refreshKey?: number;
    showStats?: boolean;
}

export default function TransactionCharts({ refreshKey, showStats = true }: TransactionChartsProps) {
    const [data, setData] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const r = await fetch("/api/transactions", { cache: "no-store" });
                if (!r.ok) throw new Error((await r.text()) || `Request failed: ${r.status}`);

                const json = (await r.json()) as Transaction[];
                if (!alive) return;

                json.sort((a, b) => a.date.localeCompare(b.date));
                setData(json);
            } catch (e: unknown) {
                if (!alive) return;
                setError(e instanceof Error ? e.message : "Failed to load transactions");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        }

        load();
        return () => { alive = false; };
    }, [refreshKey]);

    const filtered = React.useMemo(() => {
        const days = 30;
        const now = new Date();
        const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
        return data.filter((t) => parseDateOnly(t.date) >= cutoff);
    }, [data]);

    // Only spending transactions (negative amounts)
    const spendingOnly = React.useMemo(() =>
            filtered.filter((t) => Number(t.amount) < 0),
        [filtered]);

    const categoryData = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const t of spendingOnly) {
            const cat = (t.category || "Uncategorized").trim() || "Uncategorized";
            map.set(cat, (map.get(cat) ?? 0) + Math.abs(Number(t.amount) || 0));
        }
        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 9);
    }, [spendingOnly]);

    const totalSpending = React.useMemo(() =>
            spendingOnly.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0),
        [spendingOnly]);

    const netBalance = React.useMemo(() =>
            filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        [filtered]);

    return (
        <Stack spacing={2.25}>
            {showStats ? (
                <StatsRow
                    netBalance={netBalance}
                    totalSpending={totalSpending}
                />
            ) : null}

            {loading ? (
                <Box sx={loadingSx}>
                    <CircularProgress sx={{ color: "primary.main" }} />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : filtered.length === 0 ? (
                <Typography sx={emptySx}>
                    No transactions in this range.
                </Typography>
            ) : (
                <TopCategoriesChart data={categoryData} />
            )}
        </Stack>
    );
}
