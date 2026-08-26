"use client";

import { Box, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { INK, PRIMARY, MUTED } from "@/constants/colors";
import type { FormulaEntry } from "../types";
import { SubjectBadge } from "./SubjectBadge";
import { SUBJECT_META } from "./subject-meta";

export function FormulaRow({ entry, onClick }: { entry: FormulaEntry; onClick: () => void }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Box
      px="md"
      py="sm"
      className="hover-zoom"
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
      <Box style={{ width: rem(160), flexShrink: 0 }}>
        {entry.zhName ? (
          <>
            <Text size="md" fw={800} c={INK} style={{ lineHeight: 1.1 }}>{entry.zhName}</Text>
            {entry.pinyin && <Text size="xs" c={PRIMARY} fw={600}>{entry.pinyin}</Text>}
            <Text size="xs" c={MUTED}>{entry.name}</Text>
          </>
        ) : (
          <Text size="sm" fw={700} c={INK}>{entry.name}</Text>
        )}
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Box px="xs" py={3} style={{ backgroundColor: meta.iconBg, borderRadius: rem(6), flexShrink: 0, maxWidth: rem(240) }}>
        <Text size="xs" fw={700} c={meta.iconColor} style={{ fontFamily: "monospace" }} lineClamp={1}>
          <LatexText>{entry.formula}</LatexText>
        </Text>
      </Box>
      <Text size="sm" c={MUTED} style={{ flex: 1 }} lineClamp={1}>
        {entry.description}
      </Text>
    </Box>
  );
}
