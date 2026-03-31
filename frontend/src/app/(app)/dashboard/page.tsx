"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import TransactionCharts from "@/components/dashboard/TransactionCharts";

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
        void loadUser();
    }, []);

    return (
        <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
            <Stack spacing={4} sx={{ width: "100%" }}>
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
                <TransactionCharts />
            </Stack>
        </Box>
    );
}

