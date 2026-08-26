"use client";

import { UnstyledButton, rem } from "@mantine/core";

export function QuestionCountPill({
  value, selected, onSelect,
}: { value: number | string; selected: boolean; onSelect: () => void }) {
  return (
    <UnstyledButton className="ui-pill landing-filter-pill" data-active={selected} onClick={onSelect} style={{
      padding: `${rem(7)} ${rem(18)}`, borderRadius: rem(999),
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      transition: "all 150ms ease", cursor: "pointer",
    }}>
      {value}
    </UnstyledButton>
  );
}
