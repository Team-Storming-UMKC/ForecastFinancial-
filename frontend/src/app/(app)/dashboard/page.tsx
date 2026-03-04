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
            <Stack spacing={"32px !important"}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Dashboard
                        </Typography>
                        <Typography sx={{ mt: 1, color: "text.secondary" }}>
                            {email ? `Logged in as: ${email}` : "Loading..."}
                        </Typography>
                    </Box>
                </Stack>

                <TransactionsPanel onDataChange={() => setChartsKey((k) => k + 1)} />

                <TransactionCharts refreshKey={chartsKey} />
            </Stack>
        </Container>
    );
}

