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
import { IconBookmarkFilled } from "@tabler/icons-react";
import type { Difficulty, SavedQuestion } from "../types";
import { INK, PRIMARY, CREAM } from "@/constants/colors";
import { SUBJECT_META } from "../../data";

export const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; color: string }> = {
  easy: { bg: "#DCFCE7", color: "#16A34A" },
  medium: { bg: CREAM, color: PRIMARY },
  hard: { bg: "#FEE2E2", color: "#DC2626" },
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function ProblemRow({
  problem,
  onRemove,
  onView,
}: {
  problem: SavedQuestion;
  onRemove: (id: string) => void;
  onView: (id: string) => void;
}) {
  const meta = SUBJECT_META[problem.subject_code ?? ""] ?? SUBJECT_META["MT"];
  const Icon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const date = new Date(problem.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box
      className="hover-zoom"
      onClick={() => onView(problem.question_id)}
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
          {problem.question_text}
        </Text>
        <Group gap={6} align="center">
          {problem.subject_name && (
            <Badge
              size="xs"
              radius="sm"
              style={{ backgroundColor: meta.iconBg, color: meta.iconColor, fontWeight: 600 }}
            >
              {problem.subject_name}
            </Badge>
          )}
          <Badge
            size="xs"
            radius="sm"
            style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}
          >
            {DIFFICULTY_LABEL[problem.difficulty]}
          </Badge>
          <Text size="xs" c="dimmed">
            · Saved {date}
          </Text>
        </Group>
      </Box>

      {/* Remove */}
      <Tooltip label="Remove bookmark" position="left" withArrow>
        <UnstyledButton
          onClick={(e) => { e.stopPropagation(); onRemove(problem.question_id); }}
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
