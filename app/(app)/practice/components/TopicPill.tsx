"use client";

import { UnstyledButton, rem } from "@mantine/core";

export function TopicPill({
  label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <UnstyledButton className="ui-pill landing-filter-pill" data-active={selected} onClick={onToggle} style={{
      padding: `${rem(7)} ${rem(16)}`, borderRadius: rem(999),
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      transition: "all 150ms ease",
      cursor: "pointer", whiteSpace: "nowrap",
    }}>
      {label}
    </UnstyledButton>
  );
}
