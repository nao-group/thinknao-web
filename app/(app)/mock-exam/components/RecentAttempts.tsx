"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Group, Stack, Text, rem } from "@mantine/core";
import { CORRECT_GREEN, INK, WRONG_RED } from "@/constants/colors";
import { SUBJECT_META } from "../data";
import { fetchRecentExamAttempts, type ExamAttemptSummary } from "../api";
import { EmptyState } from "@/components/ui/empty-state";

// ─── Recent attempts sidebar (landing phase) ───────────────────────────────────

export function RecentAttempts() {
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchRecentExamAttempts()
      .then((result) => { if (active) setAttempts(result); })
      .catch((err) => console.error("Failed to load recent exam attempts:", err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 2 }, (_, i) => (
          <Box key={i} p="md" style={{ borderRadius: rem(14), backgroundColor: "#F8FAFC", height: rem(84) }} />
        ))}
      </Stack>
    );
  }

  if (attempts.length === 0) {
    return <EmptyState compact title="No attempts yet" description="Your completed exams will show up here." />;
  }

  return (
    <Stack gap="xs">
      {attempts.map((exam) => {
        const meta = SUBJECT_META[exam.subject];
        const Icon = meta.icon;
        return (
          <Box key={exam.id} p="md" className="warm-surface" style={{ borderRadius: rem(14) }}>
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
