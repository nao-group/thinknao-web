"use client";

import { Box, rem } from "@mantine/core";
import { FlashcardFace } from "./FlashcardFace";
import { SUBJECT_META } from "./subject-meta";
import type { FlashcardItem } from "./flashcard-types";

export function FlipCard({
  card,
  interactive,
  flipped,
  onFlip,
}: {
  card: FlashcardItem;
  interactive: boolean;
  flipped: boolean;
  onFlip: () => void;
}) {
  const meta = SUBJECT_META[card.subject];
  const Icon = meta.icon;
  return (
    <Box
      onClick={interactive ? onFlip : undefined}
      style={{ perspective: "1200px", width: "100%", height: rem(300), cursor: interactive ? "pointer" : "default" }}
    >
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s ease",
          transform: interactive && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <FlashcardFace card={card} meta={meta} Icon={Icon} side="front" />
        <FlashcardFace card={card} meta={meta} Icon={Icon} side="back" />
      </Box>
    </Box>
  );
}
