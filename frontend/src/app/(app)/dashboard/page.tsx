"use client";
import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import TransactionsPanel from "@/components/transactions/TransactionsPanel";
import TransactionCharts from "@/components/dashboard/TransactionCharts";
import RawDataInput from "@/components/dashboard/RawDataInput";
import type { Transaction } from "@/types/transaction";

export default function DashboardPage() {
    const [email, setEmail] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [chartsKey, setChartsKey] = React.useState(0);

    const loadTransactions = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/transactions", { cache: "no-store" });
            if (!res.ok) {
                throw new Error(`Failed to load transactions (${res.status})`);
            }
            const data: unknown = await res.json();
            const nextTransactions = Array.isArray(data)
                ? (data as Transaction[])
                : Array.isArray((data as { transactions?: unknown })?.transactions)
                    ? ((data as { transactions: Transaction[] }).transactions)
                    : [];
            setTransactions(nextTransactions);
        } catch {
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                window.location.href = "/login";
                return;
            }
            const data = await res.json();
            setEmail(data.email);
        }
        void loadUser();
        void loadTransactions();
    }, []);

    async function handleTransactionsChanged() {
        await loadTransactions();
        setChartsKey((k) => k + 1);
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
            <Stack spacing={4} sx={{ width: "100%" }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Dashboard
                        </Typography>
                        <Typography sx={{ mt: 1, color: "text.secondary" }}>
                            {email ? `Logged in as: ${email}` : "Loading..."}
                        </Typography>
                    </Box>
                </Stack>

                {/* AI Data Import */}
                <RawDataInput onExtractionComplete={handleTransactionsChanged} />

                {/* Charts */}
                <TransactionCharts refreshKey={chartsKey} />
            </Stack>
        </Box>
    );
}
