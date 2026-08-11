"use client";

import { Box, Group, SimpleGrid, Text, UnstyledButton, rem } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { INK, CREAM, MUTED, PRIMARY } from "@/constants/colors";
import type { MockQ } from "../data";

interface QuestionNavigatorProps {
  questions: MockQ[];
  current: number;
  answers: Record<number, string>;
  onSelect: (index: number) => void;
}

// ─── Question navigator grid (exam phase sidebar) ──────────────────────────────

export function QuestionNavigator({ questions, current, answers, onSelect }: QuestionNavigatorProps) {
  return (
    <Card p="lg">
      <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: "0.06em" }}>Question Navigator</Text>
      <SimpleGrid cols={5} spacing={6}>
        {questions.map((eq, idx) => {
          const isCurr = idx === current;
          const isAns = !!answers[eq.id];
          return (
            <UnstyledButton
              key={eq.id}
              onClick={() => onSelect(idx)}
              style={{
                aspectRatio: "1", borderRadius: rem(6),
                border: `1.5px solid ${isCurr ? INK : isAns ? PRIMARY : "#E2E8F0"}`,
                backgroundColor: isCurr ? INK : isAns ? CREAM : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: rem(11), fontWeight: 600,
                color: isCurr ? "white" : isAns ? PRIMARY : MUTED,
              }}
            >
              {idx + 1}
            </UnstyledButton>
          );
        })}
      </SimpleGrid>
      <Group gap="lg" mt="md">
        <Group gap={4}><Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: CREAM, border: `1.5px solid ${PRIMARY}` }} /><Text size="xs" c="dimmed">Answered</Text></Group>
        <Group gap={4}><Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "white", border: "1.5px solid #E2E8F0" }} /><Text size="xs" c="dimmed">Skipped</Text></Group>
      </Group>
    </Card>
  );
}
