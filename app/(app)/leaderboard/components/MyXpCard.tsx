"use client";

import { useState } from "react";
import { Avatar, Box, Group, Skeleton, Stack, Text, Tooltip, rem } from "@mantine/core";
import { INK, PRIMARY, CREAM } from "@/constants/colors";
import { getInitials } from "@/lib/format";
import { avatarStyle, RANK_MEDAL } from "./avatarStyle";
import type { LeaderboardEntry } from "../types";

// ─── My XP Card ───────────────────────────────────────────────────────────────

export function MyXpCard({ entry, loading }: { entry: LeaderboardEntry | null; loading: boolean }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const av = entry ? avatarStyle((entry.rank - 1) % 5) : { bg: CREAM, color: PRIMARY };
  const medal = entry ? RANK_MEDAL[entry.rank] : null;

  return (
    <Box
      mb="xl"
      p="lg"
      style={{
        background: `linear-gradient(135deg, ${INK} 0%, #1E2A4A 60%, #252060 100%)`,
        borderRadius: rem(16),
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative rings */}
      {[{ size: 240, top: -80, right: -60, opacity: 0.07 }, { size: 160, top: -30, right: 80, opacity: 0.05 }].map((r, i) => (
        <Box key={i} style={{ position: "absolute", top: rem(r.top), right: rem(r.right), width: rem(r.size), height: rem(r.size), borderRadius: "50%", border: `1px solid rgba(255,255,255,${r.opacity})`, pointerEvents: "none" }} />
      ))}

      {loading ? (
        <Stack gap="sm">
          <Skeleton height={rem(20)} width="30%" />
          <Skeleton height={rem(32)} width="50%" />
          <Skeleton height={rem(60)} />
        </Stack>
      ) : entry ? (
        <>
          <Group justify="space-between" align="flex-start" mb="md">
            <Group gap={12} align="center">
              <Avatar
                size={rem(52)}
                radius="xl"
                style={{ backgroundColor: av.bg, color: av.color, fontWeight: 700, fontSize: rem(16), flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }}
              >
                {getInitials(entry.full_name)}
              </Avatar>
              <Box>
                <Text size="xs" c="rgba(255,255,255,0.5)" fw={600} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                  Your Standing
                </Text>
                <Group gap={6} align="center">
                  <Text fw={800} size="xl" c="white">#{entry.rank}</Text>
                  {medal && <Text style={{ fontSize: rem(16) }}>{medal.label}</Text>}
                </Group>
              </Box>
            </Group>
            <Box style={{ textAlign: "right" }}>
              <Text size="xs" c="rgba(255,255,255,0.5)" fw={600} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
                This Year
              </Text>
              <Text fw={800} size="lg" c={PRIMARY}>{(entry.yearly_xp ?? entry.total_xp).toLocaleString()} XP</Text>
            </Box>
          </Group>

          {/* Monthly mini bar chart — white bars on dark */}
          {entry.monthly_xp?.length ? (
            <Box>
              <Text size="xs" c="rgba(255,255,255,0.4)" fw={600} mb={6} style={{ letterSpacing: "0.06em" }}>
                MONTHLY XP · 2026
              </Text>
              <Group gap={4} align="flex-end" style={{ height: rem(44) }}>
                {entry.monthly_xp.map((m, i) => {
                  const maxXp = Math.max(...entry.monthly_xp!.map((x) => x.xp), 1);
                  const isLast = i === entry.monthly_xp!.length - 1;
                  const isHovered = hoveredBar === i;
                  return (
                    <Tooltip key={m.month} label={`${m.month}: ${m.xp.toLocaleString()} XP`} withArrow position="top" fz="xs">
                      <Box
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: rem(3), cursor: "default" }}
                      >
                        <Box
                          style={{
                            width: "100%",
                            height: `${(m.xp / maxXp) * 32}px`,
                            minHeight: rem(3),
                            backgroundColor: isHovered
                              ? (isLast ? "#d4a017" : "rgba(255,255,255,0.55)")
                              : isLast ? PRIMARY : "rgba(255,255,255,0.25)",
                            borderRadius: `${rem(3)} ${rem(3)} 0 0`,
                            transform: isHovered ? "scaleY(1.12) scaleX(1.08)" : "scaleY(1) scaleX(1)",
                            transformOrigin: "bottom",
                            transition: "transform 150ms ease, background-color 150ms ease",
                          }}
                        />
                        <Text style={{ fontSize: rem(9), color: isLast ? PRIMARY : "rgba(255,255,255,0.35)", fontWeight: isLast || isHovered ? 700 : 400 }}>
                          {m.month}
                        </Text>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Group>
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
