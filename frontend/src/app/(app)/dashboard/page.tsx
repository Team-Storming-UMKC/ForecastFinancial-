"use client";
import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import TransactionCharts from "@/components/dashboard/TransactionCharts";
import InsightsCard from "@/components/dashboard/InsightsCard";
import StatsRow from "@/components/dashboard/StatsRow";
import TransactionList from "@/components/transactions/TransactionList";
import CsvImportDialog from "@/components/transactions/CsvImportDialog";
import type { Transaction } from "@/types/transaction";

export default function DashboardPage() {
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = React.useState(true);
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [chartsKey, setChartsKey] = React.useState(0);

    const loadTransactions = React.useCallback(async () => {
        setTransactionsLoading(true);
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

            nextTransactions.sort((a, b) => b.date.localeCompare(a.date));
            setTransactions(nextTransactions);
            setChartsKey((k) => k + 1);
        } catch {
            setTransactions([]);
        } finally {
            setTransactionsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                window.location.href = "/login";
                return;
            }
        }
        void loadUser();
        void loadTransactions();
    }, [loadTransactions]);

    async function handleTransactionsChanged() {
        await loadTransactions();
    }

    const spendingOnly = React.useMemo(
        () => transactions.filter((transaction) => Number(transaction.amount) < 0),
        [transactions],
    );

    const totalSpending = React.useMemo(
        () => spendingOnly.reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount) || 0), 0),
        [spendingOnly],
    );

    const netBalance = React.useMemo(
        () => transactions.reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0),
        [transactions],
    );

    const recentTransactions = React.useMemo(
        () => transactions.slice(0, 20),
        [transactions],
    );

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1290,
                px: { xs: 0, md: 2 },
                pb: { xs: 4, md: 7 },
            }}
        >
            <Stack spacing={{ xs: 2.5, md: 4 }} gap={2} sx={{ width: "100%" }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "1.55fr 1fr" },
                        gap: { xs: 2, md: 3 },
                        alignItems: "stretch",
                    }}
                >
                    <StatsRow
                        netBalance={netBalance}
                        totalSpending={totalSpending}
                    />
                    <InsightsCard refreshKey={chartsKey} />
                </Box>

                <TransactionCharts refreshKey={chartsKey} showStats={false} />

                <Box>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                        spacing={1.5}
                        sx={{ mb: 2 }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={800}>
                                Recent Transactions
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Latest activity from your account.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<CloudUploadOutlined />}
                            onClick={() => setIsImportDialogOpen(true)}
                            sx={{
                                alignSelf: { xs: "stretch", sm: "center" },
                                borderRadius: "8px",
                                fontWeight: 700,
                                px: 2.5,
                                py: 1.25,
                            }}
                        >
                            Import Transactions
                        </Button>
                    </Stack>

                    <TransactionList
                        loading={transactionsLoading}
                        transactions={recentTransactions}
                        onEdit={undefined}
                        onDelete={undefined}
                        showHeader={false}
                        showControls={false}
                    />
                </Box>
            </Stack>

            <CsvImportDialog
                open={isImportDialogOpen}
                onClose={() => setIsImportDialogOpen(false)}
                onImported={handleTransactionsChanged}
                endpoint="/api/transactions/import-csv"
            />
        </Box>
    );
}
