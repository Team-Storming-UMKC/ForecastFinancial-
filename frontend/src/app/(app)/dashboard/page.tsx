"use client";

import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import TransactionsPanel from "@/components/transactions/TransactionsPanel";

export default function DashboardPage() {
    const [email, setEmail] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/auth/me");
            if (!res.ok) {
                window.location.href = "/login";
                return;
            }
            const data = await res.json();
            setEmail(data.email);
        }
        loadUser();
    }, []);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Dashboard
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        {email ? `Logged in as: ${email}` : "Loading..."}
                    </Typography>
                </Box>

                <Button variant="outlined" onClick={handleLogout}>
                    Logout
                </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <TransactionsPanel />
            </Box>
        </Box>
    );
}

