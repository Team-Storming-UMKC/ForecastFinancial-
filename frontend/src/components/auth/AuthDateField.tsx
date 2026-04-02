import * as React from "react";
import {
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { CalendarMonth, ChevronLeft, ChevronRight } from "@mui/icons-material";
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

function parseDisplayDate(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 8) {
    return null;
  }

  const month = Number(digits.slice(0, 2));
  const day = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));

  const parsedDate = new Date(year, month - 1, day);
  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  return isValidDate ? parsedDate : null;
}

function toDisplayDate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

function getCalendarStart(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  return calendarStart;
}

function areSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) {
    return false;
  }

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AuthDateField({
  value,
  onChange,
  inputProps,
  ...props
}: AuthDateFieldProps) {
  const theme = useTheme();
  const styles = getAuthInputFieldStyles(theme);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const selectedDate = React.useMemo(() => parseDisplayDate(value), [value]);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(() => selectedDate ?? new Date());

  React.useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [selectedDate]);

  const calendarDays = React.useMemo(() => {
    const start = getCalendarStart(visibleMonth);

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  function handleOpenCalendar(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseCalendar() {
    setAnchorEl(null);
  }

  function handleSelectDate(date: Date) {
    onChange(toDisplayDate(date));
    setVisibleMonth(date);
    handleCloseCalendar();
  }

  function handlePreviousMonth() {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  const isCalendarOpen = Boolean(anchorEl);
  const today = new Date();

  return (
    <>
      <OutlinedInput
        fullWidth
        value={value}
        sx={styles.field}
        onChange={(event) => onChange(formatDisplayDate(event.target.value))}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="Open calendar" edge="end" onClick={handleOpenCalendar}>
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

      <Popover
        open={isCalendarOpen}
        anchorEl={anchorEl}
        onClose={handleCloseCalendar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              width: 296,
              borderRadius: `${theme.customTokens.radii.card}px`,
              border: theme.customTokens.borders.subtle,
              backgroundColor: "#25272b",
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              boxShadow:
                "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
              color: theme.palette.text.primary,
              backdropFilter: "blur(16px)",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <IconButton
            aria-label="Previous month"
            onClick={handlePreviousMonth}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.text.primary, backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <Typography sx={{ ...theme.typography.body1, fontWeight: 600, color: theme.palette.text.primary }}>
            {visibleMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </Typography>

          <IconButton
            aria-label="Next month"
            onClick={handleNextMonth}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.text.primary, backgroundColor: "rgba(255,255,255,0.06)" },
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0.75,
            mb: 1,
          }}
        >
          {WEEKDAY_LABELS.map((label) => (
            <Typography
              key={label}
              sx={{
                ...theme.typography.body1,
                fontSize: "0.75rem",
                color: "text.secondary",
                textAlign: "center",
                py: 0.5,
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0.75,
          }}
        >
          {calendarDays.map((day) => {
            const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = areSameDay(day, selectedDate);
            const isToday = areSameDay(day, today);

            return (
              <ButtonBase
                key={day.toISOString()}
                onClick={() => handleSelectDate(day)}
                sx={{
                  height: 34,
                  borderRadius: `${theme.customTokens.radii.control}px`,
                  ...theme.typography.body1,
                  fontSize: "0.9rem",
                  color: isSelected
                    ? theme.palette.primary.contrastText
                    : isCurrentMonth
                      ? theme.palette.text.primary
                      : "rgba(255,255,255,0.32)",
                  backgroundColor: isSelected
                    ? theme.palette.primary.main
                    : isToday
                      ? "rgba(255, 135, 15, 0.14)"
                      : "transparent",
                  border: isToday && !isSelected ? "1px solid rgba(255, 135, 15, 0.4)" : "1px solid transparent",
                  transition: "background-color 120ms ease, color 120ms ease, border-color 120ms ease",
                  "&:hover": {
                    backgroundColor: isSelected ? theme.palette.primary.main : "rgba(255,255,255,0.08)",
                  },
                }}
              >
                {day.getDate()}
              </ButtonBase>
            );
          })}
        </Box>
      </Popover>
    </>
  );
}
