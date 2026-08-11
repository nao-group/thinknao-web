"use client";

import { Box, Group, Stack, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import { IconNotes } from "@tabler/icons-react";
import { SAVED_PROBLEMS } from "../../data";
import { INK, PRIMARY, CORRECT_DARK } from "@/constants/colors";

export function ExplanationBox({ explanation }: { explanation: (typeof SAVED_PROBLEMS)[number]["explanation"] }) {
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

      {explanation.markdown ? (
        <MarkdownLatexText>{explanation.markdown}</MarkdownLatexText>
      ) : (
        <>
          <Text size="md" fw={700} c={CORRECT_DARK} mb={8}>
            Correct Answer: {explanation.correctStatement}
          </Text>
          <Text size="md" c={INK} mb={10}><LatexText>{explanation.intro}</LatexText></Text>
          <Stack gap={4} mb={12}>
            {explanation.steps.map((step, i) => (
              <Group key={i} gap={8} align="flex-start">
                <Box
                  style={{ width: rem(6), height: rem(6), borderRadius: "50%", backgroundColor: PRIMARY, flexShrink: 0, marginTop: rem(9) }}
                />
                <Text size="md" c={INK}><LatexText>{step}</LatexText></Text>
              </Group>
            ))}
          </Stack>
          <Box p="sm" style={{ backgroundColor: "#F5E6CC", borderRadius: rem(8) }}>
            <Text size="md" fw={700} c={CORRECT_DARK}><LatexText>{explanation.conclusion}</LatexText></Text>
          </Box>
        </>
      )}
    </Box>
  );
}
