"use client";

import { Box, Stack, Typography } from "@mui/material";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { tintedGlass } from "@/theme/tintedGlass";

export interface CategoryPoint {
    name: string;
    value: number;
}

interface TopCategoriesChartProps {
    data: CategoryPoint[];
}

function money(n: number) {
    return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    });
}

function compactMoney(n: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: n >= 1000 ? "compact" : "standard",
        maximumFractionDigits: n >= 1000 ? 1 : 0,
    }).format(n);
}

const PIE_COLORS = [
    "#8b5cf6",
    "#f79a8b",
    "#45c4e6",
    "#f6b04d",
    "#7ee0b3",
    "#5f7cff",
    "#9b87f5",
    "#2ec5ff",
];

export default function TopCategoriesChart({
    data,
}: TopCategoriesChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const topCategories = data.slice(0, 8);

    return (
        <Box
            sx={{
                ...tintedGlass,
                borderRadius: "20px",
                p: { xs: 2.5, sm: 3 },
                position: "relative",
                overflow: "hidden",
                minHeight: 320,
                "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background:
                        "radial-gradient(circle at top left, rgba(255,255,255,0.08) 0%, transparent 38%)",
                    pointerEvents: "none",
                    zIndex: 0,
                },
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    fontWeight={700}
                    sx={{ color: "text.primary", letterSpacing: "-0.3px" }}
                >
                    Top Categories
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.5)", mt: 0.5 }}
                >
                    Category share across the selected transaction range.
                </Typography>

                <Box
                    sx={{
                        mt: 2.5,
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 180px" },
                        gap: 2,
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ position: "relative", height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topCategories}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={74}
                                    outerRadius={108}
                                    paddingAngle={2}
                                    cornerRadius={6}
                                    stroke="rgba(29,29,29,0.4)"
                                    strokeWidth={2}
                                >
                                    {topCategories.map((entry, index) => (
                                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        typeof value === "number" ? money(value) : value || ""
                                    }
                                    contentStyle={{
                                        background: "rgba(15,20,30,0.96)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "10px",
                                        color: "#fff",
                                        fontSize: 13,
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                    labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                pointerEvents: "none",
                            }}
                        >
                            <Stack spacing={0.25} sx={{ textAlign: "center" }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "rgba(255,255,255,0.45)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Total Spend
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#ffffff",
                                        fontWeight: 800,
                                        fontSize: { xs: "1.55rem", sm: "1.85rem" },
                                        lineHeight: 1,
                                        letterSpacing: "-0.04em",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    {compactMoney(total)}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: "rgba(255,255,255,0.38)" }}
                                >
                                    {topCategories.length} categories
                                </Typography>
                            </Stack>
                        </Box>
                    </Box>

                    <Stack spacing={1}>
                        {topCategories.map((item, index) => {
                            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

                            return (
                                <Box
                                    key={item.name}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "12px minmax(0, 1fr) auto",
                                        gap: 1,
                                        alignItems: "center",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                                        }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                color: "rgba(255,255,255,0.78)",
                                                fontSize: 12,
                                                lineHeight: 1.2,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {item.name}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            color: "rgba(255,255,255,0.48)",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            fontVariantNumeric: "tabular-nums",
                                        }}
                                    >
                                        {percent}%
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
