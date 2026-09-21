"use client";

import { Box, Text, UnstyledButton, rem } from "@mantine/core";
import { INK, PRIMARY, CREAM } from "@/constants/colors";
import type { SUBJECTS } from "../data";

export function SubjectCard({
  subject,
  selected,
  onSelect,
}: {
  subject: (typeof SUBJECTS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = subject.icon;
  return (
    <UnstyledButton
      onClick={onSelect}
      aria-label={`Choose ${subject.label}`}
      aria-pressed={selected}
      className="landing-filter-card"
      data-active={selected}
      style={{
        width: "100%", minHeight: rem(80), height: "100%", padding: `${rem(14)} ${rem(16)}`,
        borderRadius: rem(12),
        border: `2px solid ${selected ? PRIMARY : "#E2E8F0"}`,
        backgroundColor: selected ? CREAM : "#FFFDF8",
        display: "flex", flexDirection: "row", alignItems: "center",
        gap: rem(14), transition: "border-color 150ms ease, background-color 150ms ease",
        cursor: "pointer",
      }}
    >
      <Box style={{
        width: rem(48), height: rem(48), borderRadius: rem(12), flexShrink: 0,
        backgroundColor: subject.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} stroke={1.5} color={subject.iconColor} />
      </Box>
      <Text size="sm" fw={selected ? 700 : 500} c={selected ? PRIMARY : INK}
        style={{ transition: "color 150ms ease", textAlign: "left", lineHeight: 1.35 }}>
        {subject.label}
      </Text>
    </UnstyledButton>
  );
}
