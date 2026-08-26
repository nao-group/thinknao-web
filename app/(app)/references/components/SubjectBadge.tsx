"use client";

import { Box, Group, Text, rem } from "@mantine/core";
import type { Subject } from "../types";
import { SUBJECT_META } from "./subject-meta";

export function SubjectBadge({ subject }: { subject: Subject }) {
  const meta = SUBJECT_META[subject];
  const Icon = meta.icon;
  return (
    <Group
      className="ui-pill reference-subject-badge"
      gap={4}
      wrap="nowrap"
      style={{
        flexShrink: 0,
        backgroundColor: meta.iconBg,
        borderColor: `${meta.iconColor}26`,
        color: meta.iconColor,
      }}
    >
      <Box
        style={{
          width: rem(16),
          height: rem(16),
          borderRadius: rem(4),
          backgroundColor: "rgba(255,255,255,0.58)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={9} stroke={1.7} color={meta.iconColor} />
      </Box>
      <Text fz={11} lh={1} fw={650} c={meta.iconColor} style={{ whiteSpace: "nowrap" }}>{subject}</Text>
    </Group>
  );
}
