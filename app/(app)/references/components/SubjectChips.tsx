"use client";

import { useState } from "react";
import { Group, UnstyledButton, rem } from "@mantine/core";
import { INK, MUTED } from "@/constants/colors";

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
  const [hovered, setHovered] = useState(false);
  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${rem(5)} ${rem(13)}`,
        borderRadius: rem(999),
        backgroundColor: active ? INK : hovered ? "#F8FAFC" : "white",
        color: active ? "white" : hovered ? INK : MUTED,
        border: `1.5px solid ${active ? INK : hovered ? "#94A3B8" : "#E2E8F0"}`,
        fontSize: rem(13),
        fontWeight: active ? 600 : hovered ? 500 : 400,
        whiteSpace: "nowrap",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered && !active ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        transition: "all 150ms ease",
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
