"use client";

import * as React from "react";
import { Box, BoxProps, Stack, Typography } from "@mui/material";
import { tintedGlass } from "@/theme/tintedGlass";

interface SettingsSectionCardProps extends Omit<BoxProps, "title"> {
    title: string;
    description: string;
    children: React.ReactNode;
}

export default function SettingsSectionCard({
    title,
    description,
    children,
    sx,
    ...props
}: SettingsSectionCardProps) {
    return (
        <Box
            sx={[
                {
                    ...tintedGlass,
                    borderRadius: "23px",
                    p: { xs: 2.5, md: 3.25 },
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    },
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
            {...props}
        >
            <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
                <Box>
                    <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)", mt: 0.5 }}>
                        {description}
                    </Typography>
                </Box>

                {children}
            </Stack>
        </Box>
    );
}
