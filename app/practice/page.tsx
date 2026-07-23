"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Group,
  NumberInput,
  Progress,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAtom,
  IconBookmark,
  IconChevronLeft,
  IconChevronRight,
  IconFlask,
  IconMathFunction,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";
const CREAM = "#F7E7D3";

// ─── Data ──────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { key: "math", label: "Mathematics", icon: IconMathFunction, iconBg: CREAM, iconColor: PRIMARY },
  { key: "physics", label: "Physics", icon: IconAtom, iconBg: "#EEF0FF", iconColor: INDIGO },
  { key: "chemistry", label: "Chemistry", icon: IconFlask, iconBg: "#FDF0EC", iconColor: PANDA },
] as const;

type SubjectKey = (typeof SUBJECTS)[number]["key"];

const QUESTION_COUNTS = [10, 20, 40, "Custom"] as const;

const PAGE_SIZE = 3;

const PRACTICE_SETS_IN_PROGRESS = [
  {
    label: "Mathematics 4",
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    pct: 68,
    done: 14,
    total: 20,
    created: "Created Jul 22",
    progressColor: "yellow",
  },
  {
    label: "Physics 3",
    icon: IconAtom,
    iconBg: "#EEF0FF",
    iconColor: INDIGO,
    pct: 35,
    done: 7,
    total: 20,
    created: "Created Jul 21",
    progressColor: "indigo",
  },
  {
    label: "Chemistry 4",
    icon: IconFlask,
    iconBg: "#FDF0EC",
    iconColor: PANDA,
    pct: 20,
    done: 2,
    total: 10,
    created: "Created Jul 20",
    progressColor: "orange",
  },
  {
    label: "Mathematics 5",
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    pct: 44,
    done: 9,
    total: 20,
    created: "Created Jul 19",
    progressColor: "yellow",
  },
  {
    label: "Physics 4",
    icon: IconAtom,
    iconBg: "#EEF0FF",
    iconColor: INDIGO,
    pct: 55,
    done: 11,
    total: 20,
    created: "Created Jul 18",
    progressColor: "indigo",
  },
  {
    label: "Chemistry 5",
    icon: IconFlask,
    iconBg: "#FDF0EC",
    iconColor: PANDA,
    pct: 10,
    done: 1,
    total: 10,
    created: "Created Jul 17",
    progressColor: "orange",
  },
];

const PRACTICE_SETS_COMPLETED = [
  {
    label: "Mathematics 3",
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    pct: 100,
    done: 40,
    total: 40,
    created: "Created Jul 15",
    progressColor: "yellow",
  },
  {
    label: "Physics 2",
    icon: IconAtom,
    iconBg: "#EEF0FF",
    iconColor: INDIGO,
    pct: 100,
    done: 35,
    total: 35,
    created: "Created Jul 12",
    progressColor: "indigo",
  },
  {
    label: "Chemistry 3",
    icon: IconFlask,
    iconBg: "#FDF0EC",
    iconColor: PANDA,
    pct: 100,
    done: 30,
    total: 30,
    created: "Created Jul 10",
    progressColor: "orange",
  },
  {
    label: "Mathematics 2",
    icon: IconMathFunction,
    iconBg: CREAM,
    iconColor: PRIMARY,
    pct: 100,
    done: 20,
    total: 20,
    created: "Created Jul 8",
    progressColor: "yellow",
  },
];

const PRACTICE_STATS = [
  { icon: IconStar, iconBg: CREAM, iconColor: PRIMARY, label: "Sets Completed", value: "12" },
  { icon: IconAtom, iconBg: "#EEF0FF", iconColor: INDIGO, label: "Avg. Score", value: "74%" },
  { icon: IconMathFunction, iconBg: "#FDF0EC", iconColor: PANDA, label: "Questions Done", value: "312" },
];

