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
import { LandingActionButton } from "@/components/ui/landing-action-button";
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

import { INK, SURFACE, PRIMARY, CREAM, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";
import type { Session, SessionProgress, LearningActivity as LearningActivityData } from "./types";
import { fetchRecentSessions, fetchInProgressSessions, fetchSessionProgress, fetchLearningActivity } from "./api";
import styles from "./dashboard.module.css";

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
      className={styles.practiceCard}
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
        <Text className={styles.cardTitle} fw={700} size="sm" c={INK} mb={4}>
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
        <LandingActionButton
          size="xs"
          rightSection={<IconChevronRight size={14} stroke={2.2} />}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {session.status === "in_progress" ? "Continue" : "Review"}
        </LandingActionButton>
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
      className={styles.progressCard}
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
          <Text className={styles.cardTitle} size="sm" fw={600} c={INK} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

      <LandingActionButton
        size="xs"
        rightSection={<IconChevronRight size={14} stroke={2.2} />}
        style={{ flexShrink: 0 }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Continue
      </LandingActionButton>
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

function LearningActivity() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [activity, setActivity] = useState<LearningActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningActivity()
      .then(setActivity)
      .catch((err) => console.error("Failed to load learning activity:", err))
      .finally(() => setLoading(false));
  }, []);

  const week = activity?.week ?? [];
  // Bars are scaled against the week's own best day, so a quiet week still
  // reads clearly instead of flatlining against some fixed ceiling.
  const peakXp = Math.max(...week.map((d) => d.xp), 0);

  /** "—" while loading or when the student isn't ranked yet — better than a
   *  confident-looking 0 that means something different. */
  const stat = (value: number | null | undefined, prefix = "") =>
    loading ? "…" : value == null ? "—" : `${prefix}${value}`;

  return (
    <Card
      p="lg"
      className={styles.activityCard}
      style={{ height: "100%" }}
    >
      <Text
        className={styles.sectionTitle}
        size="xs"
        fw={700}
        c="dimmed"
        mb={16}
      >
        Learning Activity
      </Text>

      <SimpleGrid cols={3} mb={24}>
        {[
          {
            value: loading ? "…" : String(activity?.day_streak ?? 0),
            label: "Day Streak",
            color: PRIMARY,
            tip: "Consecutive days you've answered at least one question",
          },
          {
            value: stat(activity?.rank, "#"),
            label: "Rank",
            color: INK,
            tip: `XP over the past 12 months${activity ? ` · ${activity.year_xp} XP` : ""}`,
          },
          {
            value: stat(activity?.monthly_rank, "#"),
            label: "Monthly Rank",
            color: INK,
            tip: `XP this month${activity ? ` · ${activity.month_xp} XP` : ""}`,
          },
        ].map(({ value, label, color, tip }) => (
          <Tooltip key={label} label={tip} withArrow position="top" fz="xs" multiline w={200}>
            <Box ta="center" style={{ cursor: "default" }}>
              <Text fw={800} style={{ fontSize: rem(22), color }}>
                {value}
              </Text>
              <Text size="xs" c="dimmed" lh={1.3}>
                {label}
              </Text>
            </Box>
          </Tooltip>
        ))}
      </SimpleGrid>

      <Text size="xs" c="dimmed" mb={12}>
        This week
      </Text>
      <Box style={{ overflowX: "auto", marginInline: rem(-4) }}>
        <Group align="flex-end" justify="space-between" wrap="nowrap" style={{ height: rem(80), minWidth: rem(200), paddingInline: rem(2), gap: rem(6) }}>
          {week.map(({ day, xp, is_today: current }, i) => {
            const isHovered = hoveredBar === i;
            const pct = peakXp > 0 ? (xp / peakXp) * 100 : 0;
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
    <Box p="lg" className={styles.subscriptionCard} style={{ backgroundColor: INK }}>
      <Group justify="space-between" mb="md">
        <Text className={styles.darkCardTitle} fw={700} size="sm" c="white">Subscription</Text>
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
        const [recent, inProgress] = await Promise.all([
          fetchRecentSessions(),
          fetchInProgressSessions(),
        ]);

        setRecentSessions(recent);
        setInProgressSessions(inProgress);

        if (inProgress.length > 0) {
          const progressResults = await Promise.all(
            inProgress.map((s) =>
              fetchSessionProgress(s.id)
                .then((progress) => ({ id: s.id, ...progress }))
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
    const base = `/practice/${session.id}`;
    const sharedParams = `name=${encodeURIComponent(session.name)}&subject=${encodeURIComponent(session.subject_code)}`;
    if (session.status === "in_progress") {
      router.push(`${base}?topic=${encodeURIComponent(session.topic_name ?? session.subject_name)}&${sharedParams}`);
    } else {
      router.push(`${base}?review=true&${sharedParams}`);
    }
  }

  return (
    <Box className={styles.page} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box className={styles.pageInner} p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* Main column */}
          <Stack className={styles.mainColumn} style={{ flex: 1, minWidth: 0 }}>
            {/* Announcements */}
            <Box>
              <Text className={styles.sectionTitle} c={INK} mb={12}>
                Announcements
              </Text>
              <AnnouncementCarousel />
            </Box>

            {/* Your Last Practice Sets */}
            <Box>
              <Group justify="space-between" mb={12}>
                <Text className={styles.sectionTitle} c={INK}>
                  Your Last Practice Sets
                </Text>
                <Link className={styles.viewAll} href="/practice">
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
                <Text className={styles.sectionTitle} c={INK}>
                  In Progress
                </Text>
                <Link className={styles.viewAll} href="/practice">
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
          <Box className={styles.rightRail} visibleFrom="lg" style={{ width: rem(292), flexShrink: 0 }}>
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
