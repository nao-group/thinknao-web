"use client";

import { UnstyledButton, rem } from "@mantine/core";
import { INK } from "@/constants/colors";

export function QuestionCountPill({
  value, selected, onSelect,
}: { value: number | string; selected: boolean; onSelect: () => void }) {
  return (
    <UnstyledButton onClick={onSelect} style={{
      padding: `${rem(6)} ${rem(16)}`, borderRadius: rem(999),
      backgroundColor: selected ? INK : "transparent",
      border: `1px solid ${selected ? INK : "#CBD5E1"}`,
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      color: selected ? "white" : INK, transition: "all 150ms ease", cursor: "pointer",
    }}>
      {value}
    </UnstyledButton>
  );
}
