"use client";

import type React from "react";
import { Badge, Box, Group, Text, rem } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { INK, MUTED, WRONG_RED } from "@/constants/colors";
import { formatClock } from "@/lib/format";

interface ExamTopBarProps {
  current: number;
  totalQ: number;
  subjectIcon: React.ElementType;
  iconBg: string;
  iconColor: string;
  qTopic: string;
  timeLeft: number;
  isLow: boolean;
  isCritical: boolean;
}

// ─── Sticky top bar (exam phase) ────────────────────────────────────────────────

export function ExamTopBar({
  current,
  totalQ,
  subjectIcon: SubjectIcon,
  iconBg,
  iconColor,
  qTopic,
  timeLeft,
  isLow,
  isCritical,
}: ExamTopBarProps) {
  return (
    <Box px={{ base: "md", sm: "xl" }} py="sm" style={{ backgroundColor: "white", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100 }}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap">
          <Text fw={700} size="sm" c={INK}>Q {current + 1}</Text>
          <Text size="sm" c="dimmed">/ {totalQ}</Text>
          <Box style={{ width: rem(20), height: rem(20), borderRadius: rem(5), backgroundColor: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SubjectIcon size={12} stroke={1.5} color={iconColor} />
          </Box>
          <Badge size="sm" radius="sm" style={{ backgroundColor: iconBg, color: iconColor, fontWeight: 600 }}>
            {qTopic}
          </Badge>
        </Group>
        <Group gap={6} wrap="nowrap">
          <IconClock size={15} stroke={1.5} color={isCritical ? WRONG_RED : isLow ? "#F59E0B" : MUTED} />
          <Text fw={700} size="sm" c={isCritical ? "red" : isLow ? "orange" : "dimmed"}>
            {formatClock(timeLeft)}
          </Text>
        </Group>
      </Group>
    </Box>
  );
}
