"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Typography, useTheme } from "@mui/material";
import AuthFieldGrid from "@/components/auth/AuthFieldGrid";
import AuthCard from "@/components/auth/AuthCard";
import AuthDateField from "@/components/auth/AuthDateField";
import AuthInputField from "@/components/auth/AuthInputField";
import { getRegisterPageStyles } from "./page.styles";

const SUCCESS_TRANSITION_MS = 1450;

function normalizeDateOfBirth(value: string) {
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

    return `${year.toString().padStart(4, "0")}-${month
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

export default function RegisterPage() {
    const router = useRouter();
    const theme = useTheme();
    const styles = getRegisterPageStyles(theme);

    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [dateOfBirth, setDateOfBirth] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [clearing, setClearing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const normalizedDateOfBirth = normalizeDateOfBirth(dateOfBirth);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!normalizedDateOfBirth) {
            setError("Enter date of birth as MMDDYYYY or MM/DD/YYYY.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    dateOfBirth: normalizedDateOfBirth,
                    email,
                    password,
                }),
            });

            if (!res.ok) {
                const errorResponse = await res.text();
                setError(errorResponse || "Registration failed");
                return;
            }

            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!loginRes.ok) {
                setError("Account created. Sign in to continue.");
                return;
            }

            setClearing(true);
            window.setTimeout(() => {
                router.push("/dashboard");
            }, SUCCESS_TRANSITION_MS);
        } catch {
            setError("Registration failed. Try a different email.");
        } finally {
            if (!clearing) {
                setLoading(false);
            }
        }
    }


    return (
        <AuthCard
            title="Welcome back"
            submitLabel="Sign Up"
            onSubmit={handleRegister}
            loading={loading}
            clearing={clearing}
            footerLink={{ label: "Already have an account? Sign in", href: "/login" }}
        >
                <AuthFieldGrid>
                    <AuthInputField
                        fullWidth
                        placeholder="First Name*"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        required
                    />

                    <AuthInputField
                        fullWidth
                        placeholder="Last Name*"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        required
                    />
                </AuthFieldGrid>

                <AuthDateField
                    fullWidth
                    placeholder="Date of Birth (MM/DD/YY)*"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    autoComplete="bday"
                    required
                />

                <AuthInputField
                    fullWidth
                    type="email"
                    placeholder="Email*"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />

                <AuthInputField
                    fullWidth
                    type="password"
                    withPasswordToggle
                    placeholder="Password*"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                />

                <AuthInputField
                    fullWidth
                    type="password"
                    withPasswordToggle
                    placeholder="Confirm Password*"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                />

                {error && (
                    <Typography sx={styles.errorText}>
                        {error}
                    </Typography>
                )}
        </AuthCard>
    );
}
