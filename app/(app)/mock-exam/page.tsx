"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import { Card } from "@/components/ui/card";
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { ReportModal } from "@/components/report-modal";
import type { Lang } from "@/components/language-toggle";

// ─── Constants ─────────────────────────────────────────────────────────────────

import { INK, SURFACE, PRIMARY, CREAM, MUTED, CORRECT_GREEN } from "@/constants/colors";
import { ALL_QUESTIONS, SUBJECT_CONFIG, SUBJECT_META } from "./data";
import type { ExamResult, MockQ, Phase, Subject } from "./types";
import { ExamStructureTable } from "./components/ExamStructureTable";
import { RecentAttempts } from "./components/RecentAttempts";
import { SetupModal } from "./components/SetupModal";
import { GeneratingScreen } from "./components/GeneratingScreen";
import { ExamTopBar } from "./components/ExamTopBar";
import { QuestionNavigator } from "./components/QuestionNavigator";
import { SubmitExamModal } from "./components/SubmitExamModal";
import { ResultsScreen } from "./components/ResultsScreen";

const PASS_MARK = 60;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MockExamPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupLang, setSetupLang] = useState<Lang>("en");
  const [setupSubject, setSetupSubject] = useState<Subject>("Mathematics");
  const [lang, setLang] = useState<Lang>("en");
  const [examQuestions, setExamQuestions] = useState<MockQ[]>([]);
  const [examDuration, setExamDuration] = useState(60 * 60);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [timedOut, setTimedOut] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const examQRef = useRef(examQuestions);
  examQRef.current = examQuestions;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;
  const examDurationRef = useRef(examDuration);
  examDurationRef.current = examDuration;

  // Simulate AI generation then start exam
  useEffect(() => {
    if (phase !== "generating") return;
    const cfg = SUBJECT_CONFIG[setupSubject];
    const duration = cfg.duration;
    const effectiveLang = cfg.langFixed ?? setupLang;
    const id = setTimeout(() => {
      setExamQuestions(shuffle(ALL_QUESTIONS.filter((q) => q.subject === setupSubject)));
      setExamDuration(duration);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(duration);
      setTimedOut(false);
      setLang(effectiveLang);
      setPhase("exam");
    }, 2500);
    return () => clearTimeout(id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); setTimedOut(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (!timedOut) return;
    const q = examQRef.current;
    const a = answersRef.current;
    const t = timeLeftRef.current;
    const dur = examDurationRef.current;
    const correct = q.filter((qu) => a[qu.id] === qu.correctAnswer).length;
    const pct = q.length > 0 ? Math.round((correct / q.length) * 100) : 0;
    setResult({ correct, pct, passed: pct >= PASS_MARK, timeTaken: dur - t, timedOut: true });
    setPhase("results");
  }, [timedOut]);

  function doSubmit() {
    const correct = examQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
    const pct = examQuestions.length > 0 ? Math.round((correct / examQuestions.length) * 100) : 0;
    setResult({ correct, pct, passed: pct >= PASS_MARK, timeTaken: examDuration - timeLeft, timedOut: false });
    setPhase("results");
    setSubmitOpen(false);
  }

  // ── Landing ──────────────────────────────────────────────────────────────────

  if (phase === "landing") {
    return (
      <Box className="editorial-page" p={{ base: "md", sm: "xl" }}>
        <style>{`@keyframes exam-spin { to { transform: rotate(360deg) } }`}</style>

        {/* Header */}
        <Group justify="space-between" mb="xl" wrap="nowrap" align="flex-start">
          <Box>
            <Text className="editorial-page-title" mb={4}>Mock Exam</Text>
            <Text size="sm" c="dimmed" style={{ maxWidth: rem(480) }}>
              AI-generated exam simulating the CSCA format. No hints, no saves — just like the real thing.
            </Text>
          </Box>
          <Button
            className="landing-action-button"
            size="md"
            rightSection={<IconPlus size={15} stroke={2.2} />}
            style={{ flexShrink: 0 }}
            onClick={() => setSetupOpen(true)}
          >
            Start New Exam
          </Button>
        </Group>

        <Group align="flex-start" gap="xl" wrap="nowrap">
          {/* Left: subject table + rules */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="lg">
            {/* CSCA exam table */}
            <ExamStructureTable />

            {/* Rules */}
            <Card p="lg">
              <Text size="sm" fw={700} c={INK} mb="sm">Exam Rules</Text>
              <Stack gap={8}>
                {[
                  "Subject and language are chosen once before the exam and cannot be changed.",
                  "Questions are AI-generated and randomised each session.",
                  "You cannot bookmark or save individual questions.",
                  "Answers are submitted all at once — no per-question feedback during the exam.",
                  "Correct answers and explanations are not revealed after submission.",
                  "The timer cannot be paused. Running out of time auto-submits your answers.",
                ].map((rule, i) => (
                  <Group key={i} gap={10} align="flex-start">
                    <Box style={{ width: rem(5), height: rem(5), borderRadius: "50%", backgroundColor: MUTED, flexShrink: 0, marginTop: rem(8) }} />
                    <Text size="sm" c="dimmed">{rule}</Text>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Stack>

          {/* Right: past attempts */}
          <Box visibleFrom="md" style={{ width: rem(300), flexShrink: 0 }}>
            <Text fw={700} size="sm" c={INK} mb="sm">Recent Attempts</Text>
            <RecentAttempts />
          </Box>
        </Group>

        {/* Setup Modal */}
        <SetupModal
          opened={setupOpen}
          onClose={() => setSetupOpen(false)}
          setupSubject={setupSubject}
          onSetupSubjectChange={setSetupSubject}
          setupLang={setupLang}
          onSetupLangChange={setSetupLang}
          onStart={() => { setSetupOpen(false); setPhase("generating"); }}
          passMark={PASS_MARK}
        />
      </Box>
    );
  }

  // ── Generating ────────────────────────────────────────────────────────────────

  if (phase === "generating") {
    return <GeneratingScreen subject={setupSubject} />;
  }

  // ── Exam ──────────────────────────────────────────────────────────────────────

  if (phase === "exam" && examQuestions.length > 0) {
    const q = examQuestions[current];
    const isLast = current === examQuestions.length - 1;
    const totalQ = examQuestions.length;
    const answeredCount = Object.keys(answers).length;
    const unanswered = totalQ - answeredCount;
    const isLow = timeLeft < 300;
    const isCritical = timeLeft < 60;
    const qText = lang === "zh" ? (q.zh?.text ?? q.text) : q.text;
    const qTopic = lang === "zh" ? (q.zh?.topic ?? q.topic) : q.topic;
    const qOptions = lang === "zh" && q.zh?.options ? q.zh.options : q.options;
    const meta = SUBJECT_META[q.subject];

    return (
      <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Sticky top bar */}
        <ExamTopBar
          current={current}
          totalQ={totalQ}
          subjectIcon={meta.icon}
          iconBg={meta.iconBg}
          iconColor={meta.iconColor}
          qTopic={qTopic}
          timeLeft={timeLeft}
          isLow={isLow}
          isCritical={isCritical}
        />

        {/* Mobile progress */}
        <Box hiddenFrom="lg" px="md" py={6} style={{ backgroundColor: "white", borderBottom: "1px solid #F1F5F9" }}>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">{answeredCount} answered</Text>
            <Text size="xs" c="dimmed">{unanswered} remaining</Text>
          </Group>
          <Progress value={totalQ > 0 ? (answeredCount / totalQ) * 100 : 0} size={4} radius="xl" color="dark" />
        </Box>

        <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Question column */}
            <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
              <Card p="xl" className="no-select">
                <Group justify="flex-end" mb="sm">
                  <Tooltip label="Report a problem" withArrow position="left">
                    <UnstyledButton
                      onClick={() => setReportOpen(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: rem(5),
                        padding: `${rem(5)} ${rem(10)}`,
                        borderRadius: rem(999),
                        border: "1.5px solid #E2E8F0",
                        backgroundColor: "white",
                        color: MUTED,
                        fontSize: rem(12),
                        fontWeight: 500,
                        transition: "all 150ms ease",
                      }}
                    >
                      <IconAlertCircle size={13} stroke={2} />
                      Report
                    </UnstyledButton>
                  </Tooltip>
                </Group>
                <Box p="md" mb="lg" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                  <Text size="md" c={INK} lh={1.7}><LatexText>{qText}</LatexText></Text>
                </Box>
                <Stack gap="sm">
                  {qOptions.map((opt) => {
                    const chosen = answers[q.id] === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                        style={{
                          display: "flex", alignItems: "center", gap: rem(12),
                          padding: `${rem(14)} ${rem(16)}`, borderRadius: rem(10),
                          border: `${chosen ? "2px" : "1.5px"} solid ${chosen ? PRIMARY : "#E2E8F0"}`,
                          backgroundColor: chosen ? CREAM : "#FFFDF8",
                          cursor: "pointer", transition: "all 150ms ease",
                        }}
                      >
                        <Box style={{ width: rem(32), height: rem(32), borderRadius: "50%", backgroundColor: chosen ? PRIMARY : SURFACE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: rem(13), fontWeight: 700, color: chosen ? INK : MUTED }}>
                          {opt.key}
                        </Box>
                        <Text size="md" c={INK} fw={chosen ? 600 : 400}><LatexText>{opt.text}</LatexText></Text>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>

              <Group justify="space-between">
                <Button leftSection={<IconChevronLeft size={15} stroke={2} />} variant="outline" color="dark" radius="xl" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                  Previous
                </Button>
                {isLast ? (
                  <Button radius="xl" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={() => setSubmitOpen(true)}>
                    Submit Exam
                  </Button>
                ) : (
                  <Button rightSection={<IconChevronRight size={15} stroke={2} />} radius="xl" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={() => setCurrent((c) => c + 1)}>
                    Next
                  </Button>
                )}
              </Group>
            </Stack>

            {/* Right sidebar */}
            <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
              <Stack gap="md">
                <QuestionNavigator
                  questions={examQuestions}
                  current={current}
                  answers={answers}
                  onSelect={setCurrent}
                />

                <Card p="lg">
                  <Group justify="space-between" mb={6}>
                    <Text size="xs" c="dimmed">{answeredCount} answered</Text>
                    <Text size="xs" c="dimmed">{unanswered} remaining</Text>
                  </Group>
                  <Progress value={totalQ > 0 ? (answeredCount / totalQ) * 100 : 0} size="sm" radius="xl" color="dark" />
                </Card>

                <Button fullWidth radius="md" style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }} onClick={() => setSubmitOpen(true)}>
                  Submit Exam
                </Button>
              </Stack>
            </Box>
          </Group>
        </Box>

        <ReportModal opened={reportOpen} onClose={() => setReportOpen(false)} />

        <SubmitExamModal
          opened={submitOpen}
          onClose={() => setSubmitOpen(false)}
          unanswered={unanswered}
          totalQ={totalQ}
          onConfirm={doSubmit}
        />
      </Box>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  if (phase === "results" && result) {
    return (
      <ResultsScreen
        examQuestions={examQuestions}
        answers={answers}
        result={result}
        passMark={PASS_MARK}
        onBackToLanding={() => setPhase("landing")}
        onRetakeExam={() => { setSetupOpen(true); setPhase("landing"); }}
      />
    );
  }

  return null;
}
