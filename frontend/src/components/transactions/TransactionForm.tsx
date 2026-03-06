"use client";

import * as React from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";

export type TransactionDraft = {
    merchantName: string;
    amount: string;
    date: string;
    category: string;
};

type DraftErrors = Partial<Record<keyof TransactionDraft, string>>;

function isValidMoney(value: string): boolean {
    return /^[+-]?\d+(\.\d{1,2})?$/.test(value);
}

function isValidISODate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
}

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        color: "text.primary",
        bgcolor: "rgba(255,255,255,0.04)",
        "& fieldset": {
            borderColor: "rgba(255,255,255,0.12)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(255,255,255,0.25)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "primary.main",
        },
        "& input": {
            paddingLeft: "14px",
            paddingRight: "14px",
            paddingTop: "12px",
            paddingBottom: "12px",
        },
        "& input::placeholder": {
            color: "rgba(255,255,255,0.35)",
            opacity: 1,
        },
    },
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.4)",
        "&.Mui-focused": {
            color: "primary.main",
        },
    },
    "& .MuiFormHelperText-root": {
        color: "rgba(255,255,255,0.35)",
        "&.Mui-error": {
            color: "error.main",
        },
    },
    // Fix date input calendar icon color
    "& input[type='date']::-webkit-calendar-picker-indicator": {
        filter: "invert(1) opacity(0.4)",
        cursor: "pointer",
    },
};

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
        else if (Number(a) === 0) next.amount = "Amount cannot be 0.";

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
        <Box
            sx={{
                ...tintedGlass,
                borderRadius: "20px",
                p: { xs: 2.5, sm: 3 },
                mb: 2,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                    pointerEvents: "none",
                    zIndex: 0,
                },
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    fontWeight={700}
                    sx={{ mb: 2.5, color: "text.primary", letterSpacing: "-0.3px" }}
                >
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
                            sx={fieldSx}
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
                            type="text"
                            inputProps={{
                                inputMode: "decimal",
                                placeholder: "-45.99 or +1200",
                            }}
                            sx={fieldSx}
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
                            sx={fieldSx}
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
                            sx={fieldSx}
                        />

                        <Button
                            variant="contained"
                            type="submit"
                            disabled={submitting}
                            sx={{
                                minWidth: 120,
                                borderRadius: "10px",
                                alignSelf: { xs: "stretch", md: "flex-start" },
                                mt: { xs: 0, md: "4px" }, // optically align with text fields
                                py: 1.75,
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
                                boxShadow: "0px 4px 20px rgba(255,107,0,0.35)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, #ff7a1a 0%, #ffa020 100%)",
                                    boxShadow: "0px 8px 24px rgba(255,107,0,0.5)",
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            {submitting ? "Adding…" : "Add"}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
}