"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import CsvImportDialog from "@/components/transactions/CsvImportDialog";
import TransactionsPanel from "@/components/transactions/TransactionsPanel";
import type { Transaction } from "@/types/transaction";

export default function TransactionsPage() {
    const [email, setEmail] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);

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
    }, [loadTransactions]);

    async function handleTransactionsChanged() {
        await loadTransactions();
    }

    return (
        <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
            <Stack spacing={4} sx={{ width: "100%" }}>
                {/* Header */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Transactions
                        </Typography>
                        <Typography sx={{ mt: 1, color: "text.secondary" }}>
                            {email ? `Logged in as: ${email}` : "Loading..."}
                        </Typography>
                    </Box>

                    {/* Import Transactions Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadOutlined />}
                        onClick={() => setIsImportDialogOpen(true)}
                        sx={{
                            alignSelf: { xs: "stretch", sm: "center" },
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 600,
                            px: 2.5,
                            py: 1.25,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Import Transactions
                    </Button>
                </Stack>

                <TransactionsPanel
                    loading={loading}
                    transactions={transactions}
                    onChanged={handleTransactionsChanged}
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
