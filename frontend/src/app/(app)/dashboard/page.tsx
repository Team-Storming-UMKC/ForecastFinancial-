"use client";
import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import TransactionCharts from "@/components/dashboard/TransactionCharts";
import InsightsCard from "@/components/dashboard/InsightsCard";
import StatsRow from "@/components/dashboard/StatsRow";
import TransactionList from "@/components/transactions/TransactionList";
import CsvImportDialog from "@/components/transactions/CsvImportDialog";
import StormScene from "@/components/landing/StormScene";
import { cardSurfaceSx } from "@/theme/tintedGlass";
import {
    fetchSpendingForecast,
    forecastLabel,
    FORECAST_STORAGE_KEY,
    FORECAST_UPDATED_EVENT,
    publishForecast,
    type ForecastKind,
} from "@/components/forecast/ForecastBackground";
import type { Transaction } from "@/types/transaction";

export default function DashboardPage() {
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = React.useState(true);
    const [forecastTrend, setForecastTrend] = React.useState("Loading");
    const [forecastLoading, setForecastLoading] = React.useState(true);
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
    const [minimumLoaderElapsed, setMinimumLoaderElapsed] = React.useState(false);
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

    const loadForecast = React.useCallback(async () => {
        setForecastLoading(true);
        try {
            const forecast = await fetchSpendingForecast();
            setForecastTrend(forecastLabel(forecast));
            publishForecast(forecast);
        } catch {
            setForecastTrend("Unavailable");
        } finally {
            setForecastLoading(false);
        }
    }, []);

    React.useEffect(() => {
        const storedForecast = window.sessionStorage.getItem(FORECAST_STORAGE_KEY);
        if (storedForecast) {
            setForecastTrend(forecastLabel(storedForecast as ForecastKind));
        }

        function handleForecastUpdated(event: Event) {
            setForecastTrend(forecastLabel((event as CustomEvent).detail as ForecastKind));
        }

        window.addEventListener(FORECAST_UPDATED_EVENT, handleForecastUpdated);
        return () => window.removeEventListener(FORECAST_UPDATED_EVENT, handleForecastUpdated);
    }, []);

    React.useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                window.location.href = "/login";
                return;
            }
            setIsCheckingAuth(false);
        }
        void loadUser();
        void loadTransactions();
        void loadForecast();
    }, [loadForecast, loadTransactions]);

    React.useEffect(() => {
        const timer = window.setTimeout(() => {
            setMinimumLoaderElapsed(true);
        }, 1200);

        return () => window.clearTimeout(timer);
    }, []);

    async function handleTransactionsChanged() {
        await loadTransactions();
        await loadForecast();
    }

    const currentMonthKey = React.useMemo(() => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        return `${now.getFullYear()}-${month}`;
    }, []);

    const currentMonthTransactions = React.useMemo(
        () => transactions.filter((transaction) => transaction.date.startsWith(currentMonthKey)),
        [currentMonthKey, transactions],
    );

    const spendingOnly = React.useMemo(
        () => currentMonthTransactions.filter((transaction) => Number(transaction.amount) < 0),
        [currentMonthTransactions],
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

    const showStormLoader = isCheckingAuth || transactionsLoading || forecastLoading || !minimumLoaderElapsed;

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: 1290,
                px: { xs: 0, md: 2 },
                pb: { xs: 4, md: 7 },
            }}
        >
            {showStormLoader ? <DashboardStormLoader /> : null}

            <Stack
                spacing={{ xs: 2.5, md: 4 }}
                gap={2}
                sx={{
                    width: "100%",
                    opacity: showStormLoader ? 0 : 1,
                    transition: "opacity 420ms ease",
                }}
            >
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
                        forecastTrend={forecastTrend}
                    />
                    <InsightsCard refreshKey={chartsKey} />
                </Box>

                <TransactionCharts refreshKey={chartsKey} showStats={false} />

                <TransactionList
                    loading={transactionsLoading}
                    transactions={recentTransactions}
                    onEdit={undefined}
                    onDelete={undefined}
                    title="Recent Transactions"
                    description="Latest activity from your account."
                    showControls={false}
                    headerAction={
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<CloudUploadOutlined />}
                            onClick={() => setIsImportDialogOpen(true)}
                            sx={{
                                alignSelf: { xs: "stretch", sm: "center" },
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 700,
                                minHeight: 36,
                                px: 1.75,
                                py: 0.75,
                                whiteSpace: "nowrap",
                            }}
                        >
                            Import Transactions
                        </Button>
                    }
                />
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

function DashboardStormLoader() {
    return (
        <Box
            role="status"
            aria-live="polite"
            aria-label="Loading dashboard"
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 1,
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                bgcolor: "background.default",
            }}
        >
            <StormScene visible />
            <Box
                sx={{
                    ...cardSurfaceSx,
                    position: "relative",
                    zIndex: 2,
                    width: "min(420px, calc(100vw - 32px))",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 3, sm: 3.5 },
                    textAlign: "center",
                }}
            >
                <Stack spacing={1.25}>
                    <Typography
                        sx={{
                            color: "primary.main",
                            fontSize: { xs: 18, sm: 20 },
                            fontWeight: 800,
                            letterSpacing: 0,
                        }}
                    >
                        Forecast Financial
                    </Typography>
                    <Typography
                        sx={{
                            color: "text.primary",
                            fontSize: { xs: 24, sm: 30 },
                            fontWeight: 800,
                            lineHeight: 1.15,
                            letterSpacing: 0,
                        }}
                    >
                        Gathering the forecast
                    </Typography>
                    <Typography sx={{ color: "text.secondary", lineHeight: 1.5 }}>
                        Loading your dashboard.
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
}
