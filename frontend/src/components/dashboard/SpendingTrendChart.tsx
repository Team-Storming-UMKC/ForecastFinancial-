"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
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

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export interface TimeSeriesPoint {
  key: string;
  spending: number;
}

interface SpendingTrendChartProps {
  data: TimeSeriesPoint[];
}

export default function SpendingTrendChart({ data }: SpendingTrendChartProps) {
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
              <Tooltip formatter={(v?: number) => money(Number(v ?? 0))} />
              <Legend />
              <Line type="monotone" dataKey="spending" name="Spending" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

