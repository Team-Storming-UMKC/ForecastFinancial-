"use client";

import { Box, Stack, Typography } from "@mui/material";
import RecurringBillsCalendar from "@/components/recurring-bills/RecurringBillsCalendar";

export default function RecurringPage() {
  return (
    <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      <Stack spacing={3} sx={{ width: "100%" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", letterSpacing: 0 }}>
            Recurring Bills
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary", maxWidth: 680 }}>
            Visualize upcoming subscriptions and monthly charges before they renew.
          </Typography>
        </Box>

        <RecurringBillsCalendar />
      </Stack>
    </Box>
  );
}
