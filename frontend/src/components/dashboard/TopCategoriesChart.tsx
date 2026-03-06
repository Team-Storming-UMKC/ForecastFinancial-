"use client";

import { Box, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { tintedGlass } from "@/theme/tintedGlass";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const PIE_COLORS = [
  "#ff6b00", "#ff9500", "#ffb347", "#ffd27f",
  "#82ca9d", "#8dd1e1", "#8884d8", "#d88884",
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
      <Box
          sx={{
            ...tintedGlass,
            borderRadius: "20px",
            p: { xs: 2.5, sm: 3 },
            position: "relative",
            overflow: "hidden",
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
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography fontWeight={700} sx={{ mb: 2, color: "text.primary", letterSpacing: "-0.3px" }}>
            Top Categories
          </Typography>

          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                    strokeWidth={0}
                >
                  {data.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                    formatter={(v?: number) => money(Number(v ?? 0))}
                    contentStyle={{
                      background: "rgba(15,20,30,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: 13,
                    }}
                />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
  );
}

