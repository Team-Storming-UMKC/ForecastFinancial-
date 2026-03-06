"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconButton, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AuthCard from "@/components/auth/AuthCard";
import { inputSx } from "@/components/auth/authStyles";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
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
            <OutlinedInput
                fullWidth
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                sx={inputSx}
            />

            <OutlinedInput
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.4)" }}
                        >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                }
                sx={inputSx}
            />

            {error && (
                <Typography color="error" fontSize="0.85rem">
                    {error}
                </Typography>
            )}
        </AuthCard>
    );
}