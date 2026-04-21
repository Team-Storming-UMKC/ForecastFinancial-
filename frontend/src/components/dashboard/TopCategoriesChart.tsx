"use client";

import { Box, MenuItem, Select, Stack, Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { cardSurfaceSx } from "@/theme/tintedGlass";

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const PIE_COLORS = [
  "#8b67f4",
  "#ff8585",
  "#31bfd3",
  "#f7a543",
  "#5f8ee8",
  "#72d795",
  "#a370e8",
  "#44c7df",
  "#4ba7f5",
];

export interface CategoryPoint {
  name: string;
  value: number;
}

interface TopCategoriesChartProps {
  data: CategoryPoint[];
}

function CategoryTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0];
  const category = String(label ?? point.name ?? "Category");
  const amount = Number(point.value ?? 0);

  return (
    <Box sx={tooltipSx}>
      <Typography sx={tooltipTitleSx}>
        {category}
      </Typography>
      <Typography sx={tooltipValueSx}>
        {money(amount)}
      </Typography>
    </Box>
  );
}

function currentMonthLabel() {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date());
}

export default function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map((item) => item.value), 0);
  const axisMax = Math.max(2000, Math.ceil(maxValue / 200) * 200);
  const chartData = data.slice(0, 9);

  return (
      <Box
          sx={{
            ...cardSurfaceSx,
            p: { xs: 2, md: 2.5 },
            minHeight: { xs: 620, md: 433 },
          }}
      >
        <Box>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ position: "relative", mb: { xs: 2.5, md: 1.5 }, minHeight: 32 }}
          >
            <Typography
              fontWeight={600}
              sx={{ color: "text.primary", fontSize: 20, lineHeight: 1.5, textAlign: "center" }}
            >
              Spending Per Category
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: "none", sm: "flex" },
                position: "absolute",
                right: 0,
                top: 0,
              }}
            >
              <Select
                size="small"
                value={currentMonthLabel()}
                sx={selectSx}
              >
                <MenuItem value={currentMonthLabel()}>{currentMonthLabel()}</MenuItem>
              </Select>
              <Select
                size="small"
                value={String(new Date().getFullYear())}
                sx={selectSx}
              >
                <MenuItem value={String(new Date().getFullYear())}>
                  {new Date().getFullYear()}
                </MenuItem>
              </Select>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.18fr 0.92fr 0.3fr" },
              gap: { xs: 3, lg: 1 },
              alignItems: "center",
              minHeight: { md: 355 },
            }}
          >
            <Box sx={{ height: { xs: 300, md: 340 }, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 18, right: 22, bottom: 0, left: 28 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="rgba(255,255,255,0.045)"
                    strokeDasharray="1 2"
                  />
                  <XAxis
                    type="number"
                    domain={[0, axisMax]}
                    orientation="top"
                    tickCount={11}
                    tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={118}
                    tick={{ fill: "rgba(255,255,255,0.9)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CategoryTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#ff870f"
                    radius={[0, 200, 200, 0]}
                    barSize={20}
                  >
                    <LabelList
                      dataKey="value"
                      position="insideRight"
                      formatter={(v) => `$${Math.round(Number(v ?? 0))}`}
                      fill="#ffffff"
                      fontSize={12}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ height: { xs: 280, md: 340 }, minWidth: 0, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="88%"
                    paddingAngle={0}
                    strokeWidth={0}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CategoryTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Typography
                aria-label={`Total category spending ${money(total)}`}
                sx={{
                  color: "primary.main",
                  fontSize: { xs: 28, md: 34 },
                  fontWeight: 600,
                  lineHeight: 1,
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {money(total).replace(".00", "")}
              </Typography>
            </Box>

            <Stack
              component="ul"
              spacing={0.75}
              sx={{
                m: 0,
                p: 0,
                listStyle: "none",
                alignSelf: "center",
                justifySelf: { xs: "start", lg: "start" },
              }}
            >
              {chartData.map((item, index) => (
                <Box
                  component="li"
                  key={item.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 12,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: PIE_COLORS[index % PIE_COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  {item.name}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
  );
}

const tooltipSx = {
  background: "rgba(18, 24, 34, 0.96)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  boxShadow: "0 18px 38px rgba(0,0,0,0.32)",
  color: "#ffffff",
  px: 1.5,
  py: 1.25,
  minWidth: 140,
};

const tooltipTitleSx = {
  color: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.2,
  mb: 0.5,
};

const tooltipValueSx = {
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 700,
  lineHeight: 1.2,
  fontVariantNumeric: "tabular-nums",
};

const selectSx = {
  height: 28,
  minWidth: 70,
  borderRadius: "8px",
  bgcolor: "primary.main",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 700,
  "& .MuiSelect-select": {
    color: "#ffffff",
    py: 0.25,
    pl: 1,
    pr: "26px !important",
  },
  "& .MuiSvgIcon-root": {
    color: "#ffffff",
    right: 4,
  },
  "& fieldset": {
    borderColor: "rgba(255,255,255,0)",
  },
  "&:hover fieldset": {
    borderColor: "rgba(255,255,255,0.2)",
  },
  "&.Mui-focused fieldset": {
    borderColor: "rgba(255,255,255,0.35)",
  },
};

