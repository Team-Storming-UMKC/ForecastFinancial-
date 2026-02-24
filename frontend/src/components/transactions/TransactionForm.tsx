"use client";

import * as React from "react";
import { Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

export type TransactionDraft = {
    merchantName: string;
    amount: string; // keep as string for input
    date: string;
    category: string;
};

export default function TransactionForm({
                                            onCreate,
                                        }: {
    onCreate: (draft: TransactionDraft) => Promise<void> | void;
}) {
    const [merchantName, setMerchantName] = React.useState("Target");
    const [amount, setAmount] = React.useState("12.34");
    const [date, setDate] = React.useState("2026-02-24");
    const [category, setCategory] = React.useState("Groceries");

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Add Transaction
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                        label="Merchant"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Date (YYYY-MM-DD)"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        sx={{ minWidth: 140 }}
                        onClick={() => onCreate({ merchantName, amount, date, category })}
                    >
                        Add
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}