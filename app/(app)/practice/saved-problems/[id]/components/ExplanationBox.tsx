"use client";

import { Box, Group, Text } from "@mantine/core";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import { IconNotes } from "@tabler/icons-react";

export function ExplanationBox({ explanation, circleNums = false }: { explanation: string; circleNums?: boolean }) {
  return (
    <Box
      className="answer-explanation-panel"
    >
      <Group gap={8} mb={8}>
        <IconNotes size={17} stroke={1.5} color="#5F7D59" />
        <Text className="answer-explanation-header" size="sm" fw={700}>Answer Key &amp; Explanation</Text>
      </Group>
      <MarkdownLatexText circleNums={circleNums}>{explanation}</MarkdownLatexText>
    </Box>
  );
}
