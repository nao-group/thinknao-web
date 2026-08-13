"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { INK, SURFACE } from "@/constants/colors";
import { ALL_SUBJECTS, SUBJECT_CONFIG, SUBJECT_META } from "../data";

// ─── CSCA exam structure table (landing phase) ─────────────────────────────────

export function ExamStructureTable() {
  return (
    <Card style={{ overflow: "hidden" }}>
      <Box px="lg" py="md" style={{ borderBottom: "1px solid #F1F5F9" }}>
        <Text size="sm" fw={700} c={INK}>CSCA Exam Structure</Text>
      </Box>
      {/* Table header */}
      <Box px="lg" py="sm" style={{ backgroundColor: SURFACE, display: "grid", gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr 0.6fr", gap: rem(8) }}>
        {["Subject", "Language", "Duration", "Questions", "Score"].map((h) => (
          <Text key={h} size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.05em" }}>{h}</Text>
        ))}
      </Box>
      {ALL_SUBJECTS.map((subj, i) => {
        const meta = SUBJECT_META[subj];
        const subCfg = SUBJECT_CONFIG[subj];
        const Icon = meta.icon;
        return (
          <Box
            key={subj}
            px="lg"
            py="md"
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.4fr 1fr 1.2fr 0.6fr",
              gap: rem(8),
              alignItems: "center",
              borderBottom: i < ALL_SUBJECTS.length - 1 ? "1px solid #F1F5F9" : "none",
            }}
          >
            <Group gap={8} wrap="nowrap">
              <Box style={{ width: rem(24), height: rem(24), borderRadius: rem(6), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={13} stroke={1.5} color={meta.iconColor} />
              </Box>
              <Text size="sm" fw={600} c={INK}>{subj}</Text>
            </Group>
            <Text size="sm" c="dimmed">{subCfg.langLabel}</Text>
            <Text size="sm" c="dimmed">{subCfg.duration / 60} min</Text>
            <Text size="sm" c="dimmed">{subCfg.questionCount} MCQ</Text>
            <Text size="sm" c="dimmed">0–100</Text>
          </Box>
        );
      })}
    </Card>
  );
}
