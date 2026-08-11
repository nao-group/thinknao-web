"use client";

import { Box, Divider, Stack, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { INK, SURFACE, PRIMARY, MUTED } from "@/constants/colors";
import type { WordEntry } from "../data";
import { SubjectBadge } from "./SubjectBadge";
import { SUBJECT_META } from "./subject-meta";
import { GalleryShell } from "./GalleryShell";

export function WordDetailModal({
  entries, idx, onIdxChange, onClose,
}: {
  entries: WordEntry[];
  idx: number | null;
  onIdxChange: (i: number) => void;
  onClose: () => void;
}) {
  function renderSlot(slot: "prev" | "current" | "next") {
    const i = idx ?? 0;
    const e = slot === "prev" ? (i > 0 ? entries[i - 1] : null)
            : slot === "next" ? (i < entries.length - 1 ? entries[i + 1] : null)
            : entries[i];
    if (!e) return null;
    const meta = SUBJECT_META[e.subject];
    return (
      <Stack gap={0}>
        <SubjectBadge subject={e.subject} />
        <Box mt="md" mb="lg" style={{ textAlign: "center" }}>
          {e.zh && <Text fw={800} style={{ fontSize: rem(48), lineHeight: 1.1, color: INK, letterSpacing: "-0.02em" }}>{e.zh}</Text>}
          {e.pinyin && <Text size="md" fw={600} c={PRIMARY} mt={4} style={{ letterSpacing: "0.04em" }}>{e.pinyin}</Text>}
          <Text size="md" fw={600} c={MUTED} mt={e.zh ? 2 : 0}>{e.term}</Text>
        </Box>
        {slot === "current" && (
          <>
            <Divider mb="md" />
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Definition</Text>
            <Text size="sm" c={INK} lh={1.7} mb="lg">{e.definition}</Text>
            {e.example && (
              <>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Example</Text>
                <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10), borderLeft: `3px solid ${meta.iconColor}` }}>
                  <Text size="sm" c={INK} lh={1.6} style={{ fontStyle: "italic" }}><LatexText>{e.example}</LatexText></Text>
                </Box>
              </>
            )}
          </>
        )}
      </Stack>
    );
  }

  return (
    <GalleryShell
      opened={idx !== null}
      onClose={onClose}
      count={entries.length}
      idx={idx ?? 0}
      hasPrev={idx !== null && idx > 0}
      hasNext={idx !== null && idx < entries.length - 1}
      onPrev={() => onIdxChange((idx ?? 0) - 1)}
      onNext={() => onIdxChange((idx ?? 0) + 1)}
      renderSlot={renderSlot}
    />
  );
}
