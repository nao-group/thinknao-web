"use client";

import { Badge, Box, Button, Group, SimpleGrid, Stack, Text, rem } from "@mantine/core";
import { IconClock, IconTrophy, IconX } from "@tabler/icons-react";
import { CORRECT_GREEN, INK, MUTED, WRONG_RED } from "@/constants/colors";
import { formatDuration } from "@/lib/format";
import { SUBJECT_META, type ExamResult, type MockQ } from "../data";

interface ResultsScreenProps {
  examQuestions: MockQ[];
  answers: Record<number, string>;
  result: ExamResult;
  passMark: number;
  onBackToLanding: () => void;
  onRetakeExam: () => void;
}

// ─── Results phase ───────────────────────────────────────────────────────────────

export function ResultsScreen({
  examQuestions,
  answers,
  result,
  passMark,
  onBackToLanding,
  onRetakeExam,
}: ResultsScreenProps) {
  const totalQ = examQuestions.length;
  const wrong = examQuestions.filter((q) => answers[q.id] && answers[q.id] !== q.correctAnswer).length;
  const skipped = totalQ - Object.keys(answers).length;
  const subjectMeta = SUBJECT_META[examQuestions[0]?.subject ?? "Mathematics"];
  const SubjectResultIcon = subjectMeta.icon;

  return (
    <Box p={{ base: "md", sm: "xl" }}>
      <Stack align="center" gap="xl">
        {result.timedOut && (
          <Box px="lg" py="sm" style={{ backgroundColor: "#FEF3C7", borderRadius: rem(10), border: "1px solid #FCD34D" }}>
            <Group gap={8}>
              <IconClock size={16} color="#D97706" />
              <Text size="sm" fw={600} c="#92400E">Time&apos;s up! Your answers were automatically submitted.</Text>
            </Group>
          </Box>
        )}

        {/* Subject label */}
        <Group gap={8}>
          <Box style={{ width: rem(28), height: rem(28), borderRadius: rem(7), backgroundColor: subjectMeta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SubjectResultIcon size={15} stroke={1.5} color={subjectMeta.iconColor} />
          </Box>
          <Text size="sm" fw={600} c="dimmed">{examQuestions[0]?.subject}</Text>
        </Group>

        {/* Score circle */}
        <Box style={{
          width: rem(160), height: rem(160), borderRadius: "50%",
          border: `8px solid ${result.passed ? CORRECT_GREEN : WRONG_RED}`,
          backgroundColor: result.passed ? "#F0FDF4" : "#FEF2F2",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          {result.passed ? <IconTrophy size={32} stroke={1.5} color={CORRECT_GREEN} /> : <IconX size={32} stroke={2} color={WRONG_RED} />}
          <Text fw={900} size="xl" c={result.passed ? CORRECT_GREEN : WRONG_RED} lh={1.2} mt={4}>{result.pct}%</Text>
          <Text size="xs" c="dimmed">{result.correct}/{totalQ}</Text>
        </Box>

        <Stack align="center" gap={6}>
          <Badge size="xl" radius="md" style={{ backgroundColor: result.passed ? "#DCFCE7" : "#FEE2E2", color: result.passed ? CORRECT_GREEN : WRONG_RED, fontWeight: 900, fontSize: rem(16), padding: `${rem(10)} ${rem(28)}` }}>
            {result.passed ? "PASS" : "FAIL"}
          </Badge>
          <Text size="sm" c="dimmed" ta="center">
            {result.passed ? "Congratulations! You passed the mock exam." : `You need ${passMark}% to pass. Keep practising!`}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 2, xs: 4 }} style={{ width: "100%", maxWidth: rem(560) }}>
          {[
            { label: "Correct",    value: String(result.correct),       color: CORRECT_GREEN },
            { label: "Wrong",      value: String(wrong),                 color: WRONG_RED     },
            { label: "Skipped",    value: String(skipped),               color: MUTED         },
            { label: "Time Taken", value: formatDuration(result.timeTaken), color: INK           },
          ].map((stat) => (
            <Box key={stat.label} p="md" style={{ backgroundColor: "white", borderRadius: rem(12), textAlign: "center" }}>
              <Text fw={700} size="lg" c={stat.color}>{stat.value}</Text>
              <Text size="xs" c="dimmed" mt={2}>{stat.label}</Text>
            </Box>
          ))}
        </SimpleGrid>

        <Group>
          <Button variant="outline" color="dark" radius="xl" onClick={onBackToLanding}>
            Back to Mock Exam
          </Button>
          <Button radius="xl" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={onRetakeExam}>
            Retake Exam
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}
