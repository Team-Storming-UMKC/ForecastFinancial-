"use client";

import * as React from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { AnimatePresence, motion } from "framer-motion";
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { tintedGlass } from "@/theme/tintedGlass";

export interface PasswordDraft {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordSettingsFormProps {
    value: PasswordDraft;
    loading?: boolean;
    deletingTransactions?: boolean;
    deletingAccount?: boolean;
    onChange: (next: PasswordDraft) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onDeleteTransactions: () => Promise<void> | void;
    onDeleteAccount: () => Promise<void> | void;
}

const panelTransition = {
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1],
} as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <Typography
            sx={{
                color: "#a4a4a4",
                fontSize: 14,
                fontWeight: 600,
                lineHeight: 1.5,
                letterSpacing: 0,
                mb: 0.75,
            }}
        >
            {children}
        </Typography>
    );
}

function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    loading = false,
    onClose,
    onConfirm,
}: {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            PaperProps={{
                sx: {
                    ...tintedGlass,
                    color: "text.primary",
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">{description}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
                    {loading ? "Deleting..." : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function PasswordSettingsForm({
    value,
    loading = false,
    deletingTransactions = false,
    deletingAccount = false,
    onChange,
    onSubmit,
    onDeleteTransactions,
    onDeleteAccount,
}: PasswordSettingsFormProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [confirmingTransactionsDelete, setConfirmingTransactionsDelete] = React.useState(false);
    const [confirmingAccountDelete, setConfirmingAccountDelete] = React.useState(false);
    const deleting = deletingTransactions || deletingAccount;

    async function handleDeleteTransactions() {
        await onDeleteTransactions();
        setConfirmingTransactionsDelete(false);
    }

    async function handleDeleteAccount() {
        await onDeleteAccount();
        setConfirmingAccountDelete(false);
    }

    return (
        <Box
            data-node-id="348:868"
            sx={{
                ...tintedGlass,
                position: "relative",
                width: "100%",
                minHeight: { xs: "auto", md: 130 },
                overflow: "hidden",
                borderRadius: "23px",
                p: { xs: 2.5, md: 3.25 },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
                    pointerEvents: "none",
                    zIndex: 0,
                },
            }}
        >
            <Typography
                data-node-id="348:870"
                sx={{
                    position: "relative",
                    zIndex: 1,
                    color: "#ffffff",
                    fontSize: 24,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    letterSpacing: 0,
                    pr: 5,
                }}
            >
                Security
            </Typography>

            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 2, md: 3 }}
                alignItems={{ xs: "stretch", md: "flex-end" }}
                justifyContent="space-between"
                sx={{ position: "relative", zIndex: 1, mt: { xs: 1.25, md: 0.75 } }}
            >
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                            data-node-id="348:880"
                            sx={{
                                color: "#a4a4a4",
                                fontSize: 16,
                                fontWeight: 600,
                                lineHeight: 1.5,
                                letterSpacing: 0,
                            }}
                        >
                            Current Password
                        </Typography>
                        <IconButton
                            aria-label={isEditing ? "Close password editor" : "Edit password"}
                            onClick={() => setIsEditing((current) => !current)}
                            disabled={loading || deleting}
                            sx={{
                                width: 23,
                                height: 23,
                                color: "#a4a4a4",
                                borderRadius: "8px",
                                p: 0,
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    color: "#ffffff",
                                },
                                "& .MuiSvgIcon-root": {
                                    fontSize: 21,
                                    transform: isEditing ? "rotate(-12deg)" : "rotate(0deg)",
                                    transition: "transform 220ms ease",
                                },
                            }}
                        >
                            <EditOutlinedIcon />
                        </IconButton>
                    </Stack>

                    <Typography
                        data-node-id="348:872"
                        sx={{
                            color: "#ffffff",
                            fontSize: 24,
                            fontWeight: 400,
                            lineHeight: 1.1,
                            letterSpacing: 0,
                        }}
                    >
                        ************
                    </Typography>
                </Box>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2.5}
                    gap={2}
                    justifyContent="flex-end"
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setConfirmingTransactionsDelete(true)}
                        disabled={loading || deleting}
                        sx={{ borderRadius: "8px" }}
                    >
                        Delete all transactions
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmingAccountDelete(true)}
                        disabled={loading || deleting}
                        sx={{ borderRadius: "8px" }}
                    >
                        Delete account
                    </Button>
                </Stack>
            </Stack>

            <AnimatePresence mode="wait" initial={false}>
                {isEditing ? (
                    <Box
                        key="password-editor"
                        component={motion.form}
                        onSubmit={onSubmit}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 8, height: 0 }}
                        transition={panelTransition}
                        sx={{ position: "relative", zIndex: 1, mt: 2.5, overflow: "hidden" }}
                    >
                        <Stack spacing={3}>
                            <Box>
                                <FieldLabel>Current Password</FieldLabel>
                                <AuthInputField
                                    fullWidth
                                    type="password"
                                    withPasswordToggle
                                    placeholder="Current password"
                                    value={value.currentPassword}
                                    onChange={(event) => onChange({ ...value, currentPassword: event.target.value })}
                                    autoComplete="current-password"
                                    disabled={loading}
                                    required
                                />
                            </Box>

                            <Box>
                                <FieldLabel>New Password</FieldLabel>
                                <AuthInputField
                                    fullWidth
                                    type="password"
                                    withPasswordToggle
                                    placeholder="New password"
                                    value={value.newPassword}
                                    onChange={(event) => onChange({ ...value, newPassword: event.target.value })}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                            </Box>

                            <Box>
                                <FieldLabel>Confirm New Password</FieldLabel>
                                <AuthInputField
                                    fullWidth
                                    type="password"
                                    withPasswordToggle
                                    placeholder="Confirm new password"
                                    value={value.confirmPassword}
                                    onChange={(event) => onChange({ ...value, confirmPassword: event.target.value })}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                            </Box>

                            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 0.5 }}>
                                <Box sx={{ width: { xs: "100%", sm: 190 } }}>
                                    <AuthSubmitButton label="Update password" loading={loading} />
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>
                ) : null}
            </AnimatePresence>

            <ConfirmDialog
                open={confirmingTransactionsDelete}
                title="Delete all transactions?"
                description="This permanently removes every transaction in your account. This action cannot be undone."
                confirmLabel="Delete transactions"
                loading={deletingTransactions}
                onClose={() => setConfirmingTransactionsDelete(false)}
                onConfirm={handleDeleteTransactions}
            />

            <ConfirmDialog
                open={confirmingAccountDelete}
                title="Delete account?"
                description="This permanently deletes your account after deleting your transactions. This action cannot be undone."
                confirmLabel="Delete account"
                loading={deletingAccount}
                onClose={() => setConfirmingAccountDelete(false)}
                onConfirm={handleDeleteAccount}
            />
        </Box>
    );
}
