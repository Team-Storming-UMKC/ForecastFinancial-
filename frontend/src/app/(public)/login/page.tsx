"use client";
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();

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
      <Box sx={{ px: { xs: 4, md: 10 }, py: 6, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Paper sx={{ p: 4, width: "100%", maxWidth: 500}}>
          <Typography variant="h5" fontWeight={700}>
            Login
          </Typography>

          <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                fullWidth
                required
            />

            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                required
            />

            {error && (
                <Typography sx={{ mt: 0.5 }} color="error">
                  {error}
                </Typography>
            )}

            <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 1, minHeight: 44 }}>
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Typography variant="body2" sx={{ mt: 1 }}>
              Don&apos;t have an account?{" "}
              <Typography component={Link} href="/get-started" sx={{ textDecoration: "none" }}>
                Register
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Box>
  );
}

