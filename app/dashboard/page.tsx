"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  rem,
} from "@mantine/core";
import { Card } from "@/components/ui/card";
import {
  IconAtom,
  IconBook,
  IconChevronRight,
  IconClock,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnnouncementCarousel } from "@/components/announcement-carousel";
import api from "@/lib/api";

import { INK, SURFACE, PRIMARY, CREAM, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Session {
  id: string;
  name: string;
  status: "in_progress" | "completed";
  type: string;
  subject_code: string;
  subject_name: string;
  topic_name: string | null;
  topic_code: string | null;
  created_at: string;
}

interface SessionProgress {
  answered_count: number;
  total_count: number;
}

// ─── Subject meta ──────────────────────────────────────────────────────────────

const SUBJECT_META: Record<string, {
  icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
}> = {
  MT: { icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY },
  PH: { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  CM: { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
  WH: { icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET  },
  LH: { icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD },
};

const PROGRESS_COLORS = [INK, INDIGO, PANDA, VIOLET, EMERALD];

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProblemSetCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const meta = SUBJECT_META[session.subject_code] ?? SUBJECT_META["MT"];
  const Icon = meta.icon;
  const date = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      p="lg"
      className="hover-zoom"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: rem(12),
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <Box
        style={{
          width: rem(40),
          height: rem(40),
          borderRadius: rem(10),
          backgroundColor: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={20} stroke={1.5} color={meta.iconColor} />
      </Box>

      <Box style={{ flex: 1 }}>
        <Text fw={700} size="sm" c={INK} mb={4}>
          {session.name}
        </Text>
        <Text size="xs" c="dimmed">
          {session.topic_name ?? session.subject_name}
        </Text>
      </Box>

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          Created {date}
        </Text>
        <Button
          size="xs"
          radius="sm"
          style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {session.status === "in_progress" ? "Continue" : "Review"}
        </Button>
      </Group>
    </Card>
  );
}

function ProblemSetSkeleton() {
  return (
    <Card p="lg" style={{ display: "flex", flexDirection: "column", gap: rem(12) }}>
      <Skeleton height={40} width={40} radius={10} />
      <Box style={{ flex: 1 }}>
        <Skeleton height={14} width="70%" mb={6} radius="sm" />
        <Skeleton height={11} width="50%" radius="sm" />
      </Box>
      <Group justify="space-between" align="center">
        <Skeleton height={11} width={70} radius="sm" />
        <Skeleton height={26} width={60} radius="sm" />
      </Group>
    </Card>
  );
}

function InProgressItem({
  session,
  progress,
  color,
  onClick,
}: {
  session: Session;
  progress: SessionProgress | undefined;
  color: string;
  onClick: () => void;
}) {
  const answered = progress?.answered_count ?? 0;
  const total = progress?.total_count ?? 0;
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <Card
      p="md"
      className="hover-zoom"
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(16),
        cursor: "pointer",
      }}
      onClick={onClick}
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
            {session.name}
          </Text>
          <Text size="sm" fw={700} c={color} style={{ flexShrink: 0 }}>
            {progress ? `${pct}%` : "—"}
          </Text>
        </Group>
        <Progress
          value={pct}
          size="sm"
          radius="xl"
          color={color === INK ? "dark" : color === INDIGO ? "indigo" : color === PANDA ? "orange" : color === VIOLET ? "violet" : "teal"}
          mb={6}
        />
        <Text size="xs" c="dimmed">
          {progress ? `${answered} of ${total} questions done` : "Loading progress…"}
        </Text>
      </Box>

      <Button
        size="xs"
        variant="default"
        radius="sm"
        style={{ flexShrink: 0 }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Continue
      </Button>
    </Card>
  );
}

function InProgressSkeleton() {
  return (
    <Card p="md" style={{ display: "flex", alignItems: "center", gap: rem(16) }}>
      <Skeleton height={40} width={40} radius={10} style={{ flexShrink: 0 }} />
      <Box style={{ flex: 1 }}>
        <Group justify="space-between" mb={6}>
          <Skeleton height={14} width="50%" radius="sm" />
          <Skeleton height={14} width={32} radius="sm" />
        </Group>
        <Skeleton height={8} radius="xl" mb={6} />
        <Skeleton height={11} width={140} radius="sm" />
      </Box>
      <Skeleton height={28} width={70} radius="sm" style={{ flexShrink: 0 }} />
    </Card>
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
    <Card
      p="lg"
      style={{ height: "100%" }}
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
    </Card>
  );
}

function SubscriptionCard() {
  return (
    <Box p="lg" style={{ backgroundColor: INK, borderRadius: rem(14) }}>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="sm" c="white">Subscription</Text>
        <Box
          px={8}
          py={2}
          style={{
            backgroundColor: PRIMARY,
            borderRadius: rem(4),
            fontSize: rem(11),
            fontWeight: 700,
            color: "white",
            letterSpacing: "0.04em",
          }}
        >
          PRO
        </Box>
      </Group>
      <Stack gap={8} mb="md">
        <Group justify="space-between">
          <Text size="xs" c="rgba(255,255,255,0.5)">Status</Text>
          <Group gap={5}>
            <Box style={{ width: rem(7), height: rem(7), borderRadius: "50%", backgroundColor: "#22C55E" }} />
            <Text size="xs" fw={600} c="#22C55E">Active</Text>
          </Group>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="rgba(255,255,255,0.5)">Expires</Text>
          <Text size="xs" fw={600} c="white">Aug 13, 2026</Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="rgba(255,255,255,0.5)">Days remaining</Text>
          <Text size="xs" fw={700} c={PRIMARY}>23 days</Text>
        </Group>
      </Stack>
      <Button
        fullWidth
        size="sm"
        style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600, borderRadius: rem(8) }}
      >
        Manage Subscription
      </Button>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [inProgressSessions, setInProgressSessions] = useState<Session[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, SessionProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [recentRes, inProgressRes] = await Promise.all([
          api.get<{ sessions: Session[] }>("/api/sessions", {
            params: { type: "practice", page_size: 3 },
          }),
          api.get<{ sessions: Session[] }>("/api/sessions", {
            params: { type: "practice", status: "in_progress", page_size: 3 },
          }),
        ]);

        const recent = recentRes.data.sessions ?? [];
        const inProgress = inProgressRes.data.sessions ?? [];

        setRecentSessions(recent);
        setInProgressSessions(inProgress);

        if (inProgress.length > 0) {
          const progressResults = await Promise.all(
            inProgress.map((s) =>
              api
                .get<{ answered_count: number; total_count: number }>(
                  `/api/sessions/${s.id}/questions`
                )
                .then((r) => ({
                  id: s.id,
                  answered_count: r.data.answered_count ?? 0,
                  total_count: r.data.total_count ?? 0,
                }))
                .catch(() => ({ id: s.id, answered_count: 0, total_count: 0 }))
            )
          );
          const map: Record<string, SessionProgress> = {};
          for (const r of progressResults) {
            map[r.id] = { answered_count: r.answered_count, total_count: r.total_count };
          }
          setProgressMap(map);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function navigateToSession(session: Session) {
    if (session.status === "in_progress") {
      router.push(`/practice/${session.id}?topic=${encodeURIComponent(session.topic_name ?? session.subject_name)}&name=${encodeURIComponent(session.name)}`);
    } else {
      router.push(`/practice/${session.id}?review=true&name=${encodeURIComponent(session.name)}`);
    }
  }

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

            {/* Your Last Practice Sets */}
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
                {loading ? (
                  <>
                    <ProblemSetSkeleton />
                    <ProblemSetSkeleton />
                    <ProblemSetSkeleton />
                  </>
                ) : recentSessions.length > 0 ? (
                  recentSessions.map((s) => (
                    <ProblemSetCard key={s.id} session={s} onClick={() => navigateToSession(s)} />
                  ))
                ) : (
                  <Text size="sm" c="dimmed">No practice sets yet.</Text>
                )}
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
                {loading ? (
                  <>
                    <InProgressSkeleton />
                    <InProgressSkeleton />
                  </>
                ) : inProgressSessions.length > 0 ? (
                  inProgressSessions.map((s, i) => (
                    <InProgressItem
                      key={s.id}
                      session={s}
                      progress={progressMap[s.id]}
                      color={PROGRESS_COLORS[i % PROGRESS_COLORS.length]}
                      onClick={() => navigateToSession(s)}
                    />
                  ))
                ) : (
                  <Text size="sm" c="dimmed">No sessions in progress.</Text>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Right panel */}
          <Box visibleFrom="lg" style={{ width: rem(280), flexShrink: 0 }}>
            <Stack gap="md">
              <LearningActivity />
              <SubscriptionCard />
            </Stack>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
