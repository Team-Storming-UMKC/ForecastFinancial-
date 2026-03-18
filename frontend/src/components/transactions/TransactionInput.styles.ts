import { Theme } from "@mui/material/styles";

export const getTransactionInputStyles = (theme: Theme) => ({
  field: {
    height: 44,
    borderRadius: `${theme.customTokens.radii.control}px`,
    "& .MuiOutlinedInput-root": {
      height: "100%",
    },
    "& .MuiOutlinedInput-input": {
      ...theme.typography.body1,
      height: "100%",
      boxSizing: "border-box",
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      color: theme.customTokens.text.input,
    },
    "& .MuiInputLabel-root": {
      color: theme.customTokens.text.placeholder,
      "&.Mui-focused": {
        color: "primary.main",
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: theme.customTokens.borders.input,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      border: theme.customTokens.borders.input,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: theme.customTokens.text.placeholder,
      opacity: 1,
    },
    "& .MuiFormHelperText-root": {
      color: theme.customTokens.text.placeholder,
      "&.Mui-error": {
        color: "error.main",
      },
    },
    "& input[type='date']::-webkit-calendar-picker-indicator": {
      filter: "invert(1) opacity(0.4)",
      cursor: "pointer",
    },
  },
});

