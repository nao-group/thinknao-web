"use client";

import { Box, Group, Stack, Text, rem } from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { INK, PRIMARY } from "@/constants/colors";
import type { Subject } from "../data";
import type { FlashcardItem } from "./flashcard-types";
import type { SUBJECT_META } from "./subject-meta";

export function FlashcardFace({
  card,
  meta,
  Icon,
  side,
}: {
  card: FlashcardItem;
  meta: (typeof SUBJECT_META)[Subject];
  Icon: React.ElementType;
  side: "front" | "back";
}) {
  if (side === "front") {
    return (
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundColor: "white",
          borderRadius: rem(18),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: rem(32),
          gap: rem(12),
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <Group gap={6}>
          <Box
            style={{
              width: rem(24),
              height: rem(24),
              borderRadius: rem(6),
              backgroundColor: meta.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={13} stroke={1.5} color={meta.iconColor} />
          </Box>
          <Text size="xs" fw={600} c={meta.iconColor}>{card.subject}</Text>
        </Group>

        {card.hanzi && (
          <Text fw={800} style={{ fontSize: rem(40), lineHeight: 1.1, letterSpacing: "-0.02em" }} c={INK} ta="center">
            {card.hanzi}
          </Text>
        )}

        <Text fw={800} size="xl" c={INK} ta="center" lh={1.3}>
          {card.front}
        </Text>

        <Text size="xs" c="dimmed" mt={8}>Click to reveal →</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        backgroundColor: INK,
        borderRadius: rem(18),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(32),
        gap: rem(10),
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflowY: "auto",
      }}
    >
      {card.pinyin && (
        <Text fw={800} size="lg" c={PRIMARY} ta="center" mb={2} style={{ letterSpacing: "0.03em" }}>
          {card.pinyin}
        </Text>
      )}

      <Text fw={600} size="sm" c={PRIMARY} ta="center" lh={1.55}>
        <LatexText>{card.back}</LatexText>
      </Text>

      {card.detail && (
        <Box
          px="md"
          py="xs"
          mt={4}
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: rem(10),
            width: "100%",
          }}
        >
          <Text size="xs" c="rgba(255,255,255,0.6)" ta="center" style={{ fontStyle: "italic" }}>
            {card.detail}
          </Text>
        </Box>
      )}

      {card.extra && card.extra.length > 0 && (
        <Stack gap={3} mt={4} style={{ width: "100%" }}>
          {card.extra.map((v, i) => (
            <Text key={i} size="xs" c="rgba(255,255,255,0.45)" ta="center">{v}</Text>
          ))}
        </Stack>
      )}
    </Box>
  );
}
