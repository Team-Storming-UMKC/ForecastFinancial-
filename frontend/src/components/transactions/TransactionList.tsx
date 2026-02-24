"use client";

import * as React from "react";
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

export type Transaction = {
    id: number;
    merchantName: string;
    amount: number;
    date: string;
    category: string;
};

export default function TransactionList({
                                            loading,
                                            transactions,
                                            onEdit,
                                            onDelete,
                                        }: {
    loading: boolean;
    transactions: Transaction[];
    onEdit: (tx: Transaction) => void | Promise<void>;
    onDelete: (id: number) => void | Promise<void>;
}) {
    return (
        <Card>
            <CardContent>
                <Typography fontWeight={700} sx={{ mb: 1 }}>
                    List
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={18} />
                        <Typography variant="body2" color="text.secondary">
                            Loading…
                        </Typography>
                    </Stack>
                ) : transactions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No transactions yet. Add one above.
                    </Typography>
                ) : (
                    <Stack spacing={1.25}>
                        {transactions.map((tx) => (
                            <Card key={tx.id} variant="outlined">
                                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        alignItems={{ xs: "flex-start", md: "center" }}
                                        justifyContent="space-between"
                                        spacing={1}
                                    >
                                        <div>
                                            <Typography fontWeight={800}>
                                                {tx.merchantName} • ${Number(tx.amount).toFixed(2)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tx.date} • {tx.category} • ID: {tx.id}
                                            </Typography>
                                        </div>

                                        <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="outlined" onClick={() => onEdit(tx)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                onClick={() => onDelete(tx.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}