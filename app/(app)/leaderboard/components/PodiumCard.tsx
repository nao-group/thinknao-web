"use client";

import { Avatar, Badge, Box, Stack, Text, rem } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { PRIMARY } from "@/constants/colors";
import { getInitials } from "@/lib/format";
import { avatarStyle, RANK_MEDAL } from "./avatarStyle";
import type { LeaderboardEntry } from "../types";

// ─── Sub-components ────────────────────────────────────────────────────────────

export function PodiumCard({ entry, height, onClick }: { entry: LeaderboardEntry; height: number; onClick: () => void }) {
  const medal = RANK_MEDAL[entry.rank];
  const av = avatarStyle(entry.rank - 1);
  const isFirst = entry.rank === 1;

  return (
    <Stack align="center" gap={0} className="hover-zoom" onClick={onClick} style={{ flex: 1, cursor: "pointer" }}>
      {/* Crown / medal */}
      {isFirst && (
        <Box mb={rem(6)}>
          <IconTrophy size={28} color={medal.color} />
        </Box>
      )}

      {/* Avatar */}
      <Box style={{ position: "relative" }}>
        <Avatar
          size={isFirst ? rem(72) : rem(56)}
          radius="xl"
          style={{ backgroundColor: av.bg, color: av.color, fontWeight: 700, fontSize: isFirst ? rem(22) : rem(16) }}
        >
          {getInitials(entry.full_name)}
        </Avatar>
        <Box
          style={{
            position: "absolute",
            bottom: rem(-6),
            right: rem(-6),
            width: rem(22),
            height: rem(22),
            borderRadius: "50%",
            backgroundColor: medal.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: rem(12),
            border: "2px solid white",
          }}
        >
          <Text style={{ fontSize: rem(10), lineHeight: 1 }}>{entry.rank}</Text>
        </Box>
      </Box>

      {/* Podium block */}
      <Box
        mt="sm"
        style={{
          width: "100%",
          height: rem(height),
          backgroundColor: isFirst ? PRIMARY : entry.rank === 2 ? "#9CA3AF" : "#CD7F32",
          borderRadius: `${rem(10)} ${rem(10)} 0 0`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `${rem(12)} ${rem(8)}`,
          gap: rem(4),
        }}
      >
        <Text fw={700} size={isFirst ? "sm" : "xs"} c="white" ta="center" lineClamp={1}>
          {entry.full_name}
        </Text>
        <Badge
          size="sm"
          radius="sm"
          style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white", fontWeight: 700, fontSize: rem(11) }}
        >
          {entry.total_xp.toLocaleString()} XP
        </Badge>
        {entry.province && (
          <Text size="xs" c="rgba(255,255,255,0.8)" ta="center" lineClamp={1}>
            {entry.province}
          </Text>
        )}
      </Box>
    </Stack>
  );
}
