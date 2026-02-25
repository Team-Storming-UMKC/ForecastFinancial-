"use client";

import * as React from "react";
import { Alert, Snackbar } from "@mui/material";

type ToastSeverity = "success" | "info" | "warning" | "error";

type ToastState = {
    open: boolean;
    message: string;
    severity: ToastSeverity;
    duration?: number;
};

type ToastContextValue = {
    showToast: (message: string, options?: { severity?: ToastSeverity; duration?: number }) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = React.useState<ToastState>({
        open: false,
        message: "",
        severity: "info",
        duration: 4000,
    });

    const showToast = React.useCallback(
        (message: string, options?: { severity?: ToastSeverity; duration?: number }) => {
            setToast({
                open: true,
                message,
                severity: options?.severity ?? "info",
                duration: options?.duration ?? 4000,
            });
        },
        []
    );

    const handleClose = (_?: unknown, reason?: string) => {
        // Avoid closing on clickaway if you want
        if (reason === "clickaway") return;
        setToast((t) => ({ ...t, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <Snackbar
                open={toast.open}
                autoHideDuration={toast.duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a ToastProvider");
    return ctx;
}