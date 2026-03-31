"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Typography, useTheme } from "@mui/material";
import AuthCard from "@/components/auth/AuthCard";
import AuthInputField from "@/components/auth/AuthInputField";
import { getRegisterPageStyles } from "./page.styles";

export default function RegisterPage() {
    const router = useRouter();
    const theme = useTheme();
    const styles = getRegisterPageStyles(theme);

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Registration failed");
            }

            router.push("/login");
        } catch {
            setError("Registration failed. Try a different email.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard
            title="Create an account"
            submitLabel="Create account"
            onSubmit={handleRegister}
            loading={loading}
            footerLink={{ label: "Already have an account? Sign in", href: "/login" }}
        >
            <AuthInputField
                fullWidth
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
            />

            <AuthInputField
                fullWidth
                type="password"
                withPasswordToggle
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
