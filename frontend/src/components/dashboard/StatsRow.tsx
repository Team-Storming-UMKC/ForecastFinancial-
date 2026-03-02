"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface StatsRowProps {
  totalSpending: number;
  transactionCount: number;
}

export default function StatsRow({ totalSpending, transactionCount }: StatsRowProps) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
      <Stat label="Total spending" value={money(totalSpending)} />
      <Stat label="Transactions" value={String(transactionCount)} />
      <Stat
        label="Avg / transaction"
        value={money(totalSpending / Math.max(1, transactionCount))}
      />
    </Box>
  );
}

