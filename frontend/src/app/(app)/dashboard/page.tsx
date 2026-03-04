"use client";

import * as React from "react";
import { Box, Button, Stack, Typography, Container } from "@mui/material";
import TransactionsPanel from "@/components/transactions/TransactionsPanel";
import TransactionCharts from "@/components/dashboard/TransactionCharts";

export default function DashboardPage() {
    const [email, setEmail] = React.useState<string | null>(null);
    const [chartsKey, setChartsKey] = React.useState(0);

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Dashboard
                    </Typography>
                    <Typography sx={{ mt: 1, color: "text.secondary" }}>
                        {email ? `Logged in as: ${email}` : "Loading..."}
                    </Typography>
                </Box>

                <Button variant="outlined" onClick={handleLogout}>
                    Logout
                </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
                <TransactionsPanel onDataChange={() => setChartsKey((k) => k + 1)} />
            </Box>

            <Box sx={{ display: "grid", gap: 2, mt: 4 }}>
                <TransactionCharts refreshKey={chartsKey} />
            </Box>
        </Container>
    );
}

