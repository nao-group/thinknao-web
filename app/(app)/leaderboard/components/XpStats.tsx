"use client";

import { useState } from "react";
import { Box, Group, Text, Tooltip, rem } from "@mantine/core";
import { INK, SURFACE, PRIMARY, CREAM, MUTED } from "@/constants/colors";
import type { MonthlyXp } from "../types";

// ─── XP Stats ─────────────────────────────────────────────────────────────────

export function XpStats({ yearlyXp, monthlyXp }: { yearlyXp: number; monthlyXp: MonthlyXp[] | undefined }) {
  if (!monthlyXp?.length) return null;
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const maxXp = Math.max(...monthlyXp.map((m) => m.xp), 1);
  const currentMonth = monthlyXp[monthlyXp.length - 1];

  return (
    <Box>
      {/* Summary row */}
      <Group gap={10} mb="md">
        <Box
          px="sm"
          py="xs"
          style={{
            flex: 1,
            backgroundColor: CREAM,
            borderRadius: rem(10),
            textAlign: "center",
          }}
        >
          <Text size="xs" fw={600} c={PRIMARY} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
            This Year
          </Text>
          <Text fw={800} size="md" c={PRIMARY}>{yearlyXp.toLocaleString()}</Text>
          <Text size="xs" c={PRIMARY} style={{ opacity: 0.7 }}>XP</Text>
        </Box>
        <Box
          px="sm"
          py="xs"
          style={{
            flex: 1,
            backgroundColor: SURFACE,
            borderRadius: rem(10),
            textAlign: "center",
          }}
        >
          <Text size="xs" fw={600} c={MUTED} tt="uppercase" style={{ letterSpacing: "0.06em" }}>
            {currentMonth.month}
          </Text>
          <Text fw={800} size="md" c={INK}>{currentMonth.xp.toLocaleString()}</Text>
          <Text size="xs" c={MUTED}>XP</Text>
        </Box>
      </Group>

      {/* Mini bar chart */}
      <Group gap={4} align="flex-end" style={{ height: rem(52) }}>
        {monthlyXp.map((m, i) => {
          const isLast = i === monthlyXp.length - 1;
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
                    height: `${(m.xp / maxXp) * 40}px`,
                    minHeight: rem(3),
                    backgroundColor: isHovered ? (isLast ? "#d4a017" : "#94A3B8") : isLast ? PRIMARY : "#E2E8F0",
                    borderRadius: `${rem(3)} ${rem(3)} 0 0`,
                    transform: isHovered ? "scaleY(1.12) scaleX(1.08)" : "scaleY(1) scaleX(1)",
                    transformOrigin: "bottom",
                    transition: "transform 150ms ease, background-color 150ms ease",
                  }}
                />
                <Text size="xs" c={isLast ? PRIMARY : MUTED} fw={isLast || isHovered ? 700 : 400} style={{ fontSize: rem(9) }}>
                  {m.month}
                </Text>
              </Box>
            </Tooltip>
          );
        })}
      </Group>
    </Box>
  );
}
