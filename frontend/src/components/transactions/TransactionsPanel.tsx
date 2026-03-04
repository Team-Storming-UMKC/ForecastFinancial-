"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import TransactionForm, { TransactionDraft } from "./TransactionForm";
import TransactionList, { Transaction } from "./TransactionList";
import { useToast } from "@/components/toast/ToastProvider";

interface TransactionsPanelProps {
    onDataChange?: () => void;
}

export default function TransactionsPanel({ onDataChange }: TransactionsPanelProps) {
    const { showToast } = useToast();

    const [loading, setLoading] = React.useState(true);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);

    async function load() {
        setLoading(true);
        try {
            const r = await fetch("/api/transactions", { cache: "no-store" });
            if (!r.ok) {
                const text = await r.text().catch(() => "");
                throw new Error(text || `Failed to load (${r.status})`);
            }
            setTransactions((await r.json()) as Transaction[]);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unexpected error occurred";
            showToast(msg, { severity: "error" });
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleCreate(draft: TransactionDraft) {
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
                const text = await r.text().catch(() => "");
                throw new Error(text || `Create failed (${r.status})`);
            }

            showToast("Transaction added.", { severity: "success" });
            await load();
            onDataChange?.();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unexpected error occurred";
            showToast(msg, { severity: "error" });
        }
    }

    async function handleEdit(tx: Transaction) {
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
                const text = await r.text().catch(() => "");
                throw new Error(text || `Update failed (${r.status})`);
            }

            showToast("Transaction updated.", { severity: "success" });
            await load();
            onDataChange?.();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unexpected error occurred";
            showToast(msg, { severity: "error" });
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Delete this transaction?")) return;

        try {
            const r = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (!r.ok) {
                const text = await r.text().catch(() => "");
                throw new Error(text || `Delete failed (${r.status})`);
            }

            showToast("Transaction deleted.", { severity: "success" });
            await load();
            onDataChange?.();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unexpected error occurred";
            showToast(msg, { severity: "error" });
        }
    }

    return (
        <Stack spacing={"25px !important"}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={800}>
                    Transactions
                </Typography>
                <Button variant="outlined" onClick={load} disabled={loading}>
                    Refresh
                </Button>
            </Stack>

            <TransactionForm onCreate={handleCreate} />

            <TransactionList loading={loading} transactions={transactions} />
        </Stack>
    );
}