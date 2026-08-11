"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { SURFACE, MUTED } from "@/constants/colors";
import type { WordEntry } from "../data";
import { ChineseLabel } from "./ChineseLabel";
import { SubjectBadge } from "./SubjectBadge";

export function WordCard({ entry, onClick }: { entry: WordEntry; onClick: () => void }) {
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
        <ChineseLabel zh={entry.zh} pinyin={entry.pinyin} term={entry.term} />
        <SubjectBadge subject={entry.subject} />
      </Group>
      <Text size="sm" c={MUTED} lh={1.55} style={{ flex: 1 }}>
        {entry.definition.length > 90 ? entry.definition.slice(0, 90) + "…" : entry.definition}
      </Text>
      {entry.example && (
        <Box px="xs" py={4} style={{ backgroundColor: SURFACE, borderRadius: rem(6) }}>
          <Text size="xs" c={MUTED} style={{ fontStyle: "italic" }}>
            e.g. {entry.example}
          </Text>
        </Box>
      )}
    </Card>
  );
}
