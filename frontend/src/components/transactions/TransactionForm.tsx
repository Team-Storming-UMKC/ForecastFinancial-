"use client";

import * as React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import {
  categoryChipsSx,
  containerSx,
  contentSx,
  headerRowSx,
  stackSx,
  submitButtonSx,
  supportingTextSx,
  titleSx,
} from "./TransactionForm.styles";
import { categoryPillSx } from "./categoryTagStyles";
import TransactionInput from "./TransactionInput";

export type TransactionDraft = {
  merchantName: string;
  amount: string;
  date: string;
  category: string;
};

type DraftErrors = Partial<Record<keyof TransactionDraft, string>>;

const CATEGORY_SUGGESTIONS = [
  "Groceries",
  "Dining",
  "Shopping",
  "Bills",
  "Gas",
  "Travel",
  "Paycheck",
  "Entertainment",
];

function createEmptyDraft(): TransactionDraft {
  return {
    merchantName: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "",
  };
}

function isValidMoney(value: string): boolean {
  return /^[+-]?\d+(\.\d{1,2})?$/.test(value);
}

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(new Date(value).getTime());
}

export default function TransactionForm({
  onCreate,
  initialDraft,
  submitLabel = "Save transaction",
  title = "Add transaction",
  description = "Track income and spending with clear labels so the dashboard stays useful.",
  onCancel,
}: {
  onCreate: (draft: TransactionDraft) => Promise<void> | void;
  initialDraft?: TransactionDraft;
  submitLabel?: string;
  title?: string;
  description?: string;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = React.useState<TransactionDraft>(initialDraft ?? createEmptyDraft());
  const [errors, setErrors] = React.useState<DraftErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setDraft(initialDraft ?? createEmptyDraft());
    setErrors({});
  }, [initialDraft]);

  const clearError = (key: keyof TransactionDraft) => {
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  function updateDraft<K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  }

  function validate(): boolean {
    const next: DraftErrors = {};
    const m = draft.merchantName.trim();
    const c = draft.category.trim();
    const a = draft.amount.trim();
    const d = draft.date.trim();

    if (!m) next.merchantName = "Merchant is required.";
    else if (m.length > 60) next.merchantName = "Max 60 characters.";

    if (!c) next.category = "Category is required.";
    else if (c.length > 40) next.category = "Max 40 characters.";

    if (!a) next.amount = "Amount is required.";
    else if (!isValidMoney(a)) {
      next.amount = "Enter a valid number with up to 2 decimals.";
    } else if (Number(a) === 0) {
      next.amount = "Amount cannot be 0.";
    }

    if (!d) next.date = "Date is required.";
    else if (!isValidISODate(d)) next.date = "Enter a valid date.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      await onCreate({
        merchantName: draft.merchantName.trim(),
        amount: draft.amount.trim(),
        date: draft.date.trim(),
        category: draft.category.trim(),
      });

      if (!initialDraft) {
        setDraft(createEmptyDraft());
      }

      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = Boolean(initialDraft);

  return (
    <Box sx={containerSx}>
      <Box sx={contentSx}>
        <Stack sx={headerRowSx}>
          <Box>
            <Typography sx={titleSx}>{title}</Typography>
            <Typography sx={supportingTextSx}>{description}</Typography>
          </Box>
          {isEditing && onCancel ? (
            <Button variant="text" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          ) : null}
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack sx={stackSx}>
            <TransactionInput
              label="Merchant"
              value={draft.merchantName}
              onChange={(e) => updateDraft("merchantName", e.target.value)}
              error={!!errors.merchantName}
              helperText={errors.merchantName ?? " "}
              inputProps={{ maxLength: 60 }}
              disabled={submitting}
            />

            <TransactionInput
              label="Amount"
              value={draft.amount}
              onChange={(e) => updateDraft("amount", e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount ?? "Use + for income and - for spending."}
              disabled={submitting}
              type="text"
              inputProps={{
                inputMode: "decimal",
                placeholder: "-45.99 or 1200.00",
              }}
            />

            <TransactionInput
              label="Date"
              value={draft.date}
              onChange={(e) => updateDraft("date", e.target.value)}
              error={!!errors.date}
              helperText={errors.date ?? " "}
              disabled={submitting}
              type="date"
              InputLabelProps={{ shrink: true }}
            />

            <TransactionInput
              label="Category"
              value={draft.category}
              onChange={(e) => updateDraft("category", e.target.value)}
              error={!!errors.category}
              helperText={errors.category ?? "Pick a label that will make charts readable."}
              inputProps={{ maxLength: 40 }}
              disabled={submitting}
            />

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={categoryChipsSx}>
              {CATEGORY_SUGGESTIONS.map((suggestion) => (
                <Chip
                  key={suggestion}
                  label={suggestion}
                  clickable
                  onClick={() => updateDraft("category", suggestion)}
                  disabled={submitting}
                  variant="filled"
                  sx={[
                    categoryPillSx(suggestion),
                    draft.category === suggestion
                      ? {
                          outline: "2px solid rgba(255,255,255,0.85)",
                          outlineOffset: "2px",
                        }
                      : {
                          opacity: 0.86,
                          "&:hover": {
                            opacity: 1,
                          },
                        },
                  ]}
                />
              ))}
            </Stack>

            <Button variant="contained" type="submit" disabled={submitting} sx={submitButtonSx}>
              {submitting ? (isEditing ? "Saving..." : "Adding...") : submitLabel}
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}
