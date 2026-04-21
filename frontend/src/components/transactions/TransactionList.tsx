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
import { cardContentSx, cardSurfaceSx } from "@/theme/tintedGlass";
import { amountBadgeSx, categoryPillSx } from "./categoryTagStyles";
import TransactionControlDropdown from "./TransactionControlDropdown";

export type Transaction = {
  id: number;
  merchantName: string;
  amount: number;
  date: string;
  category: string;
};

type SortKey = "newest" | "oldest" | "amountHigh" | "amountLow" | "merchant" | "category";
const ALL_CATEGORIES = "__all_categories__";

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Amount high", value: "amountHigh" },
  { label: "Amount low", value: "amountLow" },
  { label: "Merchant A-Z", value: "merchant" },
  { label: "Category A-Z", value: "category" },
];

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

function dateValue(date: string) {
  const parsed = new Date(date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function TransactionList({
  loading,
  transactions,
  onEdit,
  onDelete,
  showHeader = true,
  showControls = true,
  title = "Recent transactions",
  description = "Review, edit, and remove entries without leaving the dashboard.",
  headerAction,
}: {
  loading: boolean;
  transactions?: Transaction[];
  onEdit?: (tx: Transaction) => void | Promise<void>;
  onDelete?: (id: number) => void | Promise<void>;
  showHeader?: boolean;
  showControls?: boolean;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sortKey, setSortKey] = React.useState<SortKey>("newest");
  const [categoryFilter, setCategoryFilter] = React.useState(ALL_CATEGORIES);
  const rows = React.useMemo(() => (Array.isArray(transactions) ? transactions : []), [transactions]);
  const categoryFilterOptions = React.useMemo(() => {
    const categories = Array.from(
      new Set(rows.map((tx) => tx.category.trim()).filter((category) => category.length > 0)),
    ).sort((a, b) => a.localeCompare(b));

    return [
      { label: "All categories", value: ALL_CATEGORIES },
      ...categories.map((category) => ({ label: category, value: category })),
    ];
  }, [rows]);
  const visibleRows = React.useMemo(() => {
    const filtered = rows.filter((tx) => {
      if (categoryFilter !== ALL_CATEGORIES) return tx.category.trim() === categoryFilter;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const amountA = Number(a.amount);
      const amountB = Number(b.amount);

      switch (sortKey) {
        case "oldest":
          return dateValue(a.date) - dateValue(b.date);
        case "amountHigh":
          return Math.abs(amountB) - Math.abs(amountA);
        case "amountLow":
          return Math.abs(amountA) - Math.abs(amountB);
        case "merchant":
          return a.merchantName.localeCompare(b.merchantName);
        case "category":
          return a.category.localeCompare(b.category);
        case "newest":
        default:
          return dateValue(b.date) - dateValue(a.date);
      }
    });
  }, [categoryFilter, rows, sortKey]);
  const entryLabel =
    visibleRows.length === rows.length
      ? `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`
      : `${visibleRows.length} of ${rows.length}`;

  return (
    <Box
      sx={{
        ...cardSurfaceSx,
        overflow: "visible",
      }}
    >
      <Box sx={{ ...cardContentSx, p: { xs: 2, md: 2.5 } }}>
        {showHeader ? (
          <>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ mb: 1.25 }}
              gap={1}
              spacing={1}
            >
              <Box sx={{ pb: 1 }}>
                <Typography fontWeight={800} sx={{ letterSpacing: 0.2, color: "text.primary" }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {description}
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "stretch", md: "flex-end" }}
                spacing={1.25}
                gap={2}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                {showControls && !loading && rows.length > 0 ? (
                  <>
                    <TransactionControlDropdown
                      label="Sort"
                      value={sortKey}
                      options={SORT_OPTIONS}
                      onChange={(value) => setSortKey(value as SortKey)}
                    />
                    <TransactionControlDropdown
                      label="Filter"
                      value={categoryFilter}
                      options={categoryFilterOptions}
                      onChange={setCategoryFilter}
                    />
                  </>
                ) : null}

                {showControls ? (
                  <Chip
                    label={entryLabel}
                    sx={{
                      height: 42,
                      alignSelf: { xs: "flex-start", md: "flex-end" },
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "text.primary",
                      fontWeight: 700,
                    }}
                  />
                ) : null}
                {headerAction}
              </Stack>
            </Stack>

            <Divider sx={{ mb: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />
          </>
        ) : null}

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
        ) : visibleRows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No transactions match these controls.
          </Typography>
        ) : isMobile ? (
          <Stack spacing={1.25}>
            {visibleRows.map((tx) => {
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

                    <Stack alignItems="flex-end" spacing={0.75}>
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
                      <Chip label={isNegative ? "Expense" : "Income"} size="small" sx={amountBadgeSx(!isNegative)} />
                    </Stack>
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.25 }}>
                    <Chip
                      label={tx.category}
                      size="small"
                      sx={categoryPillSx(tx.category)}
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
                {visibleRows.map((tx) => {
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
                          sx={categoryPillSx(tx.category)}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>{formatDate(tx.date)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                          <Chip label={isNegative ? "Expense" : "Income"} size="small" sx={amountBadgeSx(!isNegative)} />
                          <Box
                            component="span"
                            sx={{
                              color: isNegative ? "error.light" : "success.light",
                              fontVariantNumeric: "tabular-nums",
                              minWidth: 88,
                            }}
                          >
                            {isNegative ? "-" : "+"}
                            {formatAmount(amt)}
                          </Box>
                        </Stack>
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
