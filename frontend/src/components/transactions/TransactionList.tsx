"use client";

import * as React from "react";
import {
    Box,
    Button,
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
import { tintedGlass } from "@/theme/tintedGlass";

export type Transaction = {
    id: number;
    merchantName: string;
    amount: number;
    date: string;
    category: string;
};

export default function RecentTransactionsTable({
                                                    loading,
                                                    transactions,
                                                    onEdit,
                                                    onDelete,
                                                    onImport,
                                                    onShowMore,
                                                }: {
    loading: boolean;
    transactions?: Transaction[];
    onEdit?: (tx: Transaction) => void | Promise<void>;
    onDelete?: (id: number) => void | Promise<void>;
    onImport?: () => void | Promise<void>;
    onShowMore?: () => void | Promise<void>;
}) {
    const theme = useTheme();
    const isSm = useMediaQuery(theme.breakpoints.down("sm"));
    const rows = Array.isArray(transactions) ? transactions : [];

    return (
        <Box
            sx={{
                ...tintedGlass,
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
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
            <Box sx={{ position: "relative", zIndex: 1, p: { xs: 2, md: 2.5 } }}>

                {/* Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.25 }}
                >
                    <Typography fontWeight={800} sx={{ letterSpacing: 0.2, color: "text.primary" }}>
                        Recent Transactions
                    </Typography>

                    <Button
                        onClick={onImport}
                        variant="contained"
                        size={isSm ? "small" : "medium"}
                        sx={{
                            borderRadius: "10px",
                            px: 2.2,
                            py: 0.8,
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #ff6b00 0%, #ff9500 100%)",
                            boxShadow: "0px 4px 20px rgba(255,107,0,0.35)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #ff7a1a 0%, #ffa020 100%)",
                                boxShadow: "0px 8px 24px rgba(255,107,0,0.5)",
                                transform: "translateY(-1px)",
                            },
                        }}
                    >
                        Import Transactions
                    </Button>
                </Stack>

                <Divider sx={{ mb: 1.25, borderColor: "rgba(255,255,255,0.08)" }} />

                {/* Body */}
                {loading ? (
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ py: 2 }}>
                        <CircularProgress size={18} sx={{ color: "primary.main" }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading…
                        </Typography>
                    </Stack>
                ) : rows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No transactions yet.
                    </Typography>
                ) : (
                    <TableContainer sx={{ overflowX: "auto", borderRadius: "12px" }}>
                        <Table
                            size="small"
                            sx={{
                                minWidth: 700,
                                "& th, & td": { borderColor: "rgba(255,255,255,0.07)" },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>
                                        Source
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                        Category
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                        Date
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                        Amount
                                    </TableCell>
                                    {(onEdit || onDelete) && (
                                        <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                            Actions
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {rows.map((tx) => {
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
                                            <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                                                {tx.merchantName}
                                            </TableCell>

                                            <TableCell align="right" sx={{ color: "text.primary" }}>
                                                {tx.category}
                                            </TableCell>

                                            <TableCell align="right" sx={{ color: "text.primary" }}>
                                                {tx.date}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        color: isNeg ? "error.light" : "success.light",
                                                        fontVariantNumeric: "tabular-nums",
                                                    }}
                                                >
                                                    {isNeg ? "-" : "+"}${Math.abs(amt).toFixed(2)}
                                                </Box>
                                            </TableCell>

                                            {(onEdit || onDelete) && (
                                                <TableCell align="right">
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        justifyContent="flex-end"
                                                    >
                                                        {onEdit && (
                                                            <Button
                                                                size="small"
                                                                variant="text"
                                                                onClick={() => onEdit(tx)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                        {onDelete && (
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                variant="text"
                                                                onClick={() => onDelete(tx.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            )}
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
                            borderRadius: "10px",
                            px: 2,
                            py: 0.6,
                            fontWeight: 700,
                            bgcolor: "rgba(255,255,255,0.08)",
                            color: "text.primary",
                            boxShadow: "none",
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.14)",
                                boxShadow: "none",
                            },
                        }}
                    >
                        Show more
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}