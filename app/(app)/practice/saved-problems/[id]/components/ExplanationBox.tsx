"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import { IconNotes } from "@tabler/icons-react";
import { PRIMARY } from "@/constants/colors";

export function ExplanationBox({ explanation, circleNums = false }: { explanation: string; circleNums?: boolean }) {
  return (
    <Box
      p="lg"
      style={{
        backgroundColor: "#FFF9EC",
        borderRadius: rem(10),
        borderLeft: `4px solid ${PRIMARY}`,
      }}
    >
      <Group gap={6} mb={8}>
        <IconNotes size={16} stroke={1.5} color={PRIMARY} />
        <Text size="sm" fw={700} c={PRIMARY}>Answer Key &amp; Explanation</Text>
      </Group>
      <MarkdownLatexText circleNums={circleNums}>{explanation}</MarkdownLatexText>
    </Box>
  );
}
