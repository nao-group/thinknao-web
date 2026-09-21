"use client";

import { UnstyledButton, rem } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

export function TopicPill({
  label, selected, onToggle, locked,
}: { label: string; selected: boolean; onToggle: () => void; locked?: boolean }) {
  return (
    <UnstyledButton
      role="tab"
      aria-selected={selected}
      className="ui-pill landing-filter-pill"
      data-active={selected}
      onClick={onToggle}
      style={{
        padding: `${rem(7)} ${rem(16)}`, borderRadius: rem(999),
        fontSize: rem(13), fontWeight: selected ? 600 : 400,
        transition: "all 150ms ease",
        cursor: "pointer", whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: rem(6),
        opacity: locked ? 0.55 : 1,
      }}
    >
      {locked && <IconLock size={12} stroke={2} />}
      {label}
    </UnstyledButton>
  );
}
