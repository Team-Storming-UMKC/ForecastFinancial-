"use client";

import * as React from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack,
    CircularProgress,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ExtractionResultDisplay, {
    type ExtractionResult,
    type ExtractedTransaction,
} from "@/components/dashboard/ExtractionResultDisplay";
import { tintedGlass } from "@/theme/tintedGlass";

interface RawDataInputProps {
    onExtractionComplete: () => Promise<void>;
}

export default function RawDataInput({ onExtractionComplete }: RawDataInputProps) {
    const [rawData, setRawData] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [result, setResult] = React.useState<ExtractionResult | null>(null);

    const handleExtract = async () => {
        if (!rawData.trim()) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/ai/extract", {
                method: "POST",
                body: JSON.stringify({ text: rawData }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Extraction failed");

            const data = await res.json();

            const raw = Array.isArray(data) ? data : [data];

            const transactions: ExtractedTransaction[] = raw.map((item: any, idx: number) => ({
                id: `tx-${idx}`,
                date: item.date ?? new Date().toISOString().split("T")[0],
                description: item.merchant ?? "Unknown",
                amount: item.amount ?? 0,
                category: item.category ?? undefined,
                confidence: item.confidence ?? undefined,
                status: "confirmed" as const,
            }));

            const extractionResult: ExtractionResult = {
                extractedAt: new Date().toISOString(),
                totalFound: transactions.length,
                transactions,
            };

            setResult(extractionResult);
            setRawData("");
            await onExtractionComplete();
        } catch (error) {
            console.error("AI Extraction Error:", error);
            alert("Failed to process data. Please check the AI engine connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => setResult(null);

    return (
        <Stack spacing={3}>
            {/* ── Input Card ── */}
            <Box
                sx={{
                    ...tintedGlass,
                    borderRadius: 3,
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)",
                        pointerEvents: "none",
                        zIndex: 0,
                    },
                }}
            >
                <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", letterSpacing: "-0.3px" }}>
                            AI Data Import
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.55)" }}>
                            Paste your raw bank activity or financial statements below.
                        </Typography>
                    </Box>

                    <TextField
                        multiline
                        rows={6}
                        fullWidth
                        placeholder="e.g. 03/12/2026 - GROCERY STORE - $120.50"
                        value={rawData}
                        onChange={(e) => setRawData(e.target.value)}
                        variant="outlined"
                        disabled={loading}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                backgroundColor: "rgba(0,0,0,0.3)",
                                "& fieldset": {
                                    borderColor: "rgba(255,255,255,0.12)",
                                },
                                "&:hover fieldset": {
                                    borderColor: "rgba(255,255,255,0.25)",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "rgba(255,107,0,0.6)",
                                },
                            },
                            "& .MuiOutlinedInput-input": {
                                color: "#ffffff",
                                caretColor: "#ffffff",
                            },
                            "& .MuiOutlinedInput-input::placeholder": {
                                color: "rgba(255,255,255,0.3)",
                                opacity: 1,
                            },
                        }}
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="text"
                            onClick={() => { setRawData(""); setResult(null); }}
                            disabled={loading || (!rawData && !result)}
                            sx={{
                                color: "rgba(255,255,255,0.5)",
                                "&:hover": { color: "rgba(255,255,255,0.8)" },
                            }}
                        >
                            Clear All
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <AutoFixHighIcon />
                                )
                            }
                            onClick={handleExtract}
                            disabled={loading || !rawData.trim()}
                            sx={{
                                px: 4,
                                py: 1,
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "rgba(255,107,0,0.85)",
                                "&:hover": { bgcolor: "rgba(255,107,0,1)" },
                            }}
                        >
                            {loading ? "AI is Extracting..." : "Analyze with AI"}
                        </Button>
                    </Box>
                </Stack>
            </Box>

            {/* ── Results ── */}
            <ExtractionResultDisplay result={result} onDismiss={handleDismiss} />
        </Stack>
    );
}