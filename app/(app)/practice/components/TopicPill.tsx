"use client";

import { UnstyledButton, rem } from "@mantine/core";
import { INK } from "@/constants/colors";

export function TopicPill({
  label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <UnstyledButton onClick={onToggle} style={{
      padding: `${rem(6)} ${rem(12)}`, borderRadius: rem(999),
      backgroundColor: selected ? INK : "white",
      border: `1.5px solid ${selected ? INK : "#CBD5E1"}`,
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      color: selected ? "white" : INK, transition: "all 150ms ease",
      cursor: "pointer", whiteSpace: "nowrap",
    }}>
      {label}
    </UnstyledButton>
  );
}
