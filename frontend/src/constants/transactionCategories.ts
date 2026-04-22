export const AI_TRANSACTION_CATEGORIES = [
  "Auto & transport",
  "Shopping",
  "Healthcare",
  "Drinks & dining",
  "Other",
  "Entertainment",
  "Groceries",
  "Kids",
  "Family",
  "Childcare & education",
  "Household",
  "Financial",
  "Taxes",
  "Personal care",
  "Travel & vacation",
  "Income",
] as const;

export type AiTransactionCategory = (typeof AI_TRANSACTION_CATEGORIES)[number];