const SUBJECT_SCORES = [
  { label: "Mathematics", pct: 82, color: PRIMARY, progressColor: "yellow" },
  { label: "Physics", pct: 68, color: INDIGO, progressColor: "indigo" },
  { label: "Chemistry", pct: 61, color: PANDA, progressColor: "orange" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  selected,
  onSelect,
}: {
  subject: (typeof SUBJECTS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = subject.icon;
  return (
    <UnstyledButton
      onClick={onSelect}
      style={{
        flex: 1,
        padding: rem(20),
        borderRadius: rem(12),
        border: `2px solid ${selected ? PRIMARY : "#E2E8F0"}`,
        backgroundColor: selected ? CREAM : "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: rem(10),
        transition: "border-color 150ms ease, background-color 150ms ease",
        cursor: "pointer",
      }}
    >
      <Box
        style={{
          width: rem(48),
          height: rem(48),
          borderRadius: rem(12),
          backgroundColor: subject.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} stroke={1.5} color={subject.iconColor} />
      </Box>
      <Text
        size="sm"
        fw={selected ? 700 : 500}
        c={selected ? PRIMARY : INK}
        style={{ transition: "color 150ms ease" }}
      >
        {subject.label}
      </Text>
    </UnstyledButton>
  );
}

function QuestionCountPill({
  value,
  selected,
  onSelect,
}: {
  value: number | string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <UnstyledButton
      onClick={onSelect}
      style={{
        padding: `${rem(6)} ${rem(16)}`,
        borderRadius: rem(999),
        backgroundColor: selected ? INK : "transparent",
        border: `1px solid ${selected ? INK : "#CBD5E1"}`,
        fontSize: rem(13),
        fontWeight: selected ? 600 : 400,
        color: selected ? "white" : INK,
        transition: "all 150ms ease",
        cursor: "pointer",
      }}
    >
      {value}
    </UnstyledButton>
  );
}

function PaginationBtn({
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: rem(32),
        height: rem(32),
        borderRadius: rem(8),
        border: "1.5px solid #D1D5DB",
        backgroundColor: "white",
        color: "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </UnstyledButton>
  );
}

function PracticeSetRow({ set, action = "Continue" }: { set: (typeof PRACTICE_SETS_IN_PROGRESS)[number]; action?: string }) {
  const Icon = set.icon;
  return (
    <Box
      className="hover-zoom"
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(14),
        padding: `${rem(16)} 0`,
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      {/* Icon */}
      <Box
        style={{
          width: rem(40),
          height: rem(40),
          borderRadius: rem(10),
          backgroundColor: set.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} stroke={1.5} color={set.iconColor} />
      </Box>

      {/* Info + progress */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" mb={6}>
          <Text size="sm" fw={600} c={INK}>
            {set.label}
          </Text>
          <Text size="sm" fw={700} c={set.iconColor} style={{ flexShrink: 0 }}>
            {set.pct}%
          </Text>
        </Group>
        <Progress
          value={set.pct}
          size="sm"
          radius="xl"
          color={set.progressColor}
          mb={4}
        />
        <Text size="xs" c="dimmed">
          {set.done} of {set.total} questions done · {set.created}
        </Text>
      </Box>

      {/* Action */}
      <Button
        size="xs"
        variant="default"
        radius="sm"
        style={{ flexShrink: 0 }}
      >
        {action}
      </Button>
    </Box>
  );
}

function StatRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: (typeof PRACTICE_STATS)[number]) {
  return (
    <Group justify="space-between" align="center" py={rem(6)}>
      <Group gap={10}>
        <Box
          style={{
            width: rem(28),
            height: rem(28),
            borderRadius: rem(7),
            backgroundColor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} stroke={1.5} color={iconColor} />
        </Box>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={700} c={INK}>
        {value}
      </Text>
    </Group>
  );
}

function SubjectScoreBar({ label, pct, color, progressColor }: (typeof SUBJECT_SCORES)[number]) {
  return (
    <Box mb={rem(12)}>
      <Group justify="space-between" mb={4}>
        <Text size="sm" c={INK} fw={500}>
          {label}
        </Text>
        <Text size="sm" fw={700} c={color}>
          {pct}%
        </Text>
      </Group>
      <Progress value={pct} size="sm" radius="xl" color={progressColor} />
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("math");
  const [selectedCount, setSelectedCount] = useState<number | string>(20);
  const [customCount, setCustomCount] = useState<number | string>("");
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">("in-progress");
  const [practicePage, setPracticePage] = useState(0);

  const activeSets = activeTab === "in-progress" ? PRACTICE_SETS_IN_PROGRESS : PRACTICE_SETS_COMPLETED;
  const totalPages = Math.ceil(activeSets.length / PAGE_SIZE);
  const pagedSets = activeSets.slice(practicePage * PAGE_SIZE, (practicePage + 1) * PAGE_SIZE);

  function handleTabChange(tab: "in-progress" | "completed") {
    setActiveTab(tab);
    setPracticePage(0);
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Generate Practice Set */}
            <Box
              p="xl"
              style={{ backgroundColor: "white", borderRadius: rem(14) }}
            >
              {/* Header */}
              <Group justify="space-between" align="flex-start" mb={rem(6)}>
                <Box>
                  <Text fw={700} size="lg" c={INK} mb={4}>
                    Generate Practice Set
                  </Text>
                  <Text size="sm" c="dimmed">
                    Choose a subject and let AI build your set instantly
                  </Text>
                </Box>
                <Group
                  gap={6}
                  px="sm"
                  py={rem(6)}
                  style={{
                    borderRadius: rem(999),
                    border: `1px solid ${PRIMARY}`,
                    flexShrink: 0,
                  }}
                >
                  <IconStar size={13} stroke={1.5} color={PRIMARY} fill={PRIMARY} />
                  <Text size="xs" fw={600} c={PRIMARY}>
                    AI-Powered
                  </Text>
                </Group>
              </Group>

              {/* Subject selector */}
              <Text
                size="xs"
                fw={700}
                tt="uppercase"
                style={{ letterSpacing: "0.06em" }}
                c="dimmed"
                mt="lg"
                mb="sm"
              >
                Select Subject
              </Text>
              <Group gap="sm" wrap="nowrap" mb="lg">
                {SUBJECTS.map((s) => (
                  <SubjectCard
                    key={s.key}
                    subject={s}
                    selected={selectedSubject === s.key}
                    onSelect={() => setSelectedSubject(s.key)}
                  />
                ))}
              </Group>

              {/* Question count + generate */}
              <Group justify="space-between" align="center" wrap="nowrap">
                <Box>
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    style={{ letterSpacing: "0.06em" }}
                    c="dimmed"
                    mb="sm"
                  >
                    Questions
                  </Text>
                  <Group gap="sm" align="center">
                    {QUESTION_COUNTS.map((count) => (
                      <QuestionCountPill
                        key={count}
                        value={count}
                        selected={selectedCount === count}
                        onSelect={() => setSelectedCount(count)}
                      />
                    ))}
                    {selectedCount === "Custom" && (
                      <NumberInput
                        value={customCount}
                        onChange={setCustomCount}
                        placeholder="e.g. 15"
                        min={1}
                        max={200}
                        size="xs"
                        radius="xl"
                        style={{ width: rem(90) }}
                        styles={{ input: { textAlign: "center" } }}
                      />
                    )}
                  </Group>
                </Box>
                <Button
                  leftSection={<IconPlus size={15} stroke={2} />}
                  size="base"
                  radius="lg"
                  style={{ backgroundColor: INK, color: "white", fontWeight: 600, flexShrink: 0, paddingLeft: rem(15) }}
                >
                  Generate Practice Set
                </Button>
              </Group>
            </Box>

            {/* My Practice Sets */}
            <Box
              p="xl"
              style={{ backgroundColor: "white", borderRadius: rem(14) }}
            >
              <Group justify="space-between" align="center" mb="lg">
                <Text fw={700} size="lg" c={INK}>
                  My Practice Sets
                </Text>
                <Group
                  gap={0}
                  style={{
                    borderRadius: rem(999),
                    backgroundColor: SURFACE,
                    padding: rem(4),
                  }}
                >
                  {(["in-progress", "completed"] as const).map((tab) => (
                    <UnstyledButton
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      style={{
                        padding: `${rem(6)} ${rem(16)}`,
                        borderRadius: rem(999),
                        backgroundColor: activeTab === tab ? INK : "transparent",
                        color: activeTab === tab ? "white" : "#667080",
                        fontSize: rem(13),
                        fontWeight: activeTab === tab ? 600 : 400,
                        transition: "all 150ms ease",
                        cursor: "pointer",
                      }}
                    >
                      {tab === "in-progress" ? "In Progress" : "Completed"}
                    </UnstyledButton>
                  ))}
                </Group>
              </Group>

              {/* Practice set rows */}
              <Stack key={activeTab} gap={0} className="tab-fade-in">
                {pagedSets.map((set) => (
                  <PracticeSetRow key={set.label} set={set} action={activeTab === "completed" ? "Review" : "Continue"} />
                ))}
              </Stack>

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="flex-end" align="center" gap={6} mt="md">
                  <PaginationBtn
                    onClick={() => setPracticePage((p) => Math.max(0, p - 1))}
                    aria-label="Previous"
                  >
                    <IconChevronLeft size={14} stroke={2} />
                  </PaginationBtn>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <UnstyledButton
                      key={i}
                      onClick={() => setPracticePage(i)}
                      style={{
                        width: rem(32),
                        height: rem(32),
                        borderRadius: rem(8),
                        fontSize: rem(13),
                        fontWeight: 600,
                        border: `1.5px solid ${i === practicePage ? INK : "#D1D5DB"}`,
                        backgroundColor: i === practicePage ? INK : "white",
                        color: i === practicePage ? "white" : "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 150ms ease",
                      }}
                    >
                      {i + 1}
                    </UnstyledButton>
                  ))}

                  <PaginationBtn
                    onClick={() => setPracticePage((p) => Math.min(totalPages - 1, p + 1))}
                    aria-label="Next"
                  >
                    <IconChevronRight size={14} stroke={2} />
                  </PaginationBtn>
                </Group>
              )}
            </Box>
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(300), flexShrink: 0 }}>
            <Stack gap="md">
              {/* Saved Problems */}
              <Box
                p="xl"
                style={{ backgroundColor: INK, borderRadius: rem(14) }}
              >
                <Group justify="space-between" align="flex-start" mb={rem(12)}>
                  <Box
                    style={{
                      width: rem(40),
                      height: rem(40),
                      borderRadius: rem(10),
                      backgroundColor: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconBookmark size={18} stroke={1.5} color="white" />
                  </Box>
                  <Group
                    gap={5}
                    px="sm"
                    py={rem(5)}
                    style={{ borderRadius: rem(999), backgroundColor: PRIMARY }}
                  >
                    <Text size="xs" fw={700} c="white">
                      24 saved
                    </Text>
                  </Group>
                </Group>
                <Text fw={700} size="md" c="white" mb={4}>
                  Saved Problems
                </Text>
                <Text size="xs" c="rgba(255,255,255,0.55)" lh={1.6} mb="lg">
                  Problems you bookmarked for later review
                </Text>
                <Button
                  fullWidth
                  size="sm"
                  leftSection={<IconBookmark size={14} stroke={1.5} />}
                  style={{
                    backgroundColor: PRIMARY,
                    color: "white",
                    fontWeight: 600,
                    borderRadius: rem(8),
                  }}
                >
                  View Saved Problems
                </Button>
              </Box>

              {/* Practice Stats */}
              <Box
                p="xl"
                style={{ backgroundColor: "white", borderRadius: rem(14) }}
              >
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  style={{ letterSpacing: "0.06em" }}
                  c="dimmed"
                  mb="md"
                >
                  Practice Stats
                </Text>
                <Stack gap={0}>
                  {PRACTICE_STATS.map((stat) => (
                    <StatRow key={stat.label} {...stat} />
                  ))}
                </Stack>
              </Box>

              {/* Avg Score by Subject */}
              <Box
                p="xl"
                style={{ backgroundColor: "white", borderRadius: rem(14) }}
              >
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  style={{ letterSpacing: "0.06em" }}
                  c="dimmed"
                  mb="md"
                >
                  Avg Score by Subject
                </Text>
                {SUBJECT_SCORES.map((s) => (
                  <SubjectScoreBar key={s.label} {...s} />
                ))}
              </Box>
            </Stack>
          </Box>
        </Group>
      </Box>
    </Box>
  );
}
