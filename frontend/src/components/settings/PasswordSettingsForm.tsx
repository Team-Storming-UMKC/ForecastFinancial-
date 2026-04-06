"use client";

import * as React from "react";
import { Box, Stack } from "@mui/material";
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SettingsSectionCard from "./SettingsSectionCard";

export interface PasswordDraft {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface PasswordSettingsFormProps {
    value: PasswordDraft;
    loading?: boolean;
    onChange: (next: PasswordDraft) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function PasswordSettingsForm({
    value,
    loading = false,
    onChange,
    onSubmit,
}: PasswordSettingsFormProps) {
    return (
        <SettingsSectionCard
            title="Password"
            description="Change your password using your current credentials."
        >
            <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3.25}>
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

                    <Stack direction="row" justifyContent="flex-end" sx={{ pt: 0.5 }}>
                        <Box sx={{ width: { xs: "100%", sm: 190 } }}>
                            <AuthSubmitButton label="Update password" loading={loading} />
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </SettingsSectionCard>
    );
}
