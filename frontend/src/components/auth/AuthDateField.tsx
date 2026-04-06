import * as React from "react";
import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
  useTheme,
} from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import { getAuthInputFieldStyles } from "@/components/auth/AuthInputField.styles";

interface AuthDateFieldProps extends Omit<OutlinedInputProps, "onChange" | "sx" | "type" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

function formatDisplayDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toIsoDate(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 8) {
    return "";
  }

  const month = Number(digits.slice(0, 2));
  const day = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const parsedDate = new Date(year, month - 1, day);
  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  if (!isValidDate) {
    return "";
  }

  return `${year.toString().padStart(4, "0")}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
}

function fromIsoDate(value: string) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${month}/${day}/${year}`;
}

export default function AuthDateField({
  value,
  onChange,
  inputProps,
  ...props
}: AuthDateFieldProps) {
  const theme = useTheme();
  const styles = getAuthInputFieldStyles(theme);
  const nativeDateInputRef = React.useRef<HTMLInputElement | null>(null);

  function handleOpenPicker() {
    const nativeInput = nativeDateInputRef.current;

    if (!nativeInput) {
      return;
    }

    const pickerInput = nativeInput as HTMLInputElement & { showPicker?: () => void };

    if (typeof pickerInput.showPicker === "function") {
      pickerInput.showPicker();
      return;
    }

    nativeInput.focus();
    nativeInput.click();
  }

  return (
    <>
      <OutlinedInput
        fullWidth
        value={value}
        sx={styles.field}
        onChange={(event) => onChange(formatDisplayDate(event.target.value))}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="Open calendar" edge="end" onClick={handleOpenPicker}>
              <CalendarMonth fontSize="small" />
            </IconButton>
          </InputAdornment>
        }
        inputProps={{
          inputMode: "numeric",
          maxLength: 10,
          ...inputProps,
        }}
        {...props}
      />

      <input
        ref={nativeDateInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={toIsoDate(value)}
        onChange={(event) => onChange(fromIsoDate(event.target.value))}
        style={{
          position: "fixed",
          right: 0,
          bottom: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          border: 0,
          padding: 0,
        }}
      />
    </>
  );
}
