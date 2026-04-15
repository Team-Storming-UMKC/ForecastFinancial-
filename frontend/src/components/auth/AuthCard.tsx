"use client";

import * as React from "react";
import { Box, Link, useTheme } from "@mui/material";
import { getAuthCardStyles } from "@/components/auth/AuthCard.styles";
import BrandHeader from "@/components/auth/BrandHeader";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import AuthRainScene from "@/components/auth/AuthRainScene";
import AuthSuccessTransition from "@/components/auth/AuthSuccessTransition";

export interface AuthCardProps {
    /** e.g. "Welcome back" or "Create an account" */
    title: string;
    /** Label for the submit button */
    submitLabel: string;
    /** Called when form is submitted */
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    /** The form fields to render (inputs, checkboxes, etc.) */
    children: React.ReactNode;
    /** Optional footer link e.g. "Forgot password?" or "Already have an account?" */
    footerLink?: {
        label: string;
        href: string;
    };
    /** Optional loading state for the submit button */
    loading?: boolean;
    /** Plays the clear-up transition after auth succeeds. */
    clearing?: boolean;
}

export default function AuthCard({
                                     title,
                                     submitLabel,
                                     onSubmit,
                                     children,
                                     footerLink,
                                     loading = false,
                                     clearing = false,
                                 }: AuthCardProps) {
    const theme = useTheme();
    const styles = getAuthCardStyles(theme);

    return (
        <Box sx={styles.page}>
            <AuthRainScene clearing={clearing} />
            {clearing && <AuthSuccessTransition />}
            <Box component="form" onSubmit={onSubmit} sx={[styles.form, clearing && styles.formClearing]}>
                <BrandHeader title={title} />

                <Box sx={styles.content}>{children}</Box>

                <AuthSubmitButton label={submitLabel} loading={loading || clearing} />

                {footerLink && (
                    <Link href={footerLink.href} sx={styles.footerLink}>
                        {footerLink.label}
                    </Link>
                )}
            </Box>
        </Box>
    );
}
