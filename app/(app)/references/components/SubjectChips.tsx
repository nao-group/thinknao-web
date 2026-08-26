"use client";

import { Group, UnstyledButton, rem } from "@mantine/core";

export const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Humanities Chinese", "STEM Chinese"] as const;
export type SubjectFilter = (typeof SUBJECTS)[number];

function SubjectChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <UnstyledButton
      className="ui-pill landing-filter-pill"
      data-active={active}
      onClick={onClick}
      style={{
        padding: `${rem(7)} ${rem(16)}`,
        borderRadius: rem(999),
        fontSize: rem(13),
        fontWeight: active ? 700 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </UnstyledButton>
  );
}

export function SubjectChips({
  value,
  onChange,
}: {
  value: SubjectFilter;
  onChange: (s: SubjectFilter) => void;
}) {
  return (
    <Group gap={6} wrap="nowrap">
      {SUBJECTS.map((s) => (
        <SubjectChip key={s} label={s} active={value === s} onClick={() => onChange(s)} />
      ))}
    </Group>
  );
}
