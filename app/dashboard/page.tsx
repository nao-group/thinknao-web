import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  rem,
} from "@mantine/core";
import {
  IconBell,
  IconChevronRight,
  IconClock,
  IconFlask,
  IconMathFunction,
  IconPlayerPlayFilled,
  IconAtom,
} from "@tabler/icons-react";

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";
const CREAM = "#F7E7D3";

// ─── Sub-components ────────────────────────────────────────────────────────────

function ContentHeader() {
  return (
    <Box
      px={{ base: "md", sm: "xl" }}
      py="md"
      style={{ backgroundColor: "white", borderBottom: "1px solid #E2E8F0" }}
    >
      <Group justify="space-between" align="center">
        <Box>
          <Title order={2} style={{ fontSize: rem(22), color: INK }}>
            Welcome back, Li Wei!
          </Title>
          <Text size="sm" c="dimmed">
            Monday, July 21, 2026 — CSCA Exam Prep
          </Text>
        </Box>
        <Group gap="md" align="center">
          <Box
            style={{
              width: rem(38),
              height: rem(38),
              borderRadius: rem(10),
              backgroundColor: SURFACE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IconBell size={18} stroke={1.5} color="#667080" />
          </Box>
          <Group gap="xs" align="center">
            <Avatar color="dark" radius="xl" size={38}>
              LW
            </Avatar>
            <Box visibleFrom="sm">
              <Group gap={6} align="center">
                <Text size="sm" fw={600} c={INK} lh={1.3}>
                  Li Wei
                </Text>
                <Badge size="xs" color="dark" variant="filled" radius="sm">
                  PRO
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                23 days left · Expires Aug 13, 2026
              </Text>
            </Box>
          </Group>
        </Group>
      </Group>
    </Box>
  );
}

function AnnouncementBanner() {
  return (
    <Box
      p="xl"
      style={{
        borderRadius: rem(14),
        backgroundColor: INK,
        backgroundImage:
          "radial-gradient(ellipse at 90% 50%, rgba(212,160,23,0.15) 0%, transparent 60%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        style={{
          position: "absolute",
          top: "-40px",
          right: "200px",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          pointerEvents: "none",
        }}
      />

      <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
        <Box style={{ flex: 1, minWidth: rem(200) }}>
          <Group gap="xs" mb={10}>
            <Badge
              size="sm"
              color="gold"
              variant="filled"
              radius="sm"
              style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 700 }}
            >
              NEW
            </Badge>
            <Text size="sm" c="rgba(255,255,255,0.6)">
              July 2026
            </Text>
          </Group>
          <Title order={3} c="white" mb={8} style={{ fontSize: rem(20), lineHeight: 1.3 }}>
            CSCA July Mock Exam is now live — test yourself before the real thing!
          </Title>
          <Text size="sm" c="rgba(255,255,255,0.5)">
            Full-length simulation · 120 questions · Timed · Instant results
          </Text>
        </Box>

        <Stack align="flex-end" gap="xs">
          <Button
            leftSection={<IconPlayerPlayFilled size={14} />}
            style={{
              backgroundColor: PRIMARY,
              color: "white",
              fontWeight: 700,
              borderRadius: rem(10),
            }}
            size="md"
          >
            Start Exam
          </Button>
          <Text size="xs" c="rgba(255,255,255,0.4)">
            Ends July 31
          </Text>
        </Stack>
      </Group>
    </Box>
  );
}

const PROBLEM_SETS = [
  {
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    label: "Mathematics — Module 1",
    meta: "40 questions · Multiple choice",
    added: "Added Jul 20",
  },
  {
    icon: IconAtom,
    iconBg: "#EEF0FF",
    iconColor: INDIGO,
    label: "Physics — Module 2",
    meta: "35 questions · Problem solving",
    added: "Added Jul 21",
  },
  {
    icon: IconFlask,
    iconBg: "#FDF0EC",
    iconColor: PANDA,
    label: "Chemistry — Module 3",
    meta: "30 questions · Multiple choice",
    added: "Added Jul 21",
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
        <Badge size="xs" color="teal" variant="light" radius="sm">
          New
        </Badge>
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <ContentHeader />

      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* Main column */}
          <Stack style={{ flex: 1, minWidth: 0 }}>
            {/* Announcements */}
            <Box>
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb={12}>
                Announcements
              </Text>
              <AnnouncementBanner />
            </Box>

            {/* New Problem Sets */}
            <Box>
              <Group justify="space-between" mb={12}>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
                  New Problem Sets Published
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
            <LearningActivity />
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
