"use client";

import { Avatar, Badge, Box, Group, Text, rem } from "@mantine/core";
import { IconMapPin, IconSchool } from "@tabler/icons-react";
import { INK, SURFACE, PRIMARY, CREAM, MUTED } from "@/constants/colors";
import { getInitials } from "@/lib/format";
import { avatarStyle } from "./avatarStyle";
import type { LeaderboardEntry } from "../types";

export function RankRow({ entry, index, isMe, onClick }: { entry: LeaderboardEntry; index: number; isMe?: boolean; onClick: () => void }) {
  const av = avatarStyle(index);
  const isTop10 = entry.rank <= 10;

  return (
    <Box
      px={{ base: "md", sm: "xl" }}
      py="sm"
      className="hover-zoom"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(14),
        backgroundColor: isMe ? CREAM : "#FFFDF8",
        borderRadius: rem(12),
        border: isMe ? `2px solid ${PRIMARY}` : isTop10 ? `1.5px solid ${CREAM}` : "1.5px solid #F1F5F9",
        cursor: "pointer",
      }}
    >
      {/* Rank */}
      <Text
        fw={700}
        style={{
          width: rem(28),
          textAlign: "center",
          fontSize: rem(13),
          color: isMe ? PRIMARY : isTop10 ? PRIMARY : MUTED,
          flexShrink: 0,
        }}
      >
        {entry.rank}
      </Text>

      {/* Avatar */}
      <Avatar
        size={rem(40)}
        radius="xl"
        style={{ backgroundColor: av.bg, color: av.color, fontWeight: 700, fontSize: rem(14), flexShrink: 0 }}
      >
        {getInitials(entry.full_name)}
      </Avatar>

      {/* Name + details */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group gap={6} align="center" mb={rem(2)}>
          <Text fw={isMe ? 700 : 600} size="sm" c={INK} lineClamp={1}>
            {entry.full_name}
          </Text>
          {isMe && (
            <Badge size="xs" radius="sm" style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 700, flexShrink: 0 }}>
              You
            </Badge>
          )}
        </Group>
        <Group gap={rem(10)} wrap="nowrap">
          {entry.province && (
            <Group gap={rem(3)} wrap="nowrap" style={{ flexShrink: 0 }}>
              <IconMapPin size={11} color={MUTED} />
              <Text size="xs" c={MUTED} lineClamp={1}>{entry.province}</Text>
            </Group>
          )}
          {entry.dream_university && (
            <Group gap={rem(3)} wrap="nowrap" style={{ minWidth: 0 }}>
              <IconSchool size={11} color={MUTED} style={{ flexShrink: 0 }} />
              <Text size="xs" c={MUTED} lineClamp={1}>{entry.dream_university}</Text>
            </Group>
          )}
        </Group>
      </Box>

      {/* XP */}
      <Badge
        size="sm"
        radius="sm"
        style={{
          backgroundColor: isMe ? PRIMARY : isTop10 ? CREAM : SURFACE,
          color: isMe ? "white" : isTop10 ? PRIMARY : MUTED,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {entry.total_xp.toLocaleString()} XP
      </Badge>
    </Box>
  );
}
