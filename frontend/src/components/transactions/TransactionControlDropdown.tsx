"use client";

import * as React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Stack, Typography } from "@mui/material";
import { appDropdownColors, appDropdownRadius } from "@/theme/dropdown";

export type TransactionControlOption = {
  label: string;
  value: string;
};

export default function TransactionControlDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: TransactionControlOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const activeOption = options.find((option) => option.value === value) ?? options[0];
  const menuId = React.useId();

  React.useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <Box ref={rootRef} sx={{ position: "relative", width: { xs: "100%", sm: 190 } }}>
      <Typography
        component="label"
        sx={{
          display: "block",
          mb: 0.75,
          color: "rgba(255,255,255,0.72)",
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        {label}
      </Typography>

      <Box
        component="button"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: "100%",
          minHeight: 42,
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: appDropdownRadius,
          px: 1.5,
          py: 1,
          color: appDropdownColors.triggerText,
          bgcolor: appDropdownColors.triggerBg,
          cursor: "pointer",
          font: "inherit",
          boxShadow: "0 8px 22px rgba(255,135,15,0.28)",
          transition: "background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            bgcolor: appDropdownColors.triggerHoverBg,
            boxShadow: "0 10px 26px rgba(255,135,15,0.36)",
          },
          "&:active": {
            transform: "translateY(1px)",
          },
          "&:focus-visible": {
            outline: "2px solid rgba(255,255,255,0.9)",
            outlineOffset: "2px",
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography component="span" sx={{ fontWeight: 800, color: "inherit", letterSpacing: 0 }}>
            {activeOption?.label}
          </Typography>
          <KeyboardArrowDownIcon
            fontSize="small"
            sx={{
              color: appDropdownColors.triggerText,
              transition: "transform 160ms ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </Stack>
      </Box>

      {open ? (
        <Box
          id={menuId}
          role="listbox"
          aria-label={label}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 4,
            overflow: "hidden",
            borderRadius: appDropdownRadius,
            border: `1px solid ${appDropdownColors.menuBorder}`,
            bgcolor: appDropdownColors.menuBg,
            color: appDropdownColors.menuText,
            boxShadow: "0 18px 34px rgba(0,0,0,0.45)",
          }}
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <Box
                key={option.value}
                component="button"
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => handleSelect(option.value)}
                sx={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  borderBottom: `1px solid ${appDropdownColors.menuDivider}`,
                  px: 1.5,
                  py: 1.1,
                  color: appDropdownColors.menuText,
                  bgcolor: selected ? appDropdownColors.selectedBg : appDropdownColors.menuBg,
                  cursor: "pointer",
                  font: "inherit",
                  fontWeight: selected ? 800 : 600,
                  textAlign: "left",
                  "&:last-of-type": {
                    borderBottom: 0,
                  },
                  "&:hover": {
                    bgcolor: selected ? appDropdownColors.selectedHoverBg : appDropdownColors.hoverBg,
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${appDropdownColors.triggerBg}`,
                    outlineOffset: "-2px",
                  },
                }}
              >
                {option.label}
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
