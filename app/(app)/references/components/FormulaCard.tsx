"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { LatexText } from "@/components/latex-text";
import { MUTED } from "@/constants/colors";
import type { FormulaEntry } from "../types";
import { ChineseLabel } from "./ChineseLabel";
import { SubjectBadge } from "./SubjectBadge";
import { SUBJECT_META } from "./subject-meta";

export function FormulaCard({ entry, onClick }: { entry: FormulaEntry; onClick: () => void }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Card
      p="md"
      className="hover-zoom"
      onClick={onClick}
      style={{
        border: "1.5px solid #F1F5F9",
        display: "flex",
        flexDirection: "column",
        gap: rem(10),
        minHeight: rem(148),
        cursor: "pointer",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ChineseLabel zh={entry.zhName} pinyin={entry.pinyin} term={entry.name} />
        <SubjectBadge subject={entry.subject} />
      </Group>
      <Box
        px="sm"
        py="xs"
        style={{
          backgroundColor: meta.iconBg,
          borderRadius: rem(8),
          borderLeft: `3px solid ${meta.iconColor}`,
        }}
      >
        <Text size="sm" fw={700} c={meta.iconColor} style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}>
          <LatexText>{entry.formula}</LatexText>
        </Text>
      </Box>
      <Text size="xs" c={MUTED} lh={1.5}>
        {entry.description.length > 80 ? entry.description.slice(0, 80) + "…" : entry.description}
      </Text>
    </Card>
  );
}
