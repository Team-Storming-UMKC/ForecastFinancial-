"use client";

import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { getPasswordStrength, PASSWORD_POLICY_MESSAGE } from "@/utils/passwordPolicy";

export default function PasswordStrengthPanel({ password }: { password: string }) {
  const passwordStrength = React.useMemo(() => getPasswordStrength(password), [password]);

  return (
    <Box
      sx={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
        px: 1.75,
        py: 1.5,
      }}
    >
      <Stack spacing={1.25} gap={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography
            sx={{
              color: "text.primary",
              fontSize: "0.9rem",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Password strength
          </Typography>
          <Typography
            sx={{
              color: passwordStrength.color,
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            {passwordStrength.label}
          </Typography>
        </Stack>

        <Box
          sx={{
            width: "100%",
            height: 8,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box
            sx={{
              width: passwordStrength.width,
              height: "100%",
              borderRadius: 999,
              backgroundColor: passwordStrength.color,
              boxShadow: password ? `0 0 18px ${passwordStrength.color}33` : "none",
              transition: "width 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
            }}
          />
        </Box>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.58)",
            fontSize: "0.78rem",
            lineHeight: 1.45,
          }}
        >
          {PASSWORD_POLICY_MESSAGE}
        </Typography>

        <Stack spacing={0.75}>
          {[
            { label: "At least 8 characters", met: passwordStrength.checks.length },
            { label: "Contains a letter", met: passwordStrength.checks.letter },
            { label: "Contains a number", met: passwordStrength.checks.number },
            { label: "Contains a special symbol", met: passwordStrength.checks.special },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  color: item.met ? "text.primary" : "rgba(255,255,255,0.5)",
                  fontSize: "0.78rem",
                  lineHeight: 1.35,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  color: item.met ? passwordStrength.color : "rgba(255,255,255,0.35)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                {item.met ? "Met" : "Missing"}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
