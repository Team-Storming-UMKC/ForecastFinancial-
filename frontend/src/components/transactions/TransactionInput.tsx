"use client";

import * as React from "react";
import { TextField, TextFieldProps, useTheme } from "@mui/material";
import { getTransactionInputStyles } from "./TransactionInput.styles";

type TransactionInputProps = Omit<TextFieldProps, "sx">;

export default function TransactionInput({
  ...props
}: TransactionInputProps) {
  const theme = useTheme();
  const styles = getTransactionInputStyles(theme);

  return (
    <TextField
      fullWidth
      variant="outlined"
      sx={styles.field}
      {...props}
    />
  );
}

