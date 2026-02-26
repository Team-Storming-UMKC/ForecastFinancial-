"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import type { Transaction } from "@/types/transaction";

type RangeKey = "7d" | "30d" | "90d";
type GroupKey = "day" | "week" | "month";

function parseDateOnly(yyyyMmDd: string) {
  // Safe local-date parsing (avoids UTC shifting issues)
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatGroupKey(date: Date, group: GroupKey) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  if (group === "day") return `${yyyy}-${mm}-${dd}`;
  if (group === "month") return `${yyyy}-${mm}`;

  // week key (Monday start)
  const d2 = new Date(date);
  const day = (d2.getDay() + 6) % 7; // Mon=0..Sun=6
  d2.setDate(d2.getDate() - day);
  const wyyyy = d2.getFullYear();
  const wmm = String(d2.getMonth() + 1).padStart(2, "0");
  const wdd = String(d2.getDate()).padStart(2, "0");
  return `Wk ${wyyyy}-${wmm}-${wdd}`;
}

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function TransactionCharts() {
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

        // Optional: sort by date asc
        json.sort((a, b) => a.date.localeCompare(b.date));
        setData(json);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load transactions");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

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
    // sort for day/month
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

  const totalSpending = React.useMemo(() => {
    return filtered.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  }, [filtered]);

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

  const pieColors = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57","#d88884"];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Transaction Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Trends and breakdowns for your spending.
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <ToggleButtonGroup value={range} exclusive onChange={(_, v) => v && setRange(v)} size="small">
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={group} exclusive onChange={(_, v) => v && setGroup(v)} size="small">
            <ToggleButton value="day">Day</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {loading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : filtered.length === 0 ? (
          <Typography color="text.secondary">No transactions in this range.</Typography>
        ) : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2, mb: 2 }}>
              <Stat label="Total spending" value={money(totalSpending)} />
              <Stat label="Transactions" value={String(filtered.length)} />
              <Stat
                label="Avg / transaction"
                value={money(totalSpending / Math.max(1, filtered.length))}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 2 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Spending Trend
                  </Typography>

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="key" tickMargin={8} />
                        <YAxis tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: any) => money(Number(v))} />
                        <Legend />
                        <Line type="monotone" dataKey="spending" name="Spending" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Top Categories
                  </Typography>

                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={90} label>
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => money(Number(v))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Top Merchants
                  </Typography>

                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topMerchants}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" hide />
                        <YAxis tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: any) => money(Number(v))} />
                        <Legend />
                        <Bar dataKey="value" name="Spending" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    (Bars are your top merchants in this range.)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}