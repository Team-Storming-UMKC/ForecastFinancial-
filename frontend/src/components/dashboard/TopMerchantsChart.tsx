"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export interface MerchantPoint {
  name: string;
  value: number;
}

interface TopMerchantsChartProps {
  data: MerchantPoint[];
}

export default function TopMerchantsChart({ data }: TopMerchantsChartProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Top Merchants
        </Typography>

        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v?: number) => money(Number(v ?? 0))} />
              <Legend />
              <Bar dataKey="value" name="Spending" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="caption" color="text.secondary">
          (Bars are your top merchants in this range.)
        </Typography>
      </CardContent>
    </Card>
  );
}

