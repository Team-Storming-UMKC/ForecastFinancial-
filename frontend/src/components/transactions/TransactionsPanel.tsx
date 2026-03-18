"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import TransactionForm, { TransactionDraft } from "./TransactionForm";
import TransactionList from "./TransactionList";
import type { Transaction } from "@/types/transaction";
import { useToast } from "@/components/toast/ToastProvider";

function toDraft(tx: Transaction): TransactionDraft {
  return {
    merchantName: tx.merchantName,
    amount: String(tx.amount),
    date: tx.date,
    category: tx.category,
  };
}

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
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);

  const incomeCount = transactions.filter((tx) => Number(tx.amount) > 0).length;
  const expenseCount = transactions.filter((tx) => Number(tx.amount) < 0).length;

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

  async function handleUpdate(draft: TransactionDraft) {
    if (!editingTransaction) return;

    try {
      const r = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantName: draft.merchantName,
          amount: Number(draft.amount),
          category: draft.category,
          date: draft.date,
        }),
      });

      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || `Update failed (${r.status})`);
      }

      setEditingTransaction(null);
      showToast("Transaction updated.", { severity: "success" });
      await onChanged();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error occurred";
      showToast(msg, { severity: "error" });
    }
  }

  async function handleDeleteConfirmed() {
    if (!transactionToDelete) return;

    try {
      const r = await fetch(`/api/transactions/${transactionToDelete.id}`, { method: "DELETE" });
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        throw new Error(text || `Delete failed (${r.status})`);
      }

      if (editingTransaction?.id === transactionToDelete.id) {
        setEditingTransaction(null);
      }

      setTransactionToDelete(null);
      showToast("Transaction deleted.", { severity: "success" });
      await onChanged();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error occurred";
      showToast(msg, { severity: "error" });
    }
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
        spacing={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Transactions
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Keep entries clean and readable so your charts and summaries stay accurate.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`${transactions.length} total`} sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "text.primary" }} />
          <Chip label={`${incomeCount} income`} sx={{ bgcolor: "rgba(46, 125, 50, 0.18)", color: "success.light" }} />
          <Chip label={`${expenseCount} expenses`} sx={{ bgcolor: "rgba(211, 47, 47, 0.18)", color: "error.light" }} />
          <Button variant="outlined" onClick={onChanged} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <TransactionForm
          onCreate={editingTransaction ? handleUpdate : handleCreate}
          initialDraft={editingTransaction ? toDraft(editingTransaction) : undefined}
          title={editingTransaction ? "Edit transaction" : "Add transaction"}
          description={
            editingTransaction
              ? "Update the fields below and save when the transaction looks right."
              : "Add a merchant, amount, date, and category. Suggested categories are there to speed things up."
          }
          submitLabel={editingTransaction ? "Save changes" : "Add transaction"}
          onCancel={editingTransaction ? () => setEditingTransaction(null) : undefined}
        />

        <TransactionList
          loading={loading}
          transactions={transactions}
          onEdit={(tx) => setEditingTransaction(tx)}
          onDelete={(id) => {
            const tx = transactions.find((item) => item.id === id) ?? null;
            setTransactionToDelete(tx);
          }}
        />
      </Stack>

      <Dialog
        open={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        PaperProps={{
          sx: {
            background: "rgba(28, 28, 30, 0.96)",
            color: "text.primary",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 3,
            backdropFilter: "blur(24px)",
          },
        }}
      >
        <DialogTitle>Delete transaction?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {transactionToDelete
              ? `Remove ${transactionToDelete.merchantName} from ${transactionToDelete.date}.`
              : "This action cannot be undone."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTransactionToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirmed}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
