"use client";

import { Box, Text } from "@mantine/core";
import { INK, PRIMARY, MUTED } from "@/constants/colors";

export function ChineseLabel({ zh, pinyin, term }: { zh?: string; pinyin?: string; term: string }) {
  if (!zh) {
    return <Text fw={700} size="lg" c={INK} style={{ lineHeight: 1.2 }}>{term}</Text>;
  }
  return (
    <Box>
      <Text fw={800} size="xl" c={INK} style={{ lineHeight: 1.1, letterSpacing: "-0.01em" }}>{zh}</Text>
      {pinyin && <Text size="xs" c={PRIMARY} fw={600} style={{ letterSpacing: "0.03em" }}>{pinyin}</Text>}
      <Text size="xs" c={MUTED} mt={1}>{term}</Text>
    </Box>
  );
}
