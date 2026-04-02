"use client";

import * as React from "react";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import DashboardSurface from "./DashboardSurface";
import { RecentTransactionRow, formatCurrency, formatTransactionDate } from "./dashboardOverview.utils";

interface RecentTransactionsCardProps {
  transactions: RecentTransactionRow[];
  onImportClick: () => void;
}

export default function RecentTransactionsCard({
  transactions,
  onImportClick,
}: RecentTransactionsCardProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <DashboardSurface>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Typography sx={{ ...theme.typography.body1, fontWeight: 600, color: "text.primary" }}>
            Recent Transactions
          </Typography>

          <Button
            variant="contained"
            onClick={onImportClick}
            sx={{
              minHeight: 0,
              px: 1.75,
              py: 0.75,
              borderRadius: `${theme.customTokens.radii.card}px`,
              backgroundColor: theme.palette.primary.main,
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.24)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                filter: "brightness(1.05)",
              },
            }}
          >
            Import Transactions
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(200px, 1.2fr) minmax(160px, 1fr) minmax(110px, 0.7fr) minmax(96px, 0.6fr)",
            columnGap: 2,
            px: 0.5,
            mb: 1,
          }}
        >
          {["Source", "Category", "Date", "Amount"].map((label, index) => (
            <Typography
              key={label}
              sx={{
                color: "#a4a4a4",
                fontSize: 16,
                fontWeight: 600,
                textAlign: index === 3 ? "right" : "left",
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        <Stack spacing={0}>
          {transactions.map((transaction) => {
            const isExpense = transaction.displayAmount < 0;

            return (
              <Box
                key={transaction.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(200px, 1.2fr) minmax(160px, 1fr) minmax(110px, 0.7fr) minmax(96px, 0.6fr)",
                  columnGap: 2,
                  alignItems: "center",
                  minHeight: 48,
                  borderTop: "1px solid rgba(164,164,164,0.45)",
                  px: 0.5,
                }}
              >
                <Typography sx={{ color: "text.primary", fontWeight: 500 }}>{transaction.merchantName}</Typography>
                <Typography sx={{ color: "text.primary", textAlign: "right" }}>{transaction.category}</Typography>
                <Typography sx={{ color: "text.primary", textAlign: "right" }}>
                  {formatTransactionDate(transaction.date)}
                </Typography>
                <Typography
                  sx={{
                    color: isExpense ? "#ff2c2c" : "#17b61a",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {isExpense ? "-" : "+"}
                  {formatCurrency(Math.abs(transaction.displayAmount))}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push("/transactions")}
            sx={{
              minHeight: 28,
              px: 1.5,
              py: 0.5,
              borderRadius: `${theme.customTokens.radii.card}px`,
              backgroundColor: "#a4a4a4",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.5)",
              "&:hover": {
                backgroundColor: "#a4a4a4",
                filter: "brightness(1.05)",
              },
            }}
          >
            Show more
          </Button>
        </Box>
      </Box>
    </DashboardSurface>
  );
}
