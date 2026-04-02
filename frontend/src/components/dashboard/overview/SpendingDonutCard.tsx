"use client";

import * as React from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import DashboardSurface from "./DashboardSurface";
import { CategoryTotal, formatCurrency } from "./dashboardOverview.utils";

const PIE_COLORS = [
  "#8f63e7",
  "#ff8b85",
  "#42c1e5",
  "#ffb357",
  "#7b86ff",
  "#6cd598",
  "#7f65c7",
  "#4aa3ff",
  "#8f96a3",
];

export default function SpendingDonutCard({ categories }: { categories: CategoryTotal[] }) {
  const theme = useTheme();
  const total = categories.reduce((sum, item) => sum + item.value, 0);

  return (
    <DashboardSurface sx={{ minHeight: 340 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(260px, 1fr) auto" },
          alignItems: "center",
          gap: { xs: 2, sm: 3 },
          height: "100%",
          p: { xs: 2, md: 2.5 },
        }}
      >
        <Box sx={{ minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="value"
                nameKey="name"
                innerRadius={88}
                outerRadius={118}
                paddingAngle={0}
                stroke="none"
              >
                {categories.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <Box
            sx={{
              position: "relative",
              mt: "-54%",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography sx={{ ...theme.typography.h5, fontWeight: 600, color: "text.primary" }}>
              {formatCurrency(total)}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={0.75} sx={{ minWidth: 0, pr: { sm: 1 } }}>
          {categories.map((entry, index) => (
            <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                }}
              />
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: 12,
                  lineHeight: 1.35,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {entry.name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </DashboardSurface>
  );
}
