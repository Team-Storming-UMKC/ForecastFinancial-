"use client";

import * as React from "react";
import { Box, Dialog, IconButton, Typography, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RawDataInput from "@/components/dashboard/RawDataInput";

interface ImportTransactionsDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
}

export default function ImportTransactionsDialog({
  open,
  onClose,
  onImported,
}: ImportTransactionsDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          background: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            color: "rgba(255,255,255,0.7)",
            "&:hover": { color: "#ffffff", backgroundColor: "rgba(255,255,255,0.08)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ mb: 1.5, pl: 1 }}>
          <Typography sx={{ ...theme.typography.h6, color: "text.primary", fontWeight: 700 }}>
            Import Transactions
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
            Paste raw statement data and let the extractor add transactions to your dashboard.
          </Typography>
        </Box>

        <RawDataInput onExtractionComplete={async () => { await onImported(); }} />
      </Box>
    </Dialog>
  );
}
