"use client";

import { Box, Typography } from "@mui/material";
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
import { tintedGlass } from "@/theme/tintedGlass";

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
            Spending Trend
          </Typography>

          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
                <XAxis
                    dataKey="key"
                    tickMargin={8}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                />
                <YAxis
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                    tickLine={false}
                />
                <Tooltip
                    formatter={(v?: number) => money(Number(v ?? 0))}
                    contentStyle={{
                      background: "rgba(15,20,30,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: 13,
                    }}
                    cursor={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <Line
                    type="monotone"
                    dataKey="spending"
                    name="Spending"
                    stroke="#ff6b00"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#ff6b00", stroke: "rgba(255,107,0,0.3)", strokeWidth: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>
  );
}

