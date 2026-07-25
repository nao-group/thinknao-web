"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  rem,
} from "@mantine/core";
import {
  IconChevronRight,
  IconClock,
  IconFlask,
  IconMathFunction,
  IconAtom,
  IconStar,
} from "@tabler/icons-react";
import Link from "next/link";
import { AnnouncementCarousel } from "@/components/announcement-carousel";

import { INK, SURFACE, PRIMARY, CREAM, INDIGO, PANDA } from "@/constants/colors";

// ─── Sub-components ────────────────────────────────────────────────────────────



const PROBLEM_SETS = [
  {
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    label: "Mathematics 1",
    meta: "40 questions",
    added: "Created Jul 20",
  },
  {
    icon: IconAtom,
    iconBg: "#EEF0FF",
    iconColor: INDIGO,
    label: "Physics 2",
    meta: "35 questions",
    added: "Created Jul 21",
  },
  {
    icon: IconFlask,
    iconBg: "#FDF0EC",
    iconColor: PANDA,
    label: "Chemistry 3",
    meta: "30 questions",
    added: "Created Jul 21",
  },
];

function ProblemSetCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  meta,
  added,
}: (typeof PROBLEM_SETS)[0]) {
  return (
    <Box
      p="lg"
      className="hover-zoom"
      style={{
        backgroundColor: "white",
        borderRadius: rem(14),
        display: "flex",
        flexDirection: "column",
        gap: rem(12),
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Box
          style={{
            width: rem(40),
            height: rem(40),
            borderRadius: rem(10),
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} stroke={1.5} color={iconColor} />
        </Box>
      </Group>

      <Box style={{ flex: 1 }}>
        <Text fw={700} size="sm" c={INK} mb={4}>
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {meta}
        </Text>
      </Box>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {added}
        </Text>
        <Button
          size="xs"
          radius="sm"
          style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
        >
          Start
        </Button>
      </Group>
    </Box>
  );
}

const IN_PROGRESS = [
  {
    label: "Mathematics 1",
    done: 17,
    total: 25,
    pct: 68,
    color: INK,
  },
  {
    label: "Chemistry 3",
    done: 10,
    total: 30,
    pct: 32,
    color: INDIGO,
  },
];

function InProgressItem({ label, done, total, pct, color }: (typeof IN_PROGRESS)[0]) {
  return (
    <Box
      p="md"
      className="hover-zoom"
      style={{
        backgroundColor: "white",
        borderRadius: rem(14),
        display: "flex",
        alignItems: "center",
        gap: rem(16),
      }}
    >
      <Box
        style={{
          width: rem(40),
          height: rem(40),
          borderRadius: rem(10),
          backgroundColor: SURFACE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <IconClock size={18} stroke={1.5} color="#667080" />
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" mb={6}>
          <Text size="sm" fw={600} c={INK} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </Text>
          <Text size="sm" fw={700} c={color} style={{ flexShrink: 0 }}>
            {pct}%
          </Text>
        </Group>
        <Progress value={pct} size="sm" radius="xl" color={color === INK ? "dark" : "indigo"} mb={6} />
        <Text size="xs" c="dimmed">
          {done} of {total} questions done
        </Text>
      </Box>

      <Button
        size="xs"
        variant="default"
        radius="sm"
        style={{ flexShrink: 0 }}
      >
        Continue
      </Button>
    </Box>
  );
}

const WEEK = [
  { day: "Mon", pct: 18, xp: 45 },
  { day: "Tue", pct: 72, xp: 180 },
  { day: "Wed", pct: 58, xp: 145 },
  { day: "Thu", pct: 48, xp: 120 },
  { day: "Fri", pct: 65, xp: 162 },
  { day: "Sat", pct: 12, xp: 30 },
  { day: "Sun", pct: 80, xp: 200, current: true },
];

function LearningActivity() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  return (
    <Box
      p="lg"
      style={{ backgroundColor: "white", borderRadius: rem(14), height: "100%" }}
    >
      <Text
        size="xs"
        fw={700}
        tt="uppercase"
        style={{ letterSpacing: "0.06em" }}
        c="dimmed"
        mb={16}
      >
        Learning Activity
      </Text>

      {/* Stats */}
      <SimpleGrid cols={3} mb={24}>
        {[
          { value: "7", label: "Day Streak", color: PRIMARY },
          { value: "1", label: "Rank", color: INK },
          { value: "100", label: "Monthly XP", color: INK },
        ].map(({ value, label, color }) => (
          <Box key={label} ta="center">
            <Text fw={800} style={{ fontSize: rem(22), color }}>
              {value}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Bar chart */}
      <Text size="xs" c="dimmed" mb={12}>
        This week
      </Text>
      <Box style={{ overflowX: "auto", marginInline: rem(-4) }}>
        <Group align="flex-end" justify="space-between" wrap="nowrap" style={{ height: rem(80), minWidth: rem(200), paddingInline: rem(2), gap: rem(6) }}>
          {WEEK.map(({ day, pct, xp, current }, i) => {
            const isHovered = hoveredBar === i;
            return (
              <Tooltip key={i} label={`${day}: ${xp} XP`} withArrow position="top" fz="xs">
                <Stack
                  align="center"
                  gap={2}
                  style={{ flex: 1, minWidth: rem(24), cursor: "default" }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <Box
                    style={{
                      width: rem(20),
                      height: rem(Math.max(4, (pct / 100) * 64)),
                      borderRadius: rem(4),
                      backgroundColor: isHovered ? (current ? "#374151" : "#94A3B8") : current ? INK : "#E2E8F0",
                      transform: isHovered ? "scaleY(1.12) scaleX(1.08)" : "scaleY(1) scaleX(1)",
                      transformOrigin: "bottom",
                      transition: "transform 150ms ease, background-color 150ms ease",
                    }}
                  />
                  <Text size="xs" fw={current || isHovered ? 700 : 400} c={current ? INK : isHovered ? "#475569" : "dimmed"}>
                    {day}
                  </Text>
                </Stack>
              </Tooltip>
            );
          })}
        </Group>
      </Box>
    </Box>
  );
}

function UnlockCard() {
  return (
    <Box p="md" style={{ borderRadius: rem(14), backgroundColor: INK }}>
      <Box
        mb={10}
        style={{
          width: rem(32),
          height: rem(32),
          borderRadius: rem(8),
          backgroundColor: "rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconStar size={16} stroke={1.5} color="white" />
      </Box>
      <Text fw={700} size="sm" c="white" mb={4}>
        Unlock Full Access
      </Text>
      <Text size="xs" c="rgba(255,255,255,0.55)" mb={12} lh={1.5}>
        Get unlimited practice sets & mock exams for your CSCA prep.
      </Text>
      <Button
        fullWidth
        size="xs"
        style={{
          backgroundColor: "rgba(255,255,255,0.15)",
          color: "white",
          fontWeight: 600,
          borderRadius: rem(8),
        }}
      >
        Subscribe Now
      </Button>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* Main column */}
          <Stack style={{ flex: 1, minWidth: 0 }}>
            {/* Announcements */}
            <Box>
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb={12}>
                Announcements
              </Text>
              <AnnouncementCarousel />
            </Box>

            {/* New Problem Sets */}
            <Box>
              <Group justify="space-between" mb={12}>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
                  Your Last Practice Sets
                </Text>
                <Link href="/practice" style={{ display: "flex", alignItems: "center", gap: rem(4), color: PRIMARY, fontWeight: 600, fontSize: rem(13), textDecoration: "none" }}>
                  View all <IconChevronRight size={14} />
                </Link>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {PROBLEM_SETS.map((ps) => (
                  <ProblemSetCard key={ps.label} {...ps} />
                ))}
              </SimpleGrid>
            </Box>

            {/* In Progress */}
            <Box>
              <Group justify="space-between" mb={12}>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
                  In Progress
                </Text>
                <Link href="/practice" style={{ display: "flex", alignItems: "center", gap: rem(4), color: PRIMARY, fontWeight: 600, fontSize: rem(13), textDecoration: "none" }}>
                  View all <IconChevronRight size={14} />
                </Link>
              </Group>
              <Stack gap="sm">
                {IN_PROGRESS.map((item) => (
                  <InProgressItem key={item.label} {...item} />
                ))}
              </Stack>
            </Box>
          </Stack>

          {/* Right panel */}
          <Box visibleFrom="lg" style={{ width: rem(280), flexShrink: 0 }}>
            <Stack gap="md">
              <LearningActivity />
              <UnlockCard />
            </Stack>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
