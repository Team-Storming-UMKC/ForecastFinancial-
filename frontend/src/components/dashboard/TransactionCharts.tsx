"use client";

import * as React from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Transaction } from "@/types/transaction";
import StatsRow from "./StatsRow";
import SpendingTrendChart from "./SpendingTrendChart";
import TopCategoriesChart from "./TopCategoriesChart";
import TopMerchantsChart from "./TopMerchantsChart";
import {
  rootSx,
  contentSx,
  headerSx,
  titleSx,
  subtitleSx,
  toggleButtonSx,
  dividerSx,
  loadingSx,
  emptySx,
  chartGridSx,
} from "./TransactionCharts.styles";

type RangeKey = "7d" | "30d" | "90d";
type GroupKey = "day" | "week" | "month";

function parseDateOnly(yyyyMmDd: string) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatGroupKey(date: Date, group: GroupKey) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  if (group === "day") return `${yyyy}-${mm}-${dd}`;
  if (group === "month") return `${yyyy}-${mm}`;

  const d2 = new Date(date);
  const day = (d2.getDay() + 6) % 7;
  d2.setDate(d2.getDate() - day);
  const wyyyy = d2.getFullYear();
  const wmm = String(d2.getMonth() + 1).padStart(2, "0");
  const wdd = String(d2.getDate()).padStart(2, "0");
  return `Wk ${wyyyy}-${wmm}-${wdd}`;
}

interface TransactionChartsProps {
  refreshKey?: number;
}

export default function TransactionCharts({ refreshKey }: TransactionChartsProps) {
  const [range, setRange] = React.useState<RangeKey>("30d");
  const [group, setGroup] = React.useState<GroupKey>("day");
  const [data, setData] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const r = await fetch("/api/transactions", { cache: "no-store" });
        if (!r.ok) throw new Error((await r.text()) || `Request failed: ${r.status}`);

        const json = (await r.json()) as Transaction[];
        if (!alive) return;

        json.sort((a, b) => a.date.localeCompare(b.date));
        setData(json);
      } catch (e: unknown) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load transactions");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [refreshKey]);

  const filtered = React.useMemo(() => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
    return data.filter((t) => parseDateOnly(t.date) >= cutoff);
  }, [data, range]);

  const timeSeries = React.useMemo(() => {
    const map = new Map<string, { key: string; spending: number }>();
    for (const t of filtered) {
      const d = parseDateOnly(t.date);
      const key = formatGroupKey(d, group);
      if (!map.has(key)) map.set(key, { key, spending: 0 });
      map.get(key)!.spending += Math.abs(Number(t.amount) || 0);
    }
    const rows = Array.from(map.values());
    if (group !== "week") rows.sort((a, b) => a.key.localeCompare(b.key));
    return rows;
  }, [filtered, group]);

  const categoryData = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      const cat = (t.category || "Uncategorized").trim() || "Uncategorized";
      map.set(cat, (map.get(cat) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
  }, [filtered]);

  const totalSpending = React.useMemo(() =>
          filtered.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0),
      [filtered]
  );

  const topMerchants = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of filtered) {
      const m = (t.merchantName || "Unknown").trim() || "Unknown";
      map.set(m, (map.get(m) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
  }, [filtered]);

  return (
      <Box sx={rootSx}>
        <Box sx={contentSx}>
          {/* Header */}
          <Stack sx={headerSx}>
            <Box>
              <Typography variant="h6" sx={titleSx}>
                Transaction Insights
              </Typography>
              <Typography variant="body2" sx={subtitleSx}>
                Trends and breakdowns for your spending.
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <ToggleButtonGroup
                value={range}
                exclusive
                onChange={(_, v) => v && setRange(v)}
                size="small"
            >
              {(["7d", "30d", "90d"] as RangeKey[]).map((v) => (
                  <ToggleButton key={v} value={v} sx={toggleButtonSx}>{v}</ToggleButton>
              ))}
            </ToggleButtonGroup>

            <ToggleButtonGroup
                value={group}
                exclusive
                onChange={(_, v) => v && setGroup(v)}
                size="small"
            >
              {(["day", "week", "month"] as GroupKey[]).map((v) => (
                  <ToggleButton key={v} value={v} sx={toggleButtonSx}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

          <Divider sx={dividerSx} />

          {loading ? (
              <Box sx={loadingSx}>
                <CircularProgress sx={{ color: "primary.main" }} />
              </Box>
          ) : error ? (
              <Typography color="error">{error}</Typography>
          ) : filtered.length === 0 ? (
              <Typography sx={emptySx}>
                No transactions in this range.
              </Typography>
          ) : (
              <Stack spacing={2.25}>
                <StatsRow totalSpending={totalSpending} transactionCount={filtered.length} />

                <Box sx={chartGridSx}>
                  <SpendingTrendChart data={timeSeries} />
                  <TopCategoriesChart data={categoryData} />
                </Box>

                <TopMerchantsChart data={topMerchants} />
              </Stack>
          )}
        </Box>
      </Box>
  );
}