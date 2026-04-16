"use client";

import * as React from "react";
import { Box } from "@mui/material";
import SunnyScene from "@/components/landing/SunnyScene";
import StormScene from "@/components/landing/StormScene";

export type ForecastKind = "sunny" | "cloudy" | "raining" | "thunderstorm";

export const FORECAST_STORAGE_KEY = "forecastFinancial.spendingForecast";
export const FORECAST_UPDATED_EVENT = "forecastFinancial:forecastUpdated";

function normalizeForecast(value: unknown): ForecastKind {
    if (typeof value !== "string") return "cloudy";
    const normalized = value.toLowerCase().replace(/[\s_-]+/g, "");

    if (normalized.includes("thunderstorm") || normalized.includes("storm")) return "thunderstorm";
    if (normalized.includes("rain")) return "raining";
    if (normalized.includes("sun") || normalized.includes("clear")) return "sunny";
    if (normalized.includes("cloud")) return "cloudy";

    return "cloudy";
}

function extractForecast(data: unknown): ForecastKind {
    if (!data || typeof data !== "object") return "cloudy";

    const record = data as Record<string, unknown>;
    return normalizeForecast(
        record.forecastTrend ??
        record.forecast ??
        record.trend ??
        record.condition ??
        record.status ??
        record.weather
    );
}

export function forecastLabel(forecast: ForecastKind) {
    if (forecast === "thunderstorm") return "Thunderstorm";
    if (forecast === "raining") return "Raining";
    if (forecast === "sunny") return "Sunny";
    return "Cloudy";
}

export async function fetchSpendingForecast() {
    const res = await fetch("/api/forecast/spending", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load spending forecast (${res.status})`);

    const data: unknown = await res.json();
    return extractForecast(data);
}

export function publishForecast(forecast: ForecastKind) {
    window.sessionStorage.setItem(FORECAST_STORAGE_KEY, forecast);
    window.dispatchEvent(new CustomEvent(FORECAST_UPDATED_EVENT, { detail: forecast }));
}

function getStoredForecast() {
    if (typeof window === "undefined") return "cloudy";
    return normalizeForecast(window.sessionStorage.getItem(FORECAST_STORAGE_KEY));
}

export default function ForecastBackground() {
    const [forecast, setForecast] = React.useState<ForecastKind>("cloudy");

    React.useEffect(() => {
        let alive = true;

        setForecast(getStoredForecast());

        async function loadForecast() {
            try {
                const nextForecast = await fetchSpendingForecast();
                if (!alive) return;
                setForecast(nextForecast);
                publishForecast(nextForecast);
            } catch {
                if (!alive) return;
                setForecast("cloudy");
            }
        }

        void loadForecast();

        function handleForecastUpdated(event: Event) {
            const nextForecast = normalizeForecast((event as CustomEvent).detail);
            setForecast(nextForecast);
        }

        window.addEventListener(FORECAST_UPDATED_EVENT, handleForecastUpdated);

        return () => {
            alive = false;
            window.removeEventListener(FORECAST_UPDATED_EVENT, handleForecastUpdated);
        };
    }, []);

    return (
        <Box
            aria-hidden="true"
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                overflow: "hidden",
                pointerEvents: "none",
                bgcolor: "background.default",
            }}
        >
            <SunnyScene visible={forecast === "sunny"} />
            <CloudyScene visible={forecast === "cloudy"} />
            <RainScene visible={forecast === "raining"} />
            <StormScene visible={forecast === "thunderstorm"} />
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(180deg, rgba(31,33,36,0.22) 0%, rgba(31,33,36,0.5) 52%, rgba(31,33,36,0.78) 100%)",
                }}
            />
        </Box>
    );
}

function CloudyScene({ visible }: { visible: boolean }) {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                opacity: visible ? 1 : 0,
                transition: "opacity 900ms ease",
                background:
                    "radial-gradient(circle at 18% 18%, rgba(170,180,195,0.22), transparent 28%), radial-gradient(circle at 72% 22%, rgba(120,132,150,0.2), transparent 30%), linear-gradient(180deg, rgba(59,65,76,0.42) 0%, rgba(31,33,36,0.12) 58%, rgba(31,33,36,0.42) 100%)",
            }}
        >
            {clouds.map((cloud) => (
                <Box
                    key={cloud.id}
                    sx={{
                        position: "absolute",
                        top: cloud.top,
                        left: cloud.left,
                        width: cloud.width,
                        height: cloud.height,
                        borderRadius: "999px",
                        background:
                            "radial-gradient(circle at 24% 50%, rgba(230,235,245,0.22), transparent 34%), radial-gradient(circle at 58% 48%, rgba(190,198,214,0.2), transparent 38%), rgba(150,160,178,0.12)",
                        filter: "blur(18px)",
                        animation: `forecastCloudDrift ${cloud.duration} ease-in-out infinite`,
                        animationDelay: cloud.delay,
                    }}
                />
            ))}
            <style jsx global>{`
                @keyframes forecastCloudDrift {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(34px); }
                }
            `}</style>
        </Box>
    );
}

function RainScene({ visible }: { visible: boolean }) {
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                opacity: visible ? 1 : 0,
                transition: "opacity 900ms ease",
                background:
                    "radial-gradient(circle at 28% 12%, rgba(92,126,172,0.2), transparent 30%), linear-gradient(180deg, rgba(28,39,58,0.45) 0%, rgba(22,28,39,0.22) 48%, rgba(18,22,30,0.52) 100%)",
            }}
        >
            {rainDrops.map((drop) => (
                <Box
                    key={drop.id}
                    sx={{
                        position: "absolute",
                        top: drop.top,
                        left: drop.left,
                        width: "1px",
                        height: drop.height,
                        opacity: drop.opacity,
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(190,216,255,0.78) 56%, rgba(124,166,230,0.36) 100%)",
                        transform: "translate3d(0, 0, 0) rotate(13deg)",
                        animation: `forecastRainFall ${drop.duration} linear infinite`,
                        animationDelay: drop.delay,
                        "--forecast-rain-drift": drop.drift,
                    }}
                />
            ))}
            <style jsx global>{`
                @keyframes forecastRainFall {
                    0% { transform: translate3d(0, -120px, 0) rotate(13deg); }
                    100% { transform: translate3d(var(--forecast-rain-drift), 122vh, 0) rotate(13deg); }
                }
            `}</style>
        </Box>
    );
}

const clouds = Array.from({ length: 9 }, (_, i) => ({
    id: `cloud-${i}`,
    top: `${8 + (i % 4) * 18}%`,
    left: `${-12 + (i * 17) % 112}%`,
    width: `${220 + (i % 4) * 62}px`,
    height: `${72 + (i % 3) * 28}px`,
    duration: `${8 + (i % 5) * 1.2}s`,
    delay: `${-(i % 4) * 1.4}s`,
}));

const rainDrops = Array.from({ length: 82 }, (_, i) => ({
    id: `forecast-rain-${i}`,
    left: `${(i * 29) % 100}%`,
    top: `${-26 - (i % 9) * 9}%`,
    height: `${46 + (i % 6) * 14}px`,
    opacity: 0.1 + (i % 5) * 0.04,
    duration: `${1.05 + (i % 7) * 0.1}s`,
    delay: `${-(i % 17) * 0.1}s`,
    drift: `${10 + (i % 6) * 4}px`,
}));
