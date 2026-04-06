"use client";

import * as React from "react";
import {
    Avatar,
    Box,
    Button,
    Stack,
    Typography,
} from "@mui/material";
import AuthDateField from "@/components/auth/AuthDateField";
import AuthFieldGrid from "@/components/auth/AuthFieldGrid";
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import SettingsSectionCard from "./SettingsSectionCard";

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string | null;
    profilePictureUrl: string | null;
}

interface ProfileSettingsFormProps {
    profile: UserProfile;
    loading?: boolean;
    saving?: boolean;
    onChange: (next: UserProfile) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
}

function toDisplayDate(value: string | null) {
    if (!value) {
        return "";
    }

    const [year, month, day] = value.split("-");
    if (!year || !month || !day) {
        return value;
    }

    return `${month}/${day}/${year}`;
}

function initials(profile: UserProfile) {
    const first = profile.firstName.trim().charAt(0);
    const last = profile.lastName.trim().charAt(0);
    return `${first}${last}`.trim().toUpperCase() || "U";
}

export default function ProfileSettingsForm({
    profile,
    loading = false,
    saving = false,
    onChange,
    onSubmit,
    onReset,
}: ProfileSettingsFormProps) {
    return (
        <SettingsSectionCard
            title="Profile"
            description="Update your name, email, birthday, and profile image."
        >
            <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3.25}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Avatar
                            src={profile.profilePictureUrl || undefined}
                            sx={{
                                width: 68,
                                height: 68,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                fontWeight: 700,
                                fontSize: "1.25rem",
                            }}
                        >
                            {initials(profile)}
                        </Avatar>

                        <Box sx={{ flex: 1, width: "100%" }}>
                            <Typography sx={{ color: "text.primary", fontWeight: 600 }}>
                                Profile picture
                            </Typography>
                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mb: 1.25 }}>
                                Paste an image URL from your backend or hosted image source.
                            </Typography>

                            <AuthInputField
                                fullWidth
                                placeholder="https://example.com/avatar.png"
                                value={profile.profilePictureUrl ?? ""}
                                onChange={(event) =>
                                    onChange({ ...profile, profilePictureUrl: event.target.value })
                                }
                                autoComplete="url"
                                disabled={loading || saving}
                            />
                        </Box>
                    </Stack>

                    <AuthFieldGrid sx={{ rowGap: 2.25, columnGap: 2 }}>
                        <AuthInputField
                            fullWidth
                            placeholder="First name"
                            value={profile.firstName}
                            onChange={(event) => onChange({ ...profile, firstName: event.target.value })}
                            autoComplete="given-name"
                            disabled={loading || saving}
                            required
                        />

                        <AuthInputField
                            fullWidth
                            placeholder="Last name"
                            value={profile.lastName}
                            onChange={(event) => onChange({ ...profile, lastName: event.target.value })}
                            autoComplete="family-name"
                            disabled={loading || saving}
                            required
                        />
                    </AuthFieldGrid>

                    <AuthFieldGrid sx={{ rowGap: 2.25, columnGap: 2 }}>
                        <AuthInputField
                            fullWidth
                            type="email"
                            placeholder="Email"
                            value={profile.email}
                            onChange={(event) => onChange({ ...profile, email: event.target.value })}
                            autoComplete="email"
                            disabled={loading || saving}
                            required
                        />

                        <AuthDateField
                            fullWidth
                            placeholder="Date of birth"
                            value={toDisplayDate(profile.dateOfBirth)}
                            onChange={(value) => onChange({ ...profile, dateOfBirth: value })}
                            autoComplete="bday"
                            disabled={loading || saving}
                        />
                    </AuthFieldGrid>

                    <Stack
                        direction={{ xs: "column-reverse", sm: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                        sx={{ pt: 0.5 }}
                    >
                        <Button
                            type="button"
                            variant="text"
                            onClick={onReset}
                            disabled={loading || saving}
                            sx={{
                                color: "rgba(255,255,255,0.6)",
                                alignSelf: { xs: "stretch", sm: "center" },
                            }}
                        >
                            Reset changes
                        </Button>

                        <Box sx={{ width: { xs: "100%", sm: 180 } }}>
                            <AuthSubmitButton label="Save profile" loading={saving} />
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </SettingsSectionCard>
    );
}
