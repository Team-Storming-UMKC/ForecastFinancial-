"use client";

import * as React from "react";
import {
    Box,
    Button,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { AnimatePresence, motion } from "framer-motion";
import AuthDateField from "@/components/auth/AuthDateField";
import AuthFieldGrid from "@/components/auth/AuthFieldGrid";
import AuthInputField from "@/components/auth/AuthInputField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import { tintedGlass } from "@/theme/tintedGlass";

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

function displayValue(value: string | null | undefined) {
    return value?.trim() || "-";
}

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

const panelTransition = {
    duration: 0.24,
    ease: [0.22, 1, 0.36, 1],
} as const;

export default function ProfileSettingsForm({
    profile,
    loading = false,
    saving = false,
    onChange,
    onSubmit,
    onReset,
}: ProfileSettingsFormProps) {
    const [isEditing, setIsEditing] = React.useState(false);

    function handleReset() {
        onReset();
        setIsEditing(false);
    }

    return (
        <Box
            data-node-id="347:614"
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
            <IconButton
                aria-label={isEditing ? "Close profile editor" : "Edit profile"}
                onClick={() => setIsEditing((current) => !current)}
                disabled={loading || saving}
                sx={{
                    position: "absolute",
                    top: { xs: 18, md: 26 },
                    right: { xs: 18, md: 26 },
                    zIndex: 2,
                    width: 35,
                    height: 35,
                    color: "#a4a4a4",
                    borderRadius: "8px",
                    p: 0,
                    "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.08)",
                        color: "#ffffff",
                    },
                    "& .MuiSvgIcon-root": {
                        fontSize: 31,
                        transform: isEditing ? "rotate(-12deg)" : "rotate(0deg)",
                        transition: "transform 220ms ease",
                    },
                }}
            >
                <EditOutlinedIcon />
            </IconButton>

            <Typography
                data-node-id="347:628"
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
                Personal Information
            </Typography>

            <AnimatePresence mode="wait" initial={false}>
                {!isEditing ? (
                    <Box
                        key="profile-summary"
                        component={motion.div}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 8, height: 0 }}
                        transition={panelTransition}
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "minmax(120px, 0.85fr) minmax(150px, 1.3fr)",
                                md: "max-content max-content minmax(260px, max-content) max-content",
                            },
                            justifyContent: { md: "space-between" },
                            columnGap: { xs: 0, sm: 5, md: 6 },
                            rowGap: { xs: 2, sm: 2.5 },
                            mt: { xs: 1.25, md: 0.75 },
                            pr: { xs: 0, md: 6 },
                        }}
                    >
                        {[
                            { label: "First Name", value: displayValue(profile.firstName), nodeId: "347:735" },
                            { label: "Last Name", value: displayValue(profile.lastName), nodeId: "348:744" },
                            { label: "Email", value: displayValue(profile.email), nodeId: "348:762" },
                            {
                                label: "Date of Birth",
                                value: displayValue(toDisplayDate(profile.dateOfBirth)),
                                nodeId: "348:770",
                            },
                        ].map((item) => (
                            <Box key={item.label} sx={{ minWidth: 0 }}>
                                <Typography
                                    data-node-id={item.nodeId}
                                    sx={{
                                        color: "#a4a4a4",
                                        fontSize: 16,
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        letterSpacing: 0,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {item.label}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#ffffff",
                                        fontSize: 24,
                                        fontWeight: 400,
                                        lineHeight: 1.1,
                                        letterSpacing: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                    title={item.value}
                                >
                                    {item.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box
                        key="profile-editor"
                        component={motion.form}
                        onSubmit={onSubmit}
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: 8, height: 0 }}
                        transition={panelTransition}
                        sx={{ position: "relative", zIndex: 1, mt: 2.5, overflow: "hidden" }}
                    >
                        <Stack spacing={3} gap={2}>
                            <AuthFieldGrid sx={{ rowGap: 3, columnGap: 3 }}>
                                <Box>
                                    <FieldLabel>First Name</FieldLabel>
                                    <AuthInputField
                                        fullWidth
                                        placeholder="First name"
                                        value={profile.firstName}
                                        onChange={(event) => onChange({ ...profile, firstName: event.target.value })}
                                        autoComplete="given-name"
                                        disabled={loading || saving}
                                        required
                                    />
                                </Box>

                                <Box>
                                    <FieldLabel>Last Name</FieldLabel>
                                    <AuthInputField
                                        fullWidth
                                        placeholder="Last name"
                                        value={profile.lastName}
                                        onChange={(event) => onChange({ ...profile, lastName: event.target.value })}
                                        autoComplete="family-name"
                                        disabled={loading || saving}
                                        required
                                    />
                                </Box>
                            </AuthFieldGrid>

                            <AuthFieldGrid sx={{ rowGap: 3, columnGap: 3 }}>
                                <Box>
                                    <FieldLabel>Email</FieldLabel>
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
                                </Box>

                                <Box>
                                    <FieldLabel>Date of Birth</FieldLabel>
                                    <AuthDateField
                                        fullWidth
                                        placeholder="Date of birth"
                                        value={toDisplayDate(profile.dateOfBirth)}
                                        onChange={(value) => onChange({ ...profile, dateOfBirth: value })}
                                        autoComplete="bday"
                                        disabled={loading || saving}
                                    />
                                </Box>
                            </AuthFieldGrid>

                            <Box>
                                <FieldLabel>Profile Picture URL</FieldLabel>
                                <AuthInputField
                                    fullWidth
                                    placeholder="Profile picture URL"
                                    value={profile.profilePictureUrl ?? ""}
                                    onChange={(event) =>
                                        onChange({ ...profile, profilePictureUrl: event.target.value })
                                    }
                                    autoComplete="url"
                                    disabled={loading || saving}
                                />
                            </Box>

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
                                    onClick={handleReset}
                                    disabled={loading || saving}
                                    sx={{
                                        color: "rgba(255,255,255,0.6)",
                                        alignSelf: { xs: "stretch", sm: "center" },
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Box sx={{ width: { xs: "100%", sm: 180 } }}>
                                    <AuthSubmitButton label="Save profile" loading={saving} />
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    );
}
