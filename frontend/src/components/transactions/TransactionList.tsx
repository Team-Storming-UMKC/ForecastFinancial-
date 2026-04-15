"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
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

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
}

function formatDate(date: string) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC", // <-- Add this line right here
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

export default function TransactionList({
  loading,
  transactions,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  transactions?: Transaction[];
  onEdit?: (tx: Transaction) => void | Promise<void>;
  onDelete?: (id: number) => void | Promise<void>;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1.25 }}
          spacing={1}
        >
          <Box>
            <Typography fontWeight={800} sx={{ letterSpacing: 0.2, color: "text.primary" }}>
              Recent transactions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review, edit, and remove entries without leaving the dashboard.
            </Typography>
          </Box>

          <Chip
            label={`${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              color: "text.primary",
              fontWeight: 700,
            }}
          />
        </Stack>

        <Divider sx={{ mb: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />

        {loading ? (
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ py: 2 }}>
            <CircularProgress size={18} sx={{ color: "primary.main" }} />
            <Typography variant="body2" color="text.secondary">
              Loading...
            </Typography>
          </Stack>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No transactions yet. Add one to start building your spending history.
          </Typography>
        ) : isMobile ? (
          <Stack spacing={1.25}>
            {rows.map((tx) => {
              const amt = Number(tx.amount);
              const isNegative = amt < 0;

              return (
                <Box
                  key={tx.id}
                  sx={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 3,
                    p: 1.5,
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={700} sx={{ color: "text.primary" }}>
                        {tx.merchantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {formatDate(tx.date)}
                      </Typography>
                    </Box>

                    <Typography
                      fontWeight={800}
                      sx={{
                        color: isNegative ? "error.light" : "success.light",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isNegative ? "-" : "+"}
                      {formatAmount(amt)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
                    <Chip
                      label={tx.category}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "text.primary",
                      }}
                    />

                    {(onEdit || onDelete) && (
                      <Stack direction="row" spacing={1}>
                        {onEdit ? (
                          <Button size="small" variant="text" onClick={() => onEdit(tx)}>
                            Edit
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button size="small" color="error" variant="text" onClick={() => onDelete(tx.id)}>
                            Delete
                          </Button>
                        ) : null}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
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
                  <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Merchant</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Date</TableCell>
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
                  const isNegative = amt < 0;

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
                      <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>{tx.merchantName}</TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        <Chip
                          label={tx.category}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.08)",
                            color: "text.primary",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>{formatDate(tx.date)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        <Box
                          component="span"
                          sx={{
                            color: isNegative ? "error.light" : "success.light",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {isNegative ? "-" : "+"}
                          {formatAmount(amt)}
                        </Box>
                      </TableCell>
                      {(onEdit || onDelete) && (
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {onEdit ? (
                              <Button size="small" variant="text" onClick={() => onEdit(tx)}>
                                Edit
                              </Button>
                            ) : null}
                            {onDelete ? (
                              <Button size="small" color="error" variant="text" onClick={() => onDelete(tx.id)}>
                                Delete
                              </Button>
                            ) : null}
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
      </Box>
    </Box>
  );
}
