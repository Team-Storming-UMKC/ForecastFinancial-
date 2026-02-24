"use client";

import * as React from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import TransactionForm, { TransactionDraft } from "./TransactionForm";
import TransactionList, { Transaction } from "./TransactionList";

export default function TransactionsPanel() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);

    async function load() {
        setLoading(true);
        setError(null);

        try {
            const r = await fetch("/api/transactions", { cache: "no-store" });
            if (!r.ok) {
                const text = await r.text();
                throw new Error(text || `Failed to load (${r.status})`);
            }
            setTransactions((await r.json()) as Transaction[]);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        load();
    }, []);

    async function handleCreate(draft: TransactionDraft) {
        setError(null);
        try {
            const r = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    merchantName: draft.merchantName,
                    amount: Number(draft.amount),
                    date: draft.date,
                    category: draft.category,
                }),
            });

            if (!r.ok) {
                const text = await r.text();
                throw new Error(text || `Create failed (${r.status})`);
            }

            await load();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Unexpected error occurred");
            }
        }
    }

    async function handleEdit(tx: Transaction) {
        setError(null);

        // dummy edit (easy to replace later with a dialog)
        const newMerchant = window.prompt("Merchant name:", tx.merchantName);
        if (newMerchant === null) return;

        const newAmountStr = window.prompt("Amount:", String(tx.amount));
        if (newAmountStr === null) return;

        const newCategory = window.prompt("Category:", tx.category);
        if (newCategory === null) return;

        const newDate = window.prompt("Date (YYYY-MM-DD):", tx.date);
        if (newDate === null) return;

        try {
            const r = await fetch(`/api/transactions/${tx.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    merchantName: newMerchant,
                    amount: Number(newAmountStr),
                    category: newCategory,
                    date: newDate,
                }),
            });

            if (!r.ok) {
                const text = await r.text();
                throw new Error(text || `Update failed (${r.status})`);
            }

            await load();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Unexpected error occurred");
            }
        }
    }

    async function handleDelete(id: number) {
        setError(null);
        if (!window.confirm("Delete this transaction?")) return;

        try {
            const r = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (!r.ok) {
                const text = await r.text();
                throw new Error(text || `Delete failed (${r.status})`);
            }
            await load();
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("Unexpected error occurred");
            }
        }
    }

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
    <Typography variant="h6" fontWeight={800}>
        Transactions (Dummy UI)
    </Typography>

    <Button variant="outlined" onClick={load} disabled={loading}>
        Refresh
        </Button>
        </Stack>

    {error && (
        <Card sx={{ mb: 2, border: "1px solid", borderColor: "error.light" }}>
        <CardContent>
            <Typography color="error" fontWeight={700}>
        Error
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
        {error}
        </Typography>
        </CardContent>
        </Card>
    )}

    <TransactionForm onCreate={handleCreate} />

    <TransactionList
    loading={loading}
    transactions={transactions}
    onEdit={handleEdit}
    onDelete={handleDelete}
    />
    </Box>
);
}