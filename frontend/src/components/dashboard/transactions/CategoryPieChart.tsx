"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

export default function CategoryPieChart({
  data,
  formatMoney,
}: {
  data: { name: string; value: number }[];
  formatMoney: (n: number) => string;
}) {
  const colors = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57","#d88884"];

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
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: ValueType) => formatMoney(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
