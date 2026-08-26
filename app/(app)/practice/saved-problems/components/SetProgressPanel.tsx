"use client";

import { Box, Group, SimpleGrid, Text, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import {
  INK, SURFACE, MUTED, PRIMARY,
  CORRECT_GREEN, WRONG_RED, NAV_CORRECT, NAV_WRONG,
} from "@/constants/colors";
import type { SetQuestion } from "../types";

/**
 * Progress + Questions panels for the practice set a saved question came from —
 * a faithful mirror of ProgressCard/QuestionNavigator on the practice session
 * page, so opening a saved question feels like being back in that set.
 *
 * DISPLAY ONLY. The cells are deliberately not buttons: this is a snapshot of
 * how the set stood, not a live session to navigate. The current question is
 * ringed the same way the practice navigator rings the active one.
 *
 * Only correct/wrong/unanswered appear. The practice navigator also has
 * "flagged" and "filled" states, but those live in that page's React state and
 * are never persisted, so they can't be reconstructed here.
 */
export function SetProgressPanel({ questions }: { questions: SetQuestion[] }) {
  const total = questions.length;
  const correct = questions.filter((q) => q.status === "correct").length;
  const wrong = questions.filter((q) => q.status === "wrong").length;
  const answered = correct + wrong;
  const left = total - answered;

  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  function cellStyle(q: SetQuestion): React.CSSProperties {
    const base: React.CSSProperties = {
      width: rem(48), height: rem(48), borderRadius: rem(10),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: rem(14),
      boxShadow: q.is_current ? `0 0 0 3px ${INK}` : "none",
    };
    if (q.status === "correct") return { ...base, backgroundColor: NAV_CORRECT, color: "white", fontWeight: 700 };
    if (q.status === "wrong") return { ...base, backgroundColor: NAV_WRONG, color: "white", fontWeight: 700 };
    return { ...base, backgroundColor: SURFACE, color: "#94A3B8", fontWeight: 500 };
  }

  return (
    <>
      <Card p="lg">
        <Group justify="space-between" mb={rem(10)}>
          <Text size="sm" fw={700} c={INK}>Progress</Text>
          <Text size="sm" fw={700} c={PRIMARY}>{answered} / {total}</Text>
        </Group>

        <Box style={{
          display: "flex", height: rem(8), borderRadius: rem(999),
          overflow: "hidden", backgroundColor: SURFACE, marginBottom: rem(10),
        }}>
          {correct > 0 && <Box style={{ width: `${pct(correct)}%`, backgroundColor: CORRECT_GREEN }} />}
          {wrong > 0 && <Box style={{ width: `${pct(wrong)}%`, backgroundColor: WRONG_RED }} />}
          {left > 0 && <Box style={{ width: `${pct(left)}%`, backgroundColor: "#CBD5E1" }} />}
        </Box>

        <Group gap="md">
          <Group gap={rem(5)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: CORRECT_GREEN, flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>{correct} correct</Text>
          </Group>
          <Group gap={rem(5)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: WRONG_RED, flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>{wrong} wrong</Text>
          </Group>
          <Group gap={rem(5)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>{left} left</Text>
          </Group>
        </Group>
      </Card>

      <Card p="lg">
        <Text size="sm" fw={700} c={INK} mb="md">Questions</Text>
        <SimpleGrid cols={4} spacing={rem(8)}>
          {questions.map((q) => (
            <Box key={q.question_id} style={cellStyle(q)}>{q.number}</Box>
          ))}
        </SimpleGrid>

        <SimpleGrid cols={2} spacing={rem(6)} mt="md">
          <Group gap={rem(6)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_CORRECT, flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>Correct</Text>
          </Group>
          <Group gap={rem(6)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_WRONG, flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>Wrong</Text>
          </Group>
          <Group gap={rem(6)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>Not answered</Text>
          </Group>
        </SimpleGrid>
      </Card>
    </>
  );
}
