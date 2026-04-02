"use client";

import * as React from "react";
import { Box, FormControl, MenuItem, Select, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import DashboardSurface from "./DashboardSurface";
import { CategoryTotal, formatCompactCurrency } from "./dashboardOverview.utils";

interface CategoryBarChartCardProps {
  categories: CategoryTotal[];
  month: number;
  year: number;
  availableMonths: { value: number; label: string }[];
  availableYears: number[];
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export default function CategoryBarChartCard({
  categories,
  month,
  year,
  availableMonths,
  availableYears,
  onMonthChange,
  onYearChange,
}: CategoryBarChartCardProps) {
  const theme = useTheme();
  const maxValue = Math.max(...categories.map((item) => item.value), 0);
  const paddedMax = maxValue > 0 ? Math.ceil(maxValue / 200) * 200 + 200 : 1000;

  return (
    <DashboardSurface sx={{ minHeight: 340 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: { xs: 2, md: 2.5 }, height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Typography sx={{ ...theme.typography.body1, fontWeight: 600, color: "text.primary" }}>
            Spending Per Category
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <FormControl size="small">
              <Select
                value={month}
                onChange={(event) => onMonthChange(Number(event.target.value))}
                sx={selectSx(theme)}
              >
                {availableMonths.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small">
              <Select
                value={year}
                onChange={(event) => onYearChange(Number(event.target.value))}
                sx={selectSx(theme)}
              >
                {availableYears.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ top: 12, right: 18, left: 18, bottom: 0 }}
              barCategoryGap={10}
            >
              <XAxis
                type="number"
                domain={[0, paddedMax]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={16}>
                {categories.map((entry) => (
                  <Cell key={entry.name} fill="#ff870f" />
                ))}
                <LabelList
                  dataKey="value"
                  position="insideRight"
                  formatter={(value) => formatCompactCurrency(Number(value ?? 0))}
                  style={{ fill: "#ffffff", fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </DashboardSurface>
  );
}

function selectSx(theme: Theme) {
  return {
    minWidth: 78,
    height: 28,
    borderRadius: `${theme.customTokens.radii.card}px`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: 14,
    fontWeight: 600,
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    "& .MuiSelect-select": {
      py: 0.375,
      pl: 1.25,
      pr: 3.5,
    },
    "& .MuiSvgIcon-root": {
      color: theme.palette.primary.contrastText,
    },
  };
}
