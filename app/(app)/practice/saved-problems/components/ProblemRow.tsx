"use client";

import {
  Badge,
  Box,
  Group,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAtom,
  IconBook,
  IconBookmarkFilled,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
} from "@tabler/icons-react";
import { SAVED_PROBLEMS, type SubjectKey, type Difficulty } from "../data";
import { INK, PRIMARY, CREAM, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

export const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: "#DCFCE7", color: "#16A34A" },
  Medium: { bg: CREAM, color: PRIMARY },
  Hard: { bg: "#FEE2E2", color: "#DC2626" },
};

export const SUBJECT_META: Record<SubjectKey, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Mathematics: { icon: IconMathFunction, iconBg: CREAM, iconColor: PRIMARY },
  Physics: { icon: IconAtom, iconBg: "#EEF0FF", iconColor: INDIGO },
  Chemistry: { icon: IconFlask, iconBg: "#FDF0EC", iconColor: PANDA },
  "Liberal Arts Chinese": { icon: IconBook,        iconBg: "#F5F3FF", iconColor: VIOLET  },
  "Science Chinese":      { icon: IconMicroscope,  iconBg: "#ECFDF5", iconColor: EMERALD },
};

export function ProblemRow({
  problem,
  onRemove,
  onView,
}: {
  problem: (typeof SAVED_PROBLEMS)[number];
  onRemove: (id: string) => void;
  onView: (id: string) => void;
}) {
  const meta = SUBJECT_META[problem.subject];
  const Icon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const date = new Date(problem.dateAdded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box
      className="hover-zoom"
      onClick={() => onView(problem.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: rem(14),
        padding: `${rem(16)} 0`,
        borderBottom: "1px solid #F1F5F9",
        cursor: "pointer",
      }}
    >
      {/* Icon */}
      <Box
        style={{
          width: rem(40),
          height: rem(40),
          borderRadius: rem(10),
          backgroundColor: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: rem(2),
        }}
      >
        <Icon size={18} stroke={1.5} color={meta.iconColor} />
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          c={INK}
          fw={500}
          mb={8}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {problem.question}
        </Text>
        <Group gap={6} align="center">
          <Badge
            size="xs"
            radius="sm"
            style={{ backgroundColor: meta.iconBg, color: meta.iconColor, fontWeight: 600 }}
          >
            {problem.subject}
          </Badge>
          <Badge
            size="xs"
            radius="sm"
            style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}
          >
            {problem.difficulty}
          </Badge>
          <Text size="xs" c="dimmed">
            · Saved {date}
          </Text>
        </Group>
      </Box>

      {/* Remove */}
      <Tooltip label="Remove bookmark" position="left" withArrow>
        <UnstyledButton
          onClick={(e) => { e.stopPropagation(); onRemove(problem.id); }}
          style={{
            width: rem(32),
            height: rem(32),
            borderRadius: rem(8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
            flexShrink: 0,
          }}
        >
          <IconBookmarkFilled size={16} />
        </UnstyledButton>
      </Tooltip>
    </Box>
  );
}
