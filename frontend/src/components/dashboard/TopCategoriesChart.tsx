"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const PIE_COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7f7f",
  "#8dd1e1", "#a4de6c", "#d0ed57", "#d88884",
];

export interface CategoryPoint {
  name: string;
  value: number;
}

interface TopCategoriesChartProps {
  data: CategoryPoint[];
}

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Top Categories
        </Typography>

        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v?: number) => money(Number(v ?? 0))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

