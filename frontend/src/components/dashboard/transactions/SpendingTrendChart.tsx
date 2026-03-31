"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function SpendingTrendChart({
  data,
  formatMoney,
}: {
  data: { key: string; spending: number }[];
  formatMoney: (n: number) => string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Spending Trend
        </Typography>

        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="key" tickMargin={8} />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value: ValueType) => formatMoney(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="spending" name="Spending" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
