"use client";

import { useState } from "react";
import { Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconArrowsShuffle } from "@tabler/icons-react";
import { GalleryShell } from "./GalleryShell";
import { FlipCard } from "./FlipCard";
import type { FlashcardItem } from "./flashcard-types";

export function FlashcardStudy({
  items,
  onClose,
}: {
  items: FlashcardItem[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState(items);

  function goTo(i: number) {
    setFlipped(false);
    setIndex(i);
  }

  function handleShuffle() {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  function renderSlot(slot: "prev" | "current" | "next") {
    const i = slot === "prev" ? index - 1 : slot === "next" ? index + 1 : index;
    const card = deck[i];
    if (!card) return null;
    return <FlipCard card={card} interactive={slot === "current"} flipped={flipped} onFlip={() => setFlipped((v) => !v)} />;
  }

  return (
    <GalleryShell
      opened
      onClose={onClose}
      count={deck.length}
      idx={index}
      hasPrev={index > 0}
      hasNext={index < deck.length - 1}
      onPrev={() => goTo(index - 1)}
      onNext={() => goTo(index + 1)}
      renderSlot={renderSlot}
      progress={((index + 1) / deck.length) * 100}
      activeScale={1}
      bareSlots
      headerExtra={
        <Tooltip label="Shuffle deck" withArrow>
          <UnstyledButton
            onClick={handleShuffle}
            style={{
              width: rem(32),
              height: rem(32),
              borderRadius: rem(8),
              backgroundColor: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconArrowsShuffle size={16} stroke={1.5} color="rgba(255,255,255,0.8)" />
          </UnstyledButton>
        </Tooltip>
      }
    />
  );
}
