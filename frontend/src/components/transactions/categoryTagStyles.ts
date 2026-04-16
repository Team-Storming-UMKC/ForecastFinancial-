type CategoryPalette = {
  bg: string;
  border: string;
  text: string;
};

const CATEGORY_COLORS: Record<string, CategoryPalette> = {
  bills: { bg: "#BFDBFE", border: "#60A5FA", text: "#1E3A8A" },
  dining: { bg: "#FFD6A5", border: "#FB923C", text: "#7C2D12" },
  education: { bg: "#CFFAFE", border: "#22D3EE", text: "#164E63" },
  entertainment: { bg: "#DDD6FE", border: "#A78BFA", text: "#4C1D95" },
  gas: { bg: "#FDE68A", border: "#FBBF24", text: "#713F12" },
  groceries: { bg: "#BFE7C9", border: "#86D39A", text: "#14532D" },
  health: { bg: "#FECACA", border: "#F87171", text: "#7F1D1D" },
  paycheck: { bg: "#BBF7D0", border: "#4ADE80", text: "#14532D" },
  shopping: { bg: "#FBCFE8", border: "#F472B6", text: "#831843" },
  transfer: { bg: "#E5E7EB", border: "#9CA3AF", text: "#374151" },
  travel: { bg: "#C7D2FE", border: "#818CF8", text: "#312E81" },
  utilities: { bg: "#BAE6FD", border: "#38BDF8", text: "#0C4A6E" },
};

const CATEGORY_ALIASES: Record<string, keyof typeof CATEGORY_COLORS> = {
  bill: "bills",
  food: "dining",
  fuel: "gas",
  grocery: "groceries",
  income: "paycheck",
  medical: "health",
  restaurant: "dining",
  restaurants: "dining",
  salary: "paycheck",
  utility: "utilities",
};

const FALLBACK_COLORS: CategoryPalette[] = [
  { bg: "#E9D5FF", border: "#C084FC", text: "#581C87" },
  { bg: "#CCFBF1", border: "#2DD4BF", text: "#134E4A" },
  { bg: "#FEF3C7", border: "#FCD34D", text: "#78350F" },
  { bg: "#DBEAFE", border: "#93C5FD", text: "#1E3A8A" },
  { bg: "#FCE7F3", border: "#F9A8D4", text: "#831843" },
];

function normalizeCategory(category: string) {
  return category.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function hashCategory(category: string) {
  return [...category].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getCategoryColors(category: string): CategoryPalette {
  const normalized = normalizeCategory(category);
  const key = normalized.replace(/\s+/g, "");
  const aliasedKey = CATEGORY_ALIASES[key];

  if (aliasedKey) return CATEGORY_COLORS[aliasedKey];
  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key];

  return FALLBACK_COLORS[hashCategory(normalized) % FALLBACK_COLORS.length];
}

export function categoryPillSx(category: string) {
  const colors = getCategoryColors(category);

  return {
    height: 28,
    borderRadius: "8px",
    bgcolor: colors.bg,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    fontSize: "0.75rem",
    fontWeight: 800,
    letterSpacing: 0,
    boxShadow: "0 6px 16px rgba(0,0,0,0.14)",
    "& .MuiChip-label": {
      px: 1.1,
    },
  };
}

export function amountBadgeSx(isIncome: boolean) {
  return {
    height: 24,
    borderRadius: "8px",
    bgcolor: isIncome ? "#BBF7D0" : "#FECACA",
    border: `1px solid ${isIncome ? "#4ADE80" : "#F87171"}`,
    color: isIncome ? "#14532D" : "#7F1D1D",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: 0,
    "& .MuiChip-label": {
      px: 0.9,
    },
  };
}
