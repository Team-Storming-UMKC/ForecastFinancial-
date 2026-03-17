"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import TransactionForm, { TransactionDraft } from "./TransactionForm";
import TransactionList from "./TransactionList";
import type { Transaction } from "@/types/transaction";
import { useToast } from "@/components/toast/ToastProvider";

export default function TransactionsPanel({
  loading,
  transactions,
  onChanged,
}: {
  loading: boolean;
  transactions: Transaction[];
  onChanged: () => Promise<void> | void;
}) {
  const { showToast } = useToast();

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
      await onChanged(); 
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error occurred";
      showToast(msg, { severity: "error" });
    }
  }

  async function handleEdit(tx: Transaction) {
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
      await onChanged(); // ✅ refresh in Dashboard
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
      await onChanged(); // ✅ refresh in Dashboard
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error occurred";
      showToast(msg, { severity: "error" });
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={800}>
          Transactions
        </Typography>

        <Button variant="outlined" onClick={onChanged} disabled={loading}>
          Refresh
        </Button>
      </Stack>

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