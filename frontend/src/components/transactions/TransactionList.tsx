"use client";

import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

export type Transaction = {
    id: number;
    merchantName: string; // you can treat this as Source if you want
    amount: number;
    date: string;
    category: string;
};

export default function RecentTransactionsTable({
                                                    loading,
                                                    transactions,
                                                    onImport,
                                                    onShowMore,
                                                }: {
    loading: boolean;
    transactions: Transaction[];
    onImport?: () => void | Promise<void>;
    onShowMore?: () => void | Promise<void>;
}) {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            sx={{
                borderRadius: 4,
                overflow: "hidden",

                // liquid glass look (works with your dark theme)
                bgcolor: "background.paper",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.65)",
            }}
        >
            <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                    <Typography fontWeight={800} sx={{ letterSpacing: 0.2 }}>
                        Recent Transactions
                    </Typography>

                    <Button
                        onClick={onImport}
                        variant="contained"
                        size={isSm ? "small" : "medium"}
                        sx={{
                            borderRadius: 999,
                            px: 2.2,
                            py: 0.8,
                            fontWeight: 800,
                            boxShadow: "0 10px 26px rgba(255,122,24,0.35)",
                        }}
                    >
                        Import Transactions
                    </Button>
                </Stack>

                <Divider sx={{ mb: 1.25, opacity: 0.25 }} />

                {/* Body */}
                {loading ? (
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ py: 2 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2" color="text.secondary">
                            Loading…
                        </Typography>
                    </Stack>
                ) : transactions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No transactions yet.
                    </Typography>
                ) : (
                    <TableContainer
                        sx={{
                            // makes it responsive: table can scroll horizontally on tiny screens
                            overflowX: "auto",
                            borderRadius: 3,
                            margin: 15,
                        }}
                    >
                        <Table
                            size="small"
                            sx={{
                                minWidth: 700, // enables horizontal scroll instead of breaking layout
                                "& th, & td": { borderColor: "rgba(255,255,255,0.10)" },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: 700, width: "45%" }}>
                                        Source
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: 700, width: "25%" }}>
                                        Category
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: 700, width: "15%" }}>
                                        Date
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{ color: "text.secondary", fontWeight: 700, width: "15%" }}
                                    >
                                        Amount
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {transactions.map((tx) => {
                                    const amt = Number(tx.amount);
                                    const isNeg = amt < 0;

                                    return (
                                        <TableRow
                                            key={tx.id}
                                            hover
                                            sx={{
                                                "&:hover td": {
                                                    backgroundColor: "rgba(255,255,255,0.03)",
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {tx.merchantName}
                                            </TableCell>

                                            <TableCell sx={{ color: "text.primary" }}>
                                                {tx.category}
                                            </TableCell>

                                            <TableCell sx={{ color: "text.primary" }}>
                                                {tx.date}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        color: isNeg ? "text.primary" : "text.primary",
                                                        opacity: 0.95,
                                                        fontVariantNumeric: "tabular-nums",
                                                    }}
                                                >
                                                    {isNeg ? "-" : "+"}${Math.abs(amt).toFixed(2)}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Footer */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.25 }}>
                    <Button
                        onClick={onShowMore}
                        size="small"
                        variant="contained"
                        sx={{
                            borderRadius: 999,
                            px: 2,
                            py: 0.6,
                            fontWeight: 800,
                            bgcolor: "rgba(255,255,255,0.22)",
                            color: "text.primary",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
                        }}
                    >
                        Show more
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}