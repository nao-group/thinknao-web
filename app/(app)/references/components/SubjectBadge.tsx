"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import type { Subject } from "../types";
import { SUBJECT_META } from "./subject-meta";

export function SubjectBadge({ subject }: { subject: Subject }) {
  const meta = SUBJECT_META[subject];
  const Icon = meta.icon;
  return (
    <Group gap={5} style={{ flexShrink: 0 }}>
      <Box
        style={{
          width: rem(20),
          height: rem(20),
          borderRadius: rem(5),
          backgroundColor: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={11} stroke={1.5} color={meta.iconColor} />
      </Box>
      <Text size="xs" fw={600} c={meta.iconColor}>{subject}</Text>
    </Group>
  );
}
