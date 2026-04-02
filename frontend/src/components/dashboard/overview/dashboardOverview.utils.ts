import type { Transaction } from "@/types/transaction";

export interface CategoryTotal {
  name: string;
  value: number;
}

export interface RecentTransactionRow extends Transaction {
  displayAmount: number;
}

export function parseDateOnly(yyyyMmDd: string) {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 1000 ? "compact" : "standard",
    minimumFractionDigits: 0,
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

export function formatTransactionDate(date: string) {
  const parsed = parseDateOnly(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function buildMonthYearOptions(transactions: Transaction[]) {
  const optionMap = new Map<string, { month: number; year: number; label: string }>();

  for (const transaction of transactions) {
    const parsed = parseDateOnly(transaction.date);
    if (Number.isNaN(parsed.getTime())) {
      continue;
    }

    const month = parsed.getMonth();
    const year = parsed.getFullYear();
    const key = `${year}-${month}`;

    if (!optionMap.has(key)) {
      optionMap.set(key, {
        month,
        year,
        label: parsed.toLocaleString("en-US", { month: "short", year: "numeric" }),
      });
    }
  }

  return Array.from(optionMap.values()).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }

    return b.month - a.month;
  });
}

export function getLatestMonthYear(transactions: Transaction[]) {
  const datedTransactions = transactions
    .map((transaction) => parseDateOnly(transaction.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  const latest = datedTransactions[0] ?? new Date();

  return {
    month: latest.getMonth(),
    year: latest.getFullYear(),
  };
}

export function filterTransactionsByMonthYear(
  transactions: Transaction[],
  month: number,
  year: number
) {
  return transactions.filter((transaction) => {
    const parsed = parseDateOnly(transaction.date);
    return parsed.getMonth() === month && parsed.getFullYear() === year;
  });
}

export function buildCategoryTotals(transactions: Transaction[]) {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const category = transaction.category?.trim() || "Misc.";
    totals.set(category, (totals.get(category) ?? 0) + Math.abs(Number(transaction.amount) || 0));
  }

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildRecentTransactionRows(transactions: Transaction[], limit = 7): RecentTransactionRow[] {
  return [...transactions]
    .sort((a, b) => parseDateOnly(b.date).getTime() - parseDateOnly(a.date).getTime())
    .slice(0, limit)
    .map((transaction) => ({
      ...transaction,
      displayAmount: Number(transaction.amount) || 0,
    }));
}
