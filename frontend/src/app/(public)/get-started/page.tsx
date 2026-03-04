"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconButton, InputAdornment, OutlinedInput, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AuthCard from "@/components/auth/AuthCard";
import { inputSx } from "@/components/auth/authStyles";

export default function RegisterPage() {
    const router = useRouter();

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
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
        } catch (err) {
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
                autoComplete="new-password"
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