"use client";

import * as React from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

export type TransactionDraft = {
    merchantName: string;
    amount: string; // signed decimal
    date: string;
    category: string;
};

type DraftErrors = Partial<Record<keyof TransactionDraft, string>>;

/**
 * Valid examples:
 * 12
 * -12
 * +12
 * 12.3
 * -12.34
 * +0.99
 */
function isValidMoney(value: string): boolean {
    return /^[+-]?\d+(\.\d{1,2})?$/.test(value);
}

function isValidISODate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
}

export default function TransactionForm({
                                            onCreate,
                                        }: {
    onCreate: (draft: TransactionDraft) => Promise<void> | void;
}) {
    const [merchantName, setMerchantName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [date, setDate] = React.useState("");
    const [category, setCategory] = React.useState("");

    const [errors, setErrors] = React.useState<DraftErrors>({});
    const [submitting, setSubmitting] = React.useState(false);

    const clearError = (key: keyof TransactionDraft) => {
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    };

    function validate(): boolean {
        const next: DraftErrors = {};

        const m = merchantName.trim();
        const c = category.trim();
        const a = amount.trim();
        const d = date.trim();

        if (!m) next.merchantName = "Merchant is required.";
        else if (m.length > 60) next.merchantName = "Max 60 characters.";

        if (!c) next.category = "Category is required.";
        else if (c.length > 40) next.category = "Max 40 characters.";

        if (!a) next.amount = "Amount is required.";
        else if (!isValidMoney(a))
            next.amount = "Enter a valid number (max 2 decimals, +/- allowed).";
        else if (Number(a) === 0)
            next.amount = "Amount cannot be 0.";

        if (!d) next.date = "Date is required.";
        else if (!isValidISODate(d)) next.date = "Enter a valid date.";

        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (submitting) return;

        if (!validate()) return;

        setSubmitting(true);
        try {
            await onCreate({
                merchantName: merchantName.trim(),
                amount: amount.trim(),
                date: date.trim(),
                category: category.trim(),
            });

            // Reset form
            setMerchantName("");
            setAmount("");
            setDate("");
            setCategory("");
            setErrors({});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Add Transaction
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                        <TextField
                            label="Merchant"
                            value={merchantName}
                            onChange={(e) => {
                                setMerchantName(e.target.value);
                                clearError("merchantName");
                            }}
                            error={!!errors.merchantName}
                            helperText={errors.merchantName ?? " "}
                            inputProps={{ maxLength: 60 }}
                            fullWidth
                            disabled={submitting}
                        />

                        <TextField
                            label="Amount (+ income / - expense)"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                clearError("amount");
                            }}
                            error={!!errors.amount}
                            helperText={errors.amount ?? " "}
                            fullWidth
                            disabled={submitting}
                            type="text" // important: NOT number so + and - behave properly
                            inputProps={{
                                inputMode: "decimal",
                                placeholder: "-45.99 or +1200",
                            }}
                        />

                        <TextField
                            label="Date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                clearError("date");
                            }}
                            error={!!errors.date}
                            helperText={errors.date ?? " "}
                            fullWidth
                            disabled={submitting}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Category"
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                clearError("category");
                            }}
                            error={!!errors.category}
                            helperText={errors.category ?? " "}
                            inputProps={{ maxLength: 40 }}
                            fullWidth
                            disabled={submitting}
                        />

                        <Button
                            variant="contained"
                            type="submit"
                            disabled={submitting}
                            sx={{ minWidth: 160 }}
                        >
                            {submitting ? "Adding…" : "Add"}
                        </Button>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}