"use client";

import * as React from "react";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import {
  bulletSx,
  contentSx,
  dividerSx,
  emptySx,
  headerSx,
  listItemSx,
  listSx,
  loadingLineSx,
  rootSx,
  subtitleSx,
  titleSx,
} from "./InsightsCard.styles";

type InsightResponseItem =
  | string
  | {
      tip?: unknown;
      text?: unknown;
      message?: unknown;
      recommendation?: unknown;
      insight?: unknown;
      title?: unknown;
      description?: unknown;
    };

interface InsightsCardProps {
  refreshKey?: number;
}

function messageFromFailedInsightsResponse(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { errorCode?: unknown; error?: unknown };

    if (typeof parsed.errorCode === "string" && parsed.errorCode.trim()) {
      return `Error code: ${parsed.errorCode.trim()}`;
    }

    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error.trim();
    }
  } catch {
    // Fall through to the generic status message when the response is not valid JSON.
  }

  return `Request failed: ${status}`;
}

function textFromInsight(item: InsightResponseItem) {
  if (typeof item === "string") return item.trim();
  if (!item || typeof item !== "object") return "";

  const primary =
    item.tip ??
    item.text ??
    item.message ??
    item.recommendation ??
    item.insight ??
    item.description;

  if (typeof primary === "string") return primary.trim();

  const title = typeof item.title === "string" ? item.title.trim() : "";
  const description = typeof item.description === "string" ? item.description.trim() : "";

  return [title, description].filter(Boolean).join(": ");
}

function LoadingInsights() {
  return (
    <Stack spacing={1.5} aria-label="Loading savings tips">
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 1.25,
            alignItems: "center",
          }}
        >
          <Box sx={[bulletSx, { backgroundColor: "rgba(255,255,255,0.12)", boxShadow: "none" }]} />
          <Box sx={[loadingLineSx, { width: index === 2 ? "72%" : "100%" }]} />
        </Box>
      ))}
    </Stack>
  );
}

export default function InsightsCard({ refreshKey }: InsightsCardProps) {
  const [tips, setTips] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadInsights = React.useCallback(async (isActive: () => boolean) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/insights", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(messageFromFailedInsightsResponse(response.status, await response.text()));
        }

        const json = (await response.json()) as unknown;
        const rawItems = Array.isArray(json)
          ? json
          : json && typeof json === "object" && Array.isArray((json as { insights?: unknown }).insights)
            ? (json as { insights: unknown[] }).insights
            : [];

        const nextTips = rawItems
          .map((item) => textFromInsight(item as InsightResponseItem))
          .filter((tip): tip is string => tip.length > 0);

        if (!isActive()) return;
        setTips(nextTips);
      } catch (e: unknown) {
        if (!isActive()) return;
        setError(e instanceof Error ? e.message : "Failed to load savings tips");
      } finally {
        if (!isActive()) return;
        setLoading(false);
      }
  }, []);

  React.useEffect(() => {
    let alive = true;

    void loadInsights(() => alive);

    return () => {
      alive = false;
    };
  }, [loadInsights, refreshKey]);

  return (
    <Box sx={rootSx}>
      <Box sx={contentSx}>
        <Stack sx={headerSx}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={titleSx}>
              AI Savings Tips
            </Typography>
            <Typography variant="body2" sx={subtitleSx}>
              Actionable recommendations based on your spending.
            </Typography>
          </Box>

          <TipsAndUpdatesIcon sx={{ color: "primary.main", flexShrink: 0, mt: 0.5 }} />
        </Stack>

        <Divider sx={dividerSx} />

        {loading ? (
          <LoadingInsights />
        ) : error ? (
          <Stack spacing={1.5}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => void loadInsights(() => true)}
              sx={{ alignSelf: "flex-start", color: "primary.main", px: 0 }}
            >
              Try again
            </Button>
          </Stack>
        ) : tips.length === 0 ? (
          <Typography sx={emptySx}>
            No savings tips are available yet.
          </Typography>
        ) : (
          <Box component="ul" sx={listSx}>
            {tips.map((tip, index) => (
              <Box component="li" key={`${tip}-${index}`} sx={listItemSx}>
                <Box aria-hidden sx={bulletSx} />
                <Typography component="span" variant="body2" sx={{ color: "inherit", lineHeight: "inherit" }}>
                  {tip}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
