import {
  Box,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
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
import { AnnouncementCarousel } from "@/components/announcement-carousel";

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";
const CREAM = "#F7E7D3";

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
    label: "Governance Framework — Module 1",
    done: 17,
    total: 25,
    pct: 68,
    color: INK,
  },
  {
    label: "Internal Audit Process — Module 3",
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
  { day: "M", pct: 18 },
  { day: "T", pct: 72 },
  { day: "W", pct: 58 },
  { day: "T", pct: 48 },
  { day: "F", pct: 65 },
  { day: "S", pct: 12 },
  { day: "S", pct: 80, current: true },
];

function LearningActivity() {
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
          { value: "142", label: "Questions Done", color: INK },
          { value: "74%", label: "Avg. Score", color: INK },
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
      <Group align="flex-end" justify="space-between" style={{ height: rem(80) }}>
        {WEEK.map(({ day, pct, current }) => (
          <Stack key={day} align="center" gap={4} style={{ flex: 1 }}>
            <Box
              style={{
                width: "100%",
                maxWidth: rem(28),
                height: rem(Math.max(4, (pct / 100) * 64)),
                borderRadius: rem(4),
                backgroundColor: current ? INK : "#E2E8F0",
                transition: "height 300ms ease",
              }}
            />
            <Text
              size="xs"
              fw={current ? 700 : 400}
              c={current ? INK : "dimmed"}
            >
              {day}
            </Text>
          </Stack>
        ))}
      </Group>
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
                <Group
                  gap={4}
                  style={{ cursor: "pointer", color: PRIMARY, fontWeight: 600, fontSize: rem(13) }}
                >
                  View all <IconChevronRight size={14} />
                </Group>
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
                <Group
                  gap={4}
                  style={{ cursor: "pointer", color: PRIMARY, fontWeight: 600, fontSize: rem(13) }}
                >
                  View all <IconChevronRight size={14} />
                </Group>
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
