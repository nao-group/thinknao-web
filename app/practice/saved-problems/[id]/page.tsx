"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAtom,
  IconBook,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
  IconNotes,
} from "@tabler/icons-react";
import { SAVED_PROBLEMS, type SubjectKey, type Difficulty } from "../data";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { LanguageToggle, type Lang } from "@/components/language-toggle";

// ─── Styling constants ─────────────────────────────────────────────────────────

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const CREAM = "#F7E7D3";
const MUTED = "#667080";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";

const CORRECT_BG = "#F0FDF4";
const CORRECT_BORDER = "#86EFAC";
const CORRECT_GREEN = "#16A34A";
const CORRECT_DARK = "#166534";
const WRONG_BG = "#FEF2F2";
const WRONG_BORDER = "#FCA5A5";
const WRONG_RED = "#DC2626";
const WRONG_DARK = "#991B1B";

const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: "#DCFCE7", color: "#16A34A" },
  Medium: { bg: CREAM, color: PRIMARY },
  Hard: { bg: "#FEE2E2", color: "#DC2626" },
};

const VIOLET = "#7C3AED";
const EMERALD = "#059669";

const SUBJECT_META: Record<SubjectKey, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY  },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO   },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA    },
  "Liberal Arts Chinese": { icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET   },
  "Science Chinese":      { icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD  },
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function OptionRow({
  optKey,
  text,
  isCorrect,
  isSelected,
}: {
  optKey: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}) {
  let containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: rem(12),
    padding: `${rem(14)} ${rem(16)}`,
    borderRadius: rem(10),
    border: "1.5px solid #F1F5F9",
    backgroundColor: "white",
    width: "100%",
  };

  let circleStyle: React.CSSProperties = {
    width: rem(32),
    height: rem(32),
    borderRadius: "50%",
    backgroundColor: SURFACE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: rem(13),
    fontWeight: 700,
    color: MUTED,
  };

  let textColor = MUTED;
  let rightBadge: React.ReactNode = null;

  if (isCorrect) {
    containerStyle = { ...containerStyle, backgroundColor: CORRECT_BG, border: `1.5px solid ${CORRECT_BORDER}` };
    circleStyle = { ...circleStyle, backgroundColor: CORRECT_GREEN, color: "white" };
    textColor = CORRECT_DARK;
    rightBadge = (
      <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#DCFCE7", flexShrink: 0 }}>
        <Text size="xs" fw={700} style={{ color: CORRECT_DARK, letterSpacing: "0.04em" }}>CORRECT</Text>
      </Box>
    );
  } else if (isSelected) {
    containerStyle = { ...containerStyle, backgroundColor: WRONG_BG, border: `1.5px solid ${WRONG_BORDER}` };
    circleStyle = { ...circleStyle, backgroundColor: WRONG_RED, color: "white" };
    textColor = WRONG_DARK;
    rightBadge = (
      <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#FEE2E2", flexShrink: 0 }}>
        <Text size="xs" fw={700} style={{ color: WRONG_DARK, letterSpacing: "0.04em" }}>YOUR ANSWER</Text>
      </Box>
    );
  }

  return (
    <Box style={containerStyle}>
      <Box style={circleStyle}>
        {isCorrect ? (
          <IconCircleCheck size={18} stroke={2} color="white" />
        ) : isSelected ? (
          <IconCircleX size={18} stroke={2} color="white" />
        ) : (
          optKey
        )}
      </Box>
      <Text size="sm" c={textColor} fw={isCorrect || isSelected ? 600 : 400} style={{ flex: 1 }}>
        {text}
      </Text>
      {rightBadge}
    </Box>
  );
}

