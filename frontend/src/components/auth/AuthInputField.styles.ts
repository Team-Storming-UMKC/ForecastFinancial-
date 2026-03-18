import { Theme } from "@mui/material/styles";

export const getAuthInputFieldStyles = (theme: Theme) => ({
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
    "& .MuiInputAdornment-root": {
      margin: 0,
    },
    "& .MuiInputAdornment-positionEnd": {
      marginRight: theme.spacing(1),
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
    "& .MuiIconButton-root": {
      color: "text.secondary",
      padding: 0,
      width: 20,
      height: 20,
    },
  },
});
