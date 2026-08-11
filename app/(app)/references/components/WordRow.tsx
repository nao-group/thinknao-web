"use client";

import { Box, Text, rem } from "@mantine/core";
import { INK, PRIMARY, MUTED } from "@/constants/colors";
import type { WordEntry } from "../data";
import { SubjectBadge } from "./SubjectBadge";

export function WordRow({ entry, onClick }: { entry: WordEntry; onClick: () => void }) {
  return (
    <Box
      px="md"
      py="sm"
      className="hover-zoom"
      onClick={onClick}
      style={{
        backgroundColor: "white",
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
            <Text size="md" fw={800} c={INK} style={{ lineHeight: 1.1 }}>{entry.zh}</Text>
            {entry.pinyin && <Text size="xs" c={PRIMARY} fw={600}>{entry.pinyin}</Text>}
            <Text size="xs" c={MUTED}>{entry.term}</Text>
          </>
        ) : (
          <Text size="sm" fw={700} c={INK}>{entry.term}</Text>
        )}
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Text size="sm" c={MUTED} style={{ flex: 1 }} lineClamp={1}>
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
