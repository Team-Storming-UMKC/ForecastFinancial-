"use client";

import { Box } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { LabelProps } from "recharts";
import { tintedGlass } from "@/theme/tintedGlass";

export interface SpendingCategoryPoint {
  name: string;
  value: number;
}

interface SpendingPerCategoryChartProps {
  data: SpendingCategoryPoint[];
}

const BAR_COLOR = "#ff870f";
const MAX_TICKS = 10;

function formatAxisValue(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function formatBarValue(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function truncateLabel(label: string, maxLength = 20) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function getRoundedMax(data: SpendingCategoryPoint[]) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (maxValue <= 0) {
    return 2000;
  }

  const roughStep = maxValue / MAX_TICKS;
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let step = magnitude;
  if (normalized > 5) {
    step = 10 * magnitude;
  } else if (normalized > 2) {
    step = 5 * magnitude;
  } else if (normalized > 1) {
    step = 2 * magnitude;
  }

  return Math.ceil(maxValue / step) * step;
}

function CustomValueLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  const numericWidth = Number(width);
  const labelX = Number(x) + numericWidth - 8;
  const labelY = Number(y) + Number(height) / 2;
  const shortBar = numericWidth < 46;

  return (
    <text
      x={shortBar ? Number(x) + numericWidth + 6 : labelX}
      y={labelY}
      fill="rgba(255,255,255,0.72)"
      fontSize="12"
      fontWeight={600}
      textAnchor={shortBar ? "start" : "end"}
      dominantBaseline="middle"
    >
      {formatBarValue(Number(value))}
    </text>
  );
}

export default function SpendingPerCategoryChart({ data }: SpendingPerCategoryChartProps) {
  const rankedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 9)
    .map((item) => ({
      ...item,
      shortName: truncateLabel(item.name),
    }));

  const xMax = getRoundedMax(rankedData);
  const chartData = rankedData.length > 0 ? rankedData : [{ name: "No data", shortName: "No data", value: 0 }];

  return (
    <Box
      sx={{
        ...tintedGlass,
        borderRadius: "23px",
        border: "0.5px solid rgba(255,255,255,0.05)",
        pt: 4,
        pb: 2,
        px: 2,
        position: "relative",
        overflow: "hidden",
        minHeight: 433,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow:
            "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, height: 385 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 24, bottom: 0, left: 2 }}
            barCategoryGap={12}
          >
            <CartesianGrid
              horizontal
              vertical
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="1 8"
            />
            <XAxis
              type="number"
              domain={[0, xMax]}
              orientation="top"
              axisLine={false}
              tickLine={false}
              tickMargin={4}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              tickFormatter={(value) => formatAxisValue(Number(value))}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={120}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }}
            />
            <Bar
              dataKey="value"
              radius={[999, 999, 999, 999]}
              barSize={22}
              isAnimationActive={false}
            >
              {chartData.map((entry) => (
                <Cell key={`${entry.name}-${entry.value}`} fill={BAR_COLOR} />
              ))}
              <LabelList dataKey="value" content={<CustomValueLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
