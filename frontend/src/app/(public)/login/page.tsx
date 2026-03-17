"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Typography, useTheme } from "@mui/material";
import AuthCard from "@/components/auth/AuthCard";
import AuthInputField from "@/components/auth/AuthInputField";
import { getLoginPageStyles } from "./page.styles";

export default function LoginPage() {
    const router = useRouter();
    const theme = useTheme();
    const styles = getLoginPageStyles(theme);

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Invalid credentials");
            }

            router.push("/dashboard");
        } catch (err) {
            setError("Login failed. Check your email and password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthCard
            title="Welcome back"
            submitLabel="Sign In"
            onSubmit={handleLogin}
            loading={loading}
            footerLink={{ label: "Forgot password?", href: "/forgot-password" }}
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
                autoComplete="current-password"
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