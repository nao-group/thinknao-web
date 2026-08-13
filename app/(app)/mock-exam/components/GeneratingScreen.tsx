"use client";

import { Box, Stack, Text, rem } from "@mantine/core";
import { INK, SURFACE } from "@/constants/colors";
import { SUBJECT_CONFIG, SUBJECT_META } from "../data";
import type { Subject } from "../types";

interface GeneratingScreenProps {
  subject: Subject;
}

// ─── Generating phase ───────────────────────────────────────────────────────────

export function GeneratingScreen({ subject }: GeneratingScreenProps) {
  const meta = SUBJECT_META[subject];
  const Icon = meta.icon;
  return (
    <Box style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: rem(24), minHeight: "60vh" }}>
      <style>{`@keyframes exam-spin { to { transform: rotate(360deg) } }`}</style>
      <Box style={{ position: "relative", width: rem(80), height: rem(80) }}>
        <Box style={{ width: rem(80), height: rem(80), borderRadius: "50%", border: `5px solid ${SURFACE}`, borderTop: `5px solid ${meta.iconColor}`, animation: "exam-spin 0.9s linear infinite" }} />
        <Box style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box style={{ width: rem(44), height: rem(44), borderRadius: rem(12), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} stroke={1.5} color={meta.iconColor} />
          </Box>
        </Box>
      </Box>
      <Stack gap={4} align="center">
        <Text fw={700} size="lg" c={INK}>Generating your exam…</Text>
        <Text size="sm" c="dimmed">{subject} · {SUBJECT_CONFIG[subject].duration / 60} min</Text>
      </Stack>
    </Box>
  );
}