function ExplanationBox({ explanation }: { explanation: (typeof SAVED_PROBLEMS)[number]["explanation"] }) {
  return (
    <Box
      p="lg"
      style={{
        backgroundColor: "#FFF9EC",
        borderRadius: rem(10),
        borderLeft: `4px solid ${PRIMARY}`,
      }}
    >
      <Group gap={6} mb={8}>
        <IconNotes size={16} stroke={1.5} color={PRIMARY} />
        <Text size="sm" fw={700} c={PRIMARY}>Answer Key &amp; Explanation</Text>
      </Group>
      <Text size="sm" fw={700} c={CORRECT_DARK} mb={8}>
        Correct Answer: {explanation.correctStatement}
      </Text>
      <Text size="sm" c={INK} mb={10}>{explanation.intro}</Text>
      <Stack gap={4} mb={12}>
        {explanation.steps.map((step, i) => (
          <Group key={i} gap={8} align="flex-start">
            <Box
              style={{ width: rem(6), height: rem(6), borderRadius: "50%", backgroundColor: PRIMARY, flexShrink: 0, marginTop: rem(7) }}
            />
            <Text size="sm" c={INK}>{step}</Text>
          </Group>
        ))}
      </Stack>
      <Box p="sm" style={{ backgroundColor: "#F5E6CC", borderRadius: rem(8) }}>
        <Text size="sm" fw={700} c={CORRECT_DARK}>{explanation.conclusion}</Text>
      </Box>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const allProblems = SAVED_PROBLEMS;
  const currentIndex = allProblems.findIndex((p) => p.id === id);
  const problem = allProblems[currentIndex];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  if (!problem) {
    return (
      <Box p="xl">
        <Text c="dimmed">Problem not found.</Text>
      </Box>
    );
  }

  const meta = SUBJECT_META[problem.subject];
  const SubjectIcon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const date = new Date(problem.dateAdded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allProblems.length - 1;

  function goTo(idx: number) {
    setSelectedOption(null);
    setSubmitted(false);
    router.push(`/practice/saved-problems/${allProblems[idx].id}`);
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap">
          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Question Card */}
            <Box p="xl" className="no-select" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              {/* Header */}
              <Group justify="space-between" align="center" mb="lg">
                <Group gap={8}>
                  <Badge
                    size="md"
                    radius="md"
                    style={{ backgroundColor: INK, color: "white", fontWeight: 700, fontSize: rem(13) }}
                  >
                    Problem {problem.id}
                  </Badge>
                  <Badge
                    size="md"
                    radius="md"
                    style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600 }}
                  >
                    {lang === "zh" ? (problem.zh?.topic ?? problem.topic) : problem.topic}
                  </Badge>
                </Group>
                <Group gap={6}>
                  <LanguageToggle lang={lang} onChange={setLang} />
                  <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                    {problem.difficulty}
                  </Badge>
                  <IconBookmarkFilled size={16} color={PRIMARY} />
                </Group>
              </Group>

              {/* Question text */}
              <Box p="md" mb="lg" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                <Text size="sm" c={INK} lh={1.7}>
                  {lang === "zh" ? (problem.zh?.question ?? problem.question) : problem.question}
                </Text>
              </Box>

              {/* Options */}
              <Stack gap="sm" mb="lg">
                {problem.options.map((opt) => {
                  const isCorrect = opt.key === problem.correctAnswer;
                  const isSelected = submitted && opt.key === selectedOption && !isCorrect;
                  const showResult = submitted;

                  const displayText = lang === "zh" ? (opt.text_zh ?? opt.text) : opt.text;

                  if (showResult) {
                    return (
                      <OptionRow
                        key={opt.key}
                        optKey={opt.key}
                        text={displayText}
                        isCorrect={isCorrect}
                        isSelected={isSelected}
                      />
                    );
                  }

                  const chosen = opt.key === selectedOption;
                  return (
                    <Box
                      key={opt.key}
                      onClick={() => setSelectedOption(opt.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: rem(12),
                        padding: `${rem(14)} ${rem(16)}`,
                        borderRadius: rem(10),
                        border: `${chosen ? "2px" : "1.5px"} solid ${chosen ? PRIMARY : "#E2E8F0"}`,
                        backgroundColor: chosen ? CREAM : "white",
                        cursor: "pointer",
                        transition: "all 150ms ease",
                      }}
                    >
                      <Box
                        style={{
                          width: rem(32),
                          height: rem(32),
                          borderRadius: "50%",
                          backgroundColor: chosen ? PRIMARY : SURFACE,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: rem(13),
                          fontWeight: 700,
                          color: chosen ? INK : MUTED,
                        }}
                      >
                        {opt.key}
                      </Box>
                      <Text size="sm" c={INK} fw={chosen ? 600 : 400}>{displayText}</Text>
                    </Box>
                  );
                })}
              </Stack>

              {/* Explanation — shown after submit */}
              {submitted && (
                <ExplanationBox explanation={lang === "zh" ? (problem.zh?.explanation ?? problem.explanation) : problem.explanation} />
              )}
            </Box>

            {/* Navigation row */}
            <Group justify="space-between" align="center">
              <Button
                leftSection={<IconChevronLeft size={15} stroke={2} />}
                variant="outline"
                color="dark"
                radius="xl"
                disabled={!hasPrev}
                onClick={() => goTo(currentIndex - 1)}
              >
                Previous
              </Button>

              {submitted ? (
                <Group gap={6}>
                  <IconCheck size={15} stroke={2} color={CORRECT_GREEN} />
                  <Text size="sm" c="dimmed" fw={500}>Submitted</Text>
                </Group>
              ) : (
                <Button
                  radius="xl"
                  disabled={!selectedOption}
                  style={{ backgroundColor: selectedOption ? PRIMARY : undefined, color: "white", fontWeight: 600 }}
                  onClick={() => setSubmitted(true)}
                >
                  Submit
                </Button>
              )}

              <Button
                rightSection={<IconChevronRight size={15} stroke={2} />}
                radius="xl"
                disabled={!hasNext}
                style={{ backgroundColor: hasNext ? INK : undefined, color: "white", fontWeight: 600 }}
                onClick={() => goTo(currentIndex + 1)}
              >
                Next Problem
              </Button>
            </Group>
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
            <Stack gap="md">
              {/* Problem info */}
              <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                  Problem Info
                </Text>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Subject</Text>
                    <Group gap={6}>
                      <Box style={{ width: rem(20), height: rem(20), borderRadius: rem(5), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <SubjectIcon size={12} stroke={1.5} color={meta.iconColor} />
                      </Box>
                      <Text size="sm" fw={600} c={INK}>{problem.subject}</Text>
                    </Group>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Topic</Text>
                    <Text size="sm" fw={600} c={INK}>{problem.topic}</Text>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">Practice Set</Text>
                    <UnstyledButton
                      onClick={() => router.push(`/practice/${problem.setSlug}`)}
                      style={{
                        fontSize: rem(14),
                        fontWeight: 600,
                        color: PRIMARY,
                        textDecoration: "underline",
                        textUnderlineOffset: rem(3),
                        cursor: "pointer",
                      }}
                    >
                      {problem.setName}
                    </UnstyledButton>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Difficulty</Text>
                    <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                      {problem.difficulty}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Saved on</Text>
                    <Text size="sm" fw={500} c={INK}>{date}</Text>
                  </Group>
                </Stack>
              </Box>

              {/* Problem counter */}
              <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                  Saved Problems
                </Text>
                <Group justify="space-between" align="center">
                  <Text fw={700} size="xl" c={INK}>{currentIndex + 1}</Text>
                  <Text size="sm" c="dimmed">of {allProblems.length}</Text>
                </Group>
                <Box
                  mt="sm"
                  style={{
                    height: rem(6),
                    borderRadius: rem(999),
                    backgroundColor: SURFACE,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      height: "100%",
                      width: `${((currentIndex + 1) / allProblems.length) * 100}%`,
                      backgroundColor: PRIMARY,
                      borderRadius: rem(999),
                      transition: "width 300ms ease",
                    }}
                  />
                </Box>
              </Box>

              {/* Back button */}
              <Button
                variant="outline"
                color="dark"
                radius="md"
                fullWidth
                onClick={() => router.push("/practice/saved-problems")}
              >
                ← Back to Saved Problems
              </Button>
            </Stack>
          </Box>
        </Group>
      </Box>

      <FloatingChatbot
        questionContext={[
          `Subject: ${problem.subject} — Topic: ${problem.topic}`,
          `Question: ${problem.question}`,
          `Options:`,
          ...problem.options.map((o) => `  ${o.key}. ${o.text}`),
          `Correct Answer: ${problem.correctAnswer}`,
        ].join("\n")}
      />
    </Box>
  );
}
