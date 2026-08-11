"use client";

import { Box, Divider, Group, Stack, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { INK, PRIMARY, MUTED } from "@/constants/colors";
import type { FormulaEntry } from "../data";
import { SubjectBadge } from "./SubjectBadge";
import { SUBJECT_META } from "./subject-meta";
import { GalleryShell } from "./GalleryShell";

export function FormulaDetailModal({
  entries, idx, onIdxChange, onClose,
}: {
  entries: FormulaEntry[];
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
          {e.zhName && <Text fw={800} style={{ fontSize: rem(36), lineHeight: 1.1, color: INK, letterSpacing: "-0.02em" }}>{e.zhName}</Text>}
          {e.pinyin && <Text size="md" fw={600} c={PRIMARY} mt={4} style={{ letterSpacing: "0.04em" }}>{e.pinyin}</Text>}
          <Text size="md" fw={600} c={MUTED} mt={e.zhName ? 2 : 0}>{e.name}</Text>
        </Box>
        <Box px="lg" py="md" mb="lg" style={{ backgroundColor: meta.iconBg, borderRadius: rem(12), borderLeft: `4px solid ${meta.iconColor}`, textAlign: "center" }}>
          <Text fw={800} style={{ fontFamily: "monospace", fontSize: rem(20), color: meta.iconColor, letterSpacing: "0.04em" }}>
            <LatexText>{e.formula}</LatexText>
          </Text>
        </Box>
        {slot === "current" && (
          <>
            <Divider mb="md" />
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Description</Text>
            <Text size="sm" c={INK} lh={1.7} mb={e.variables ? "lg" : 0}>{e.description}</Text>
            {e.variables && e.variables.length > 0 && (
              <>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={8}>Variables</Text>
                <Stack gap={6}>
                  {e.variables.map((v) => (
                    <Group key={v} gap={8} align="flex-start">
                      <Box style={{ width: rem(5), height: rem(5), borderRadius: "50%", backgroundColor: meta.iconColor, marginTop: rem(7), flexShrink: 0 }} />
                      <Text size="sm" c={INK} style={{ fontFamily: "monospace" }}><LatexText>{v}</LatexText></Text>
                    </Group>
                  ))}
                </Stack>
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
