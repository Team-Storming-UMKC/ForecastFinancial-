"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export default function TopMerchantsBarChart({
  data,
  formatMoney,
}: {
  data: { name: string; value: number }[];
  formatMoney: (n: number) => string;
}) {
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
              <Tooltip formatter={(v: any) => formatMoney(Number(v))} />
              <Legend />
              <Bar dataKey="value" name="Spending" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}