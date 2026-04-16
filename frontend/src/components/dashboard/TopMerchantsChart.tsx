"use client";

import { Box, Typography } from "@mui/material";
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
import { cardSurfaceSx } from "@/theme/tintedGlass";

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
      <Box
          sx={{
            ...cardSurfaceSx,
            p: { xs: 2.5, sm: 3 },
          }}
      >
        <Box>
          <Typography
              fontWeight={700}
              sx={{ mb: 2, color: "text.primary", letterSpacing: "-0.3px" }}
          >
            Top Merchants
          </Typography>

          <Box sx={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.07)"
                />
                <XAxis
                    dataKey="name"
                    hide
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
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Legend
                    wrapperStyle={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 12,
                    }}
                />
                <Bar
                    dataKey="value"
                    name="Spending"
                    fill="#ff6b00"
                    radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)", mt: 1, display: "block" }}>
            Bars represent your top merchants in this range.
          </Typography>
        </Box>
      </Box>
  );
}
