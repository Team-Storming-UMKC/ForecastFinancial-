"use client";

import * as React from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { Alert, Box, Chip, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";

type RecurringBill = {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDay: number;
  nextDueDate?: Date;
  color: {
    bg: string;
    border: string;
    text: string;
  };
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BILL_COLORS = [
  { bg: "#FECACA", border: "#F87171", text: "#7F1D1D" },
  { bg: "#BBF7D0", border: "#4ADE80", text: "#14532D" },
  { bg: "#DDD6FE", border: "#A78BFA", text: "#4C1D95" },
  { bg: "#BAE6FD", border: "#38BDF8", text: "#0C4A6E" },
  { bg: "#CFFAFE", border: "#22D3EE", text: "#164E63" },
  { bg: "#FDE68A", border: "#FBBF24", text: "#713F12" },
  { bg: "#FBCFE8", border: "#F472B6", text: "#831843" },
];

type ApiSubscription = Record<string, unknown>;

function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function shortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function daysUntil(date: Date, today: Date) {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const end = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

function nextBillDate(bill: RecurringBill, today: Date) {
  if (bill.nextDueDate && bill.nextDueDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return bill.nextDueDate;
  }

  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
  if (currentMonthDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return currentMonthDate;
  }

  return new Date(today.getFullYear(), today.getMonth() + 1, bill.dueDay);
}

function createMonthDays(activeDate: Date) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells: Array<{ date: Date; inMonth: boolean }> = [];

  for (let i = firstDay.getDay(); i > 0; i -= 1) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  const trailingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailingCells; day += 1) {
    cells.push({ date: new Date(year, month + 1, day), inMonth: false });
  }

  return cells;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function stringValue(item: ApiSubscription, fields: string[]) {
  for (const field of fields) {
    const value = item[field];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function numberValue(item: ApiSubscription, fields: string[]) {
  for (const field of fields) {
    const value = item[field];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return 0;
}

function dateValueFromApi(item: ApiSubscription) {
  const raw = stringValue(item, ["predictedNextChargeDate", "nextDueDate", "dueDate", "billingDate", "renewalDate", "date"]);
  if (!raw) return undefined;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function hashText(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getBillColor(name: string) {
  return BILL_COLORS[hashText(name) % BILL_COLORS.length];
}

function extractSubscriptionList(data: unknown): ApiSubscription[] {
  if (Array.isArray(data)) return data.filter((item): item is ApiSubscription => Boolean(item) && typeof item === "object");

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["subscriptions", "data", "items", "results"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is ApiSubscription => Boolean(item) && typeof item === "object");
      }
    }
  }

  return [];
}

function clampDueDay(day: number, fallbackDate?: Date) {
  if (Number.isFinite(day) && day >= 1 && day <= 31) return Math.trunc(day);
  return fallbackDate?.getDate() ?? 1;
}

function mapSubscription(item: ApiSubscription, index: number): RecurringBill {
  const name = stringValue(item, ["merchantName", "merchant", "name", "subscriptionName", "title"]) || `Subscription ${index + 1}`;
  const category = stringValue(item, ["category", "type", "serviceType"]) || "Subscription";
  const amount = Math.abs(numberValue(item, ["expectedAmount", "amount", "monthlyAmount", "price", "cost"]));
  const parsedDate = dateValueFromApi(item);
  const dueDay = clampDueDay(numberValue(item, ["dueDay", "billingDay", "dayOfMonth"]), parsedDate);
  const id = stringValue(item, ["id", "_id", "subscriptionId"]) || `${name}-${index}`;

  return {
    id,
    name,
    category,
    amount,
    dueDay,
    nextDueDate: parsedDate,
    color: getBillColor(`${category}-${name}`),
  };
}

export default function RecurringBillsCalendar() {
  const today = React.useMemo(() => new Date(), []);
  const [bills, setBills] = React.useState<RecurringBill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const activeMonth = today;
  const monthDays = React.useMemo(() => createMonthDays(activeMonth), [activeMonth]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadSubscriptions() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/subscriptions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load subscriptions (${response.status})`);
        }

        const data: unknown = await response.json();
        const nextBills = extractSubscriptionList(data).map(mapSubscription);

        if (!cancelled) {
          setBills(nextBills);
        }
      } catch (e) {
        if (!cancelled) {
          setBills([]);
          setError(e instanceof Error ? e.message : "Failed to load subscriptions");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSubscriptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingBills = React.useMemo(
    () =>
      bills.map((bill) => ({
        ...bill,
        nextDate: nextBillDate(bill, today),
      })).sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime()),
    [bills, today],
  );
  const monthlyTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const nextDue = upcomingBills[0];

  function billsForDate(date: Date) {
    return bills.filter((bill) => bill.dueDay === date.getDate());
  }

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          ...tintedGlass,
          borderRadius: "8px",
          p: { xs: 2, md: 2.5 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthOutlinedIcon sx={{ color: "primary.main" }} />
            <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", letterSpacing: 0 }}>
              Subscription calendar
            </Typography>
          </Stack>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Track upcoming recurring charges before they hit your account.
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Box sx={summaryTileSx}>
            <Typography sx={summaryLabelSx}>Monthly total</Typography>
            <Typography sx={summaryValueSx}>{loading ? "Loading" : currency(monthlyTotal)}</Typography>
          </Box>
          <Box sx={summaryTileSx}>
            <Typography sx={summaryLabelSx}>Next due</Typography>
            <Typography sx={summaryValueSx}>{loading ? "Loading" : nextDue ? shortDate(nextDue.nextDate) : "None"}</Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5} alignItems="stretch">
        <Box sx={{ ...panelSx, flex: 1.35 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 2, bgcolor: "rgba(127,29,29,0.25)", color: "#ffffff" }}>
              {error}
            </Alert>
          ) : null}

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography fontWeight={800} sx={{ color: "text.primary", letterSpacing: 0 }}>
                {monthLabel(activeMonth)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                Bills are pinned to their recurring due day.
              </Typography>
            </Box>
            <Chip
              label={loading ? "Loading" : `${bills.length} active`}
              sx={{
                height: 30,
                borderRadius: "8px",
                bgcolor: "#ff870f",
                color: "#ffffff",
                fontWeight: 800,
              }}
            />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 0.75,
            }}
          >
            {WEEKDAYS.map((weekday) => (
              <Typography
                key={weekday}
                align="center"
                sx={{
                  color: "rgba(255,255,255,0.58)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  py: 0.5,
                }}
              >
                {weekday}
              </Typography>
            ))}

            {monthDays.map(({ date, inMonth }) => {
              const dateBills = billsForDate(date);
              const isToday = isSameDay(date, today);

              return (
                <Box
                  key={date.toISOString()}
                  sx={{
                    minHeight: { xs: 74, sm: 92 },
                    borderRadius: "8px",
                    border: isToday ? "1px solid #ff870f" : "1px solid rgba(255,255,255,0.08)",
                    bgcolor: isToday ? "rgba(255,135,15,0.12)" : "rgba(255,255,255,0.035)",
                    opacity: inMonth ? 1 : 0.35,
                    p: 0.75,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      color: isToday ? "#ffffff" : "rgba(255,255,255,0.72)",
                      fontSize: "0.78rem",
                      fontWeight: isToday ? 900 : 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {date.getDate()}
                  </Typography>

                  {dateBills.slice(0, 2).map((bill) => (
                    <Box
                      key={bill.id}
                      sx={{
                        borderRadius: "8px",
                        border: `1px solid ${bill.color.border}`,
                        bgcolor: bill.color.bg,
                        color: bill.color.text,
                        px: 0.75,
                        py: 0.55,
                        overflow: "hidden",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "inherit",
                          fontSize: "0.68rem",
                          fontWeight: 900,
                          lineHeight: 1.15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {bill.name}
                      </Typography>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} sx={{ mt: 0.3 }}>
                        <Typography
                          sx={{
                            color: "inherit",
                            fontSize: "0.6rem",
                            fontWeight: 800,
                            lineHeight: 1,
                            opacity: 0.82,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {shortDate(date)}
                        </Typography>
                        <Typography
                          sx={{
                            color: "inherit",
                            fontSize: "0.62rem",
                            fontWeight: 900,
                            lineHeight: 1,
                            fontVariantNumeric: "tabular-nums",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {currency(bill.amount)}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>

          {loading ? (
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 2, color: "text.secondary" }}>
              <CircularProgress size={18} sx={{ color: "primary.main" }} />
              <Typography variant="body2">Loading subscriptions...</Typography>
            </Stack>
          ) : !error && bills.length === 0 ? (
            <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
              No subscriptions found.
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ ...panelSx, flex: 0.9 }}>
          <Stack direction="row" alignItems="center" spacing={1} gap={1} sx={{ mb: 1.5 }}>
            <NotificationsNoneOutlinedIcon sx={{ color: "primary.main" }} />
            <Box >
              <Typography fontWeight={800} sx={{ color: "text.primary", letterSpacing: 0 }}>
                Upcoming timeline
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                The next recurring charges sorted by due date.
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />

          <Stack spacing={1.25} gap={2}>
            {loading ? (
              <Stack direction="row" alignItems="center" spacing={1.25} gap={2} sx={{ py: 1 }}>
                <CircularProgress size={18} sx={{ color: "primary.main" }} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Loading timeline...
                </Typography>
              </Stack>
            ) : upcomingBills.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
                No upcoming subscriptions to show.
              </Typography>
            ) : (
              upcomingBills.map((bill) => {
                const dueIn = daysUntil(bill.nextDate, today);

                return (
                  <Stack
                    key={bill.id}
                    direction="row"
                    spacing={1.25}
                    gap={1}
                    alignItems="center"
                    sx={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      bgcolor: "rgba(255,255,255,0.04)",
                      p: 1.25,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "8px",
                        bgcolor: "#ff870f",
                        color: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography fontWeight={900} sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {bill.nextDate.getDate()}
                      </Typography>
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={800} noWrap sx={{ color: "text.primary" }}>
                        {bill.name}
                      </Typography>
                      <Stack direction="row" spacing={0.75} gap={1} alignItems="center" sx={{ mt: 0.65 }}>
                        <Chip
                          label={bill.category}
                          size="small"
                          sx={{
                            height: 24,
                            borderRadius: "8px",
                            bgcolor: bill.color.bg,
                            border: `1px solid ${bill.color.border}`,
                            color: bill.color.text,
                            fontWeight: 800,
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {dueIn === 0 ? "Due today" : `Due in ${dueIn} days`}
                        </Typography>
                      </Stack>
                    </Box>

                    <Typography
                      fontWeight={900}
                      sx={{
                        color: "primary.main",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currency(bill.amount)}
                    </Typography>
                  </Stack>
                );
              })
            )}
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
}

const panelSx = {
  ...tintedGlass,
  borderRadius: "8px",
  p: { xs: 2, md: 2.5 },
  overflow: "hidden",
};

const summaryTileSx = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  bgcolor: "rgba(255,255,255,0.04)",
  px: 1.5,
  py: 1.1,
  minWidth: 150,
};

const summaryLabelSx = {
  color: "text.secondary",
  fontSize: "0.75rem",
  fontWeight: 800,
};

const summaryValueSx = {
  color: "text.primary",
  fontSize: "1.25rem",
  fontWeight: 900,
  fontVariantNumeric: "tabular-nums",
  mt: 0.25,
};
