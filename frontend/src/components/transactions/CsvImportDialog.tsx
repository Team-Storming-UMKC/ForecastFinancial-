"use client";

import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { CloudUploadOutlined, DescriptionOutlined } from "@mui/icons-material";
import { tintedGlass } from "@/theme/tintedGlass";
import { useToast } from "@/components/toast/ToastProvider";

type CsvImportDialogProps = {
  open: boolean;
  onClose: () => void;
  onImported?: () => Promise<void> | void;
  endpoint?: string;
};

export default function CsvImportDialog({
  open,
  onClose,
  onImported,
  endpoint = "/api/transactions/import-csv",
}: CsvImportDialogProps) {
  const { showToast } = useToast();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  const resetState = React.useCallback(() => {
    setSelectedFile(null);
    setIsDragging(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const handleClose = React.useCallback(() => {
    if (isUploading) return;
    resetState();
    onClose();
  }, [isUploading, onClose, resetState]);

  const handleFileSelected = React.useCallback((file: File | null) => {
    if (!file) return;

    const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setSelectedFile(null);
      showToast("Select a CSV file.", { severity: "error" });
      return;
    }

    setSelectedFile(file);
  }, [showToast]);

  const handleDrop = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFileSelected(event.dataTransfer.files?.[0] ?? null);
  }, [handleFileSelected]);

  const handleUpload = React.useCallback(async () => {
    if (!selectedFile) {
      showToast("Choose a CSV file first.", { severity: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Import failed (${response.status})`);
      }

      showToast("CSV imported.", { severity: "success" });
      resetState();
      onClose();
      await onImported?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "CSV import failed";
      showToast(message, { severity: "error" });
    } finally {
      setIsUploading(false);
    }
  }, [endpoint, onClose, onImported, resetState, selectedFile, showToast]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableScrollLock
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          ...tintedGlass,
          color: "text.primary",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={800}>
          Import transactions from CSV
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, color: "rgba(255,255,255,0.62)" }}>
          Drop a CSV file here or browse to upload it to the import endpoint.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
        />

        <Box
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          sx={{
            ...tintedGlass,
            borderRadius: 3,
            minHeight: 220,
            px: 3,
            py: 4,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            cursor: isUploading ? "default" : "pointer",
            transition: "border-color 160ms ease, transform 160ms ease, background-color 160ms ease",
            borderColor: isDragging ? "rgba(255,107,0,0.75)" : "rgba(255,255,255,0.12)",
            background: isDragging
              ? "linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(28,28,30,0.7) 100%)"
              : "rgba(28, 28, 30, 0.5)",
            transform: isDragging ? "translateY(-1px)" : "none",
            pointerEvents: isUploading ? "none" : "auto",
          }}
        >
          <Stack spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(255,107,0,0.22) 0%, rgba(255,255,255,0.06) 100%)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <CloudUploadOutlined sx={{ fontSize: 30, color: "rgba(255,255,255,0.92)" }} />
            </Box>

            <Typography variant="h6" fontWeight={700}>
              {selectedFile ? "Ready to import" : "Drop your CSV here"}
            </Typography>

            <Typography variant="body2" sx={{ maxWidth: 360, color: "rgba(255,255,255,0.62)" }}>
              {selectedFile
                ? "The selected file will be sent directly to the CSV import endpoint."
                : "Drag and drop a file or click this area to choose one from your device."}
            </Typography>

            {selectedFile ? (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                }}
              >
                <DescriptionOutlined sx={{ fontSize: 18, color: "rgba(255,255,255,0.74)" }} />
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Typography>
              </Stack>
            ) : null}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={isUploading} sx={{ color: "rgba(255,255,255,0.72)" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlined />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            bgcolor: "rgba(255,107,0,0.9)",
            "&:hover": { bgcolor: "rgba(255,107,0,1)" },
          }}
        >
          {isUploading ? "Importing..." : "Import CSV"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
