"use client";

import { Badge, Box, Group, Stack, Text, rem } from "@mantine/core";
import { CORRECT_GREEN, INK, WRONG_RED } from "@/constants/colors";
import { PAST_EXAMS, SUBJECT_META } from "../data";

// ─── Recent attempts sidebar (landing phase) ───────────────────────────────────

export function RecentAttempts() {
  return (
    <Stack gap="xs">
      {PAST_EXAMS.map((exam) => {
        const meta = SUBJECT_META[exam.subject];
        const Icon = meta.icon;
        return (
          <Box key={exam.id} p="md" style={{ backgroundColor: "white", borderRadius: rem(12) }}>
            <Group justify="space-between" mb={6}>
              <Badge
                size="sm"
                radius="sm"
                style={{ backgroundColor: exam.passed ? "#DCFCE7" : "#FEE2E2", color: exam.passed ? CORRECT_GREEN : WRONG_RED, fontWeight: 700 }}
              >
                {exam.passed ? "PASS" : "FAIL"}
              </Badge>
              <Text size="xs" c="dimmed">{exam.date}</Text>
            </Group>
            <Group gap={6} mb={4}>
              <Box style={{ width: rem(18), height: rem(18), borderRadius: rem(4), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={10} stroke={1.5} color={meta.iconColor} />
              </Box>
              <Text size="sm" fw={600} c={INK}>{exam.subject}</Text>
            </Group>
            <Group gap={6}>
              <Text size="xs" c="dimmed">{exam.score}/{exam.total} ({exam.pct}%)</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{exam.duration}</Text>
              <Text size="xs" c="dimmed">·</Text>
              <Text size="xs" c="dimmed">{exam.lang}</Text>
            </Group>
          </Box>
        );
      })}
    </Stack>
  );
}
