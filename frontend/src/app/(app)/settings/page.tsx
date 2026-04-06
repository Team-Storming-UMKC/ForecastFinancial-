"use client";

import * as React from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import PasswordSettingsForm, {
    PasswordDraft,
} from "@/components/settings/PasswordSettingsForm";
import ProfileSettingsForm, {
    UserProfile,
} from "@/components/settings/ProfileSettingsForm";
import { useToast } from "@/components/toast/ToastProvider";

const emptyProfile: UserProfile = {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    profilePictureUrl: "",
};

function normalizeDateOfBirth(value: string | null) {
    if (!value) {
        return null;
    }

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

    if (!isValidDate) {
        return null;
    }

    return `${year.toString().padStart(4, "0")}-${`${month}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
}

async function readApiError(response: Response) {
    const text = await response.text();

    try {
        const parsed = JSON.parse(text) as { error?: string; message?: string };
        return parsed.error || parsed.message || text || "Request failed";
    } catch {
        return text || "Request failed";
    }
}

export default function SettingsPage() {
    const { showToast } = useToast();
    const [loadingProfile, setLoadingProfile] = React.useState(true);
    const [savingProfile, setSavingProfile] = React.useState(false);
    const [savingPassword, setSavingPassword] = React.useState(false);
    const [profileError, setProfileError] = React.useState<string | null>(null);
    const [profile, setProfile] = React.useState<UserProfile>(emptyProfile);
    const [initialProfile, setInitialProfile] = React.useState<UserProfile>(emptyProfile);
    const [passwordDraft, setPasswordDraft] = React.useState<PasswordDraft>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const loadProfile = React.useCallback(async () => {
        setLoadingProfile(true);
        setProfileError(null);

        try {
            const response = await fetch("/api/users/me", {
                cache: "no-store",
                credentials: "include",
            });
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                throw new Error(await readApiError(response));
            }

            const data = (await response.json()) as UserProfile;
            const nextProfile: UserProfile = {
                firstName: data.firstName ?? "",
                lastName: data.lastName ?? "",
                email: data.email ?? "",
                dateOfBirth: data.dateOfBirth ?? "",
                profilePictureUrl: data.profilePictureUrl ?? "",
            };

            setProfile(nextProfile);
            setInitialProfile(nextProfile);
        } catch (error) {
            setProfileError(error instanceof Error ? error.message : "Failed to load profile");
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    React.useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const normalizedDateOfBirth = normalizeDateOfBirth(profile.dateOfBirth);
        if (profile.dateOfBirth && !normalizedDateOfBirth) {
            showToast("Date of birth must be a valid date.", { severity: "error" });
            return;
        }

        setSavingProfile(true);
        try {
            const response = await fetch("/api/users/me", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: profile.firstName.trim(),
                    lastName: profile.lastName.trim(),
                    email: profile.email.trim(),
                    dateOfBirth: normalizedDateOfBirth,
                    profilePictureUrl: profile.profilePictureUrl?.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error(await readApiError(response));
            }

            const updated = (await response.json()) as UserProfile;
            const nextProfile: UserProfile = {
                firstName: updated.firstName ?? "",
                lastName: updated.lastName ?? "",
                email: updated.email ?? "",
                dateOfBirth: updated.dateOfBirth ?? "",
                profilePictureUrl: updated.profilePictureUrl ?? "",
            };

            setProfile(nextProfile);
            setInitialProfile(nextProfile);
            showToast("Profile updated.", { severity: "success" });
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Failed to update profile", {
                severity: "error",
            });
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
            showToast("New password and confirmation do not match.", { severity: "error" });
            return;
        }

        setSavingPassword(true);
        try {
            const response = await fetch("/api/users/me/password", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordDraft.currentPassword,
                    newPassword: passwordDraft.newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(await readApiError(response));
            }

            setPasswordDraft({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            showToast("Password updated.", { severity: "success" });
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Failed to update password", {
                severity: "error",
            });
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <Box sx={{ width: "100%", maxWidth: 1100, px: { xs: 2, sm: 3, md: 4 }, pb: 6 }}>
            <Stack spacing={3.5}>
                <Box>
                    <Typography variant="h4" sx={{ color: "text.primary", fontWeight: 700 }}>
                        Settings
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.55)", mt: 0.75 }}>
                        Manage your profile details and password.
                    </Typography>
                </Box>

                {profileError ? (
                    <Alert
                        severity="error"
                        sx={{
                            bgcolor: "rgba(255, 60, 60, 0.12)",
                            color: "text.primary",
                            border: "1px solid rgba(255, 60, 60, 0.2)",
                        }}
                    >
                        {profileError}
                    </Alert>
                ) : null}

                {loadingProfile ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress sx={{ color: "primary.main" }} />
                    </Box>
                ) : (
                    <Stack spacing={3.25}>
                        <ProfileSettingsForm
                            profile={profile}
                            loading={loadingProfile}
                            saving={savingProfile}
                            onChange={setProfile}
                            onSubmit={handleProfileSubmit}
                            onReset={() => setProfile(initialProfile)}
                        />

                        <PasswordSettingsForm
                            value={passwordDraft}
                            loading={savingPassword}
                            onChange={setPasswordDraft}
                            onSubmit={handlePasswordSubmit}
                        />
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}
