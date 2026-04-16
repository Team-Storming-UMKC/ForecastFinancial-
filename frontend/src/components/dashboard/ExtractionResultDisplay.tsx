"use client";

import * as React from "react";
import {
    Box,
    Typography,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Alert,
    IconButton,
    Tooltip,
    Fade,
    Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { cardSurfaceSx } from "@/theme/tintedGlass";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ExtractedTransaction {
    id?: string;
    date: string;
    description: string;
    amount: number;
    category?: string;
    confidence?: number;
    status?: "confirmed" | "pending" | "flagged";
}

export interface ExtractionResult {
    transactions: ExtractedTransaction[];
    rawText?: string;
    extractedAt?: string;
    totalFound?: number;
    warnings?: string[];
}

interface ExtractionResultDisplayProps {
    result: ExtractionResult | null;
    onDismiss?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        signDisplay: "always",
    }).format(amount);
}

function formatDate(dateStr: string): string {
    try {
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(dateStr));
    } catch {
        return dateStr;
    }
}

function confidenceColor(confidence?: number): "success" | "warning" | "error" | "default" {
    if (confidence === undefined) return "default";
    if (confidence >= 0.85) return "success";
    if (confidence >= 0.6) return "warning";
    return "error";
}

function confidenceLabel(confidence?: number): string {
    if (confidence === undefined) return "N/A";
    if (confidence >= 0.85) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
}

// ── Summary Bar ────────────────────────────────────────────────────────────────

function SummaryBar({ transactions }: { transactions: ExtractedTransaction[] }) {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.08)" }} />}
            sx={{
                p: 2,
                bgcolor: "rgba(0,0,0,0.2)",
                borderRadius: 1.5,
                border: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            {[
                { label: "Transactions Found", value: transactions.length, color: "text.primary", mono: false },
                { label: "Total Income", value: formatCurrency(income), color: "success.main", mono: true },
                { label: "Total Expenses", value: formatCurrency(expenses), color: "error.main", mono: true },
                { label: "Net", value: formatCurrency(total), color: total >= 0 ? "success.main" : "error.main", mono: true },
            ].map(({ label, value, color, mono }) => (
                <Box key={label} sx={{ textAlign: "center", flex: 1 }}>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }} display="block">
                        {label}
                    </Typography>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        color={color}
                        sx={mono ? { fontFamily: "monospace" } : {}}
                    >
                        {value}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ExtractionResultDisplay({
                                                    result,
                                                    onDismiss,
                                                }: ExtractionResultDisplayProps) {
    if (!result) return null;

    const { transactions, warnings, extractedAt } = result;
    const hasWarnings = warnings && warnings.length > 0;
    const isEmpty = transactions.length === 0;

    return (
        <Fade in timeout={400}>
            <Box
                sx={{
                    ...cardSurfaceSx,
                    overflow: "hidden",
                }}
            >
                {/* ── Header ── */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <AutoFixHighIcon
                            fontSize="small"
                            sx={{ color: isEmpty ? "warning.main" : "rgba(255,107,0,0.9)" }}
                        />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.3px" }}>
                                AI Extraction Complete
                            </Typography>
                            {extractedAt && (
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.45)" }}>
                                    {new Date(extractedAt).toLocaleTimeString()}
                                </Typography>
                            )}
                        </Box>
                        <Chip
                            size="small"
                            icon={isEmpty ? <WarningAmberIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                            label={
                                isEmpty
                                    ? "No transactions found"
                                    : `${transactions.length} transaction${transactions.length !== 1 ? "s" : ""} extracted`
                            }
                            color={isEmpty ? "warning" : "success"}
                            variant="outlined"
                        />
                    </Stack>

                    {onDismiss && (
                        <Tooltip title="Dismiss">
                            <IconButton
                                size="small"
                                onClick={onDismiss}
                                sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff" } }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* ── Body ── */}
                <Box sx={{ p: 3, position: "relative", zIndex: 1 }}>
                    <Stack spacing={3}>
                        {hasWarnings &&
                            warnings!.map((w, i) => (
                                <Alert key={i} severity="warning" icon={<ErrorOutlineIcon />}
                                       sx={{ bgcolor: "rgba(255,170,0,0.1)", color: "rgba(255,255,255,0.85)" }}>
                                    {w}
                                </Alert>
                            ))}

                        {isEmpty ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <WarningAmberIcon sx={{ fontSize: 48, color: "warning.main", mb: 1 }} />
                                <Typography variant="body1" fontWeight={600} sx={{ color: "text.primary" }}>
                                    No transactions could be extracted
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", mt: 0.5 }}>
                                    Try pasting more structured financial data (e.g. bank statements, receipts).
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <SummaryBar transactions={transactions} />

                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ "& th": { borderColor: "rgba(255,255,255,0.08)" } }}>
                                                {["Date", "Description", "Category", "Amount", "AI Confidence"].map((h, i) => (
                                                    <TableCell
                                                        key={h}
                                                        align={i === 3 ? "right" : i === 4 ? "center" : "left"}
                                                        sx={{ fontWeight: 700, color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}
                                                    >
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {transactions.map((tx, idx) => (
                                                <TableRow
                                                    key={tx.id ?? idx}
                                                    hover
                                                    sx={{
                                                        "&:last-child td": { border: 0 },
                                                        "& td": { borderColor: "rgba(255,255,255,0.05)" },
                                                        bgcolor: tx.status === "flagged" ? "rgba(255,50,50,0.08)" : "transparent",
                                                        "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" noWrap sx={{ color: "rgba(255,255,255,0.7)" }}>
                                                            {formatDate(tx.date)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500} sx={{ color: "text.primary" }}>
                                                            {tx.description}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {tx.category ? (
                                                            <Chip
                                                                label={tx.category}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: "0.7rem", borderColor: "rgba(255,107,0,0.4)", color: "rgba(255,107,0,0.9)" }}
                                                            />
                                                        ) : (
                                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)" }}>
                                                                Uncategorized
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={700}
                                                            color={tx.amount >= 0 ? "success.main" : "error.main"}
                                                            sx={{ fontFamily: "monospace" }}
                                                        >
                                                            {formatCurrency(tx.amount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={confidenceLabel(tx.confidence)}
                                                            size="small"
                                                            color={confidenceColor(tx.confidence)}
                                                            variant="filled"
                                                            sx={{ fontSize: "0.7rem", minWidth: 60 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Fade>
    );
}
