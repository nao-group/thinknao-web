"use client";

import { Box, Text, rem } from "@mantine/core";
import { PRIMARY } from "@/constants/colors";
import type { WordEntry } from "../types";
import { SubjectBadge } from "./SubjectBadge";

export function WordRow({ entry, onClick }: { entry: WordEntry; onClick: () => void }) {
  return (
    <Box
      px="md"
      py="sm"
      className="hover-zoom reference-card"
      data-subject={entry.subject}
      onClick={onClick}
      style={{
        backgroundColor: "#FFFDF8",
        borderRadius: rem(10),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        gap: rem(16),
        cursor: "pointer",
      }}
    >
      <Box style={{ width: rem(140), flexShrink: 0 }}>
        {entry.zh ? (
          <>
            <Text size="md" fw={800} c="var(--app-text-primary)" style={{ lineHeight: 1.1 }}>{entry.zh}</Text>
            {entry.pinyin && <Text size="xs" c={PRIMARY} fw={600}>{entry.pinyin}</Text>}
            <Text size="xs" c="var(--app-text-muted)">{entry.term}</Text>
          </>
        ) : (
          <Text size="sm" fw={700} c="var(--app-text-primary)">{entry.term}</Text>
        )}
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Text size="sm" c="var(--app-text-muted)" style={{ flex: 1 }} lineClamp={1}>
        {entry.definition}
      </Text>
      {entry.example && (
        <Text size="xs" c="dimmed" style={{ flexShrink: 0, maxWidth: rem(160) }} lineClamp={1}>
          {entry.example}
        </Text>
      )}
    </Box>
  );
}
