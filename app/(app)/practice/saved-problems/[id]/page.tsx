"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { Card } from "@/components/ui/card";
import { IconAlertCircle, IconBookmarkFilled } from "@tabler/icons-react";
import { ReportModal } from "@/components/report-modal";
import { SUBJECT_META } from "../../data";
import { DIFFICULTY_STYLE, DIFFICULTY_LABEL } from "../components/ProblemRow";
import { SetProgressPanel } from "../components/SetProgressPanel";
import { fetchSavedQuestion, removeBookmark } from "../api";
import type { SavedQuestionDetail } from "../types";
import { LanguageToggle, type Lang } from "@/components/language-toggle";
import { useNavStore } from "@/store/nav";
import { PassageQuestionGroup } from "../../[id]/components/PassageQuestionGroup";
import type { ApiQuestion, QuestionType, SubmitResult } from "../../[id]/types";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_DARK, WRONG_BG, WRONG_DARK,
} from "@/constants/colors";

/**
 * Reshape a saved question into the ApiQuestion the practice components expect,
 * so this renders through the exact same PassageQuestionGroup as a live session —
 * passage box, numbered question, option states, vocab hover and explanation all
 * come along instead of being reimplemented (and drifting) here.
 *
 * answer/explanation are null for questions the student never answered (withheld
 * server-side), which is what keeps the unanswered view from revealing anything.
 */
function toApiQuestion(d: SavedQuestionDetail): ApiQuestion {
  return {
    id: d.question_id,
    code: d.code,
    difficulty: d.difficulty,
    question_type: (d.question_type === "standard" ? "JF" : d.question_type) as QuestionType,
    // Show the sub-question number it had in its set, so the circled number here
    // matches what the student saw while practising.
    question_number: d.part_index ?? d.question_number,
    image_url: d.image_url,
    group_id: d.group_id,
    passage: d.passage,
    choices: d.choices,
    alignment: d.alignment ?? undefined,
    content_zh: {
      ...d.content_zh,
      explanation: d.explanation_zh ?? d.explanation_en ?? undefined,
      correct_answer: d.answer ?? undefined,
    },
    content_en: {
      ...d.content_en,
      explanation: d.explanation_en ?? d.explanation_zh ?? undefined,
      correct_answer: d.answer ?? undefined,
    },
  };
}

export default function SavedProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params.id as string;

  const [problem, setProblem] = useState<SavedQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [reportOpen, setReportOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Feed the question code to the breadcrumb (the URL only carries the UUID).
  const setProblemCode = useNavStore((s) => s.setProblemCode);
  useEffect(() => {
    if (problem?.code) setProblemCode(problem.code);
  }, [problem?.code, setProblemCode]);
  useEffect(() => () => setProblemCode(""), [setProblemCode]);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetchSavedQuestion(questionId)
      .then(setProblem)
      .catch((err) => {
        console.error("Failed to load saved question:", err);
        setLoadError("Failed to load this saved question.");
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  async function handleUnbookmark() {
    if (!problem || removing) return;
    setRemoving(true);
    try {
      await removeBookmark(problem.question_id);
      router.push("/practice/saved-problems");
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      setRemoving(false);
    }
  }

  const apiQuestion = useMemo(() => (problem ? toApiQuestion(problem) : null), [problem]);

  /**
   * This view is read-only — it shows the question exactly as it stands in its
   * practice set, not a fresh attempt. Two states:
   *
   *  answered   → feed PassageQuestionGroup a real result so it renders the full
   *               graded view: their choice, the correct one, and the explanation.
   *  unanswered → still mark it "submitted" (that's what makes the options
   *               non-interactive) but pass NO result, which the component reads
   *               as "not graded yet" and so reveals nothing. The answer isn't in
   *               the payload either way.
   */
  const answered = problem?.answer_state != null;
  const results: Record<string, SubmitResult> = useMemo(() => {
    if (!problem?.answer_state || !problem.answer) return {};
    return {
      [problem.question_id]: {
        question_id: problem.question_id,
        correct: problem.answer_state.correct,
        correct_answer: problem.answer,
        difficulty: problem.difficulty,
        xp_awarded: 0,
      },
    };
  }, [problem]);

  if (loading) {
    return (
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh" }}>
        <Stack align="center" gap="md">
          <div style={{
            width: rem(40), height: rem(40), borderRadius: "50%",
            border: `3px solid ${PRIMARY}`, borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
          <Text size="sm" c={MUTED}>Loading saved question…</Text>
        </Stack>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Box>
    );
  }

  if (loadError || !problem || !apiQuestion) {
    return (
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh" }}>
        <Stack align="center" gap="md">
          <IconAlertCircle size={40} color={PRIMARY} stroke={1.5} />
          <Text size="sm" c={INK} fw={600}>{loadError ?? "Saved question not found."}</Text>
          <Button variant="outline" color="dark" radius="md" onClick={() => router.push("/practice/saved-problems")}>
            Back to Saved Problems
          </Button>
        </Stack>
      </Box>
    );
  }

  const meta = SUBJECT_META[problem.subject_code ?? ""] ?? SUBJECT_META["MT"];
  const SubjectIcon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const savedOn = new Date(problem.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            <Card p="lg" className="no-select">
              {/* Header — mirrors the practice session card so this reads as
                  "that question, in its set" rather than a separate feature. */}
              <Group justify="space-between" align="center" mb="md" wrap="nowrap">
                <Group gap={rem(8)} wrap="nowrap" style={{ minWidth: 0 }}>
                  {problem.problem_number != null && (
                    <Badge size="sm" style={{ backgroundColor: INK, color: "white", fontWeight: 700, borderRadius: rem(999), flexShrink: 0 }}>
                      Problem {problem.problem_number}
                    </Badge>
                  )}
                  {problem.part_index != null && problem.part_total != null && (
                    <Badge size="sm" style={{ backgroundColor: SURFACE, color: MUTED, fontWeight: 600, borderRadius: rem(999), flexShrink: 0 }}>
                      {problem.part_index}/{problem.part_total}
                    </Badge>
                  )}
                  {problem.topic_name && (
                    <Badge size="sm" style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600, borderRadius: rem(999), flexShrink: 0 }}>
                      {problem.topic_name}
                    </Badge>
                  )}
                </Group>

                <Group gap={rem(6)} wrap="nowrap" style={{ flexShrink: 0 }}>
                  <LanguageToggle lang={lang} onChange={setLang} />
                  {answered && (
                    <Badge
                      size="sm"
                      style={{
                        backgroundColor: problem.answer_state!.correct ? CORRECT_BG : WRONG_BG,
                        color: problem.answer_state!.correct ? CORRECT_DARK : WRONG_DARK,
                        fontWeight: 600,
                        borderRadius: rem(999),
                      }}
                    >
                      {problem.answer_state!.correct ? "Answered correctly" : "Answered incorrectly"}
                    </Badge>
                  )}
                  <Badge size="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600, borderRadius: rem(999) }}>
                    {DIFFICULTY_LABEL[problem.difficulty]}
                  </Badge>
                  <Tooltip label="Remove bookmark" withArrow>
                    <UnstyledButton
                      onClick={handleUnbookmark}
                      disabled={removing}
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "#FFF9EC",
                      }}
                    >
                      <IconBookmarkFilled size={16} color={PRIMARY} />
                    </UnstyledButton>
                  </Tooltip>
                  <Tooltip label="Report a problem" withArrow>
                    <UnstyledButton
                      onClick={() => setReportOpen(true)}
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: SURFACE,
                      }}
                    >
                      <IconAlertCircle size={16} color={MUTED} stroke={1.5} />
                    </UnstyledButton>
                  </Tooltip>
                </Group>
              </Group>

              {/* Question body — same renderer as a live practice session */}
              <PassageQuestionGroup
                passage={problem.passage ?? ""}
                passageVocab={problem.passage_alignment?.vocab ?? {}}
                questions={[apiQuestion]}
                userAnswers={{ [problem.question_id]: problem.answer_state?.selected_key ?? "" }}
                submittedIds={new Set([problem.question_id])}
                results={results}
                lang={lang}
                onAnswer={() => {}}
                onSubmit={() => {}}
              />

              {!answered && (
                <Text size="xs" c={MUTED} mt="md" ta="center">
                  You haven&rsquo;t answered this one yet — open it in{" "}
                  {problem.session_name ?? "its practice set"} to try it.
                </Text>
              )}
            </Card>
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
            <Stack gap="md">
              {/* How the original set stood — display only, not navigable */}
              {problem.set_questions.length > 0 && (
                <SetProgressPanel questions={problem.set_questions} />
              )}

              <Card p="lg">
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                  Practice Set
                </Text>
                <Stack gap="sm">
                  {problem.session_name && problem.session_id ? (
                    <UnstyledButton
                      onClick={() => router.push(`/practice/${problem.session_id}`)}
                      style={{
                        fontSize: rem(15), fontWeight: 700, color: PRIMARY,
                        textDecoration: "underline", textUnderlineOffset: rem(3),
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {problem.session_name}
                    </UnstyledButton>
                  ) : (
                    <Text size="sm" c={MUTED}>Original set no longer available</Text>
                  )}

                  {problem.problem_number != null && problem.problem_total != null && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Position</Text>
                      <Text size="sm" fw={600} c={INK}>
                        Problem {problem.problem_number} of {problem.problem_total}
                      </Text>
                    </Group>
                  )}

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Subject</Text>
                    <Group gap={6}>
                      <Box style={{
                        width: rem(20), height: rem(20), borderRadius: rem(5),
                        backgroundColor: meta.iconBg, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <SubjectIcon size={12} stroke={1.5} color={meta.iconColor} />
                      </Box>
                      <Text size="sm" fw={600} c={INK}>{problem.subject_name}</Text>
                    </Group>
                  </Group>

                  {problem.topic_name && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Topic</Text>
                      <Text size="sm" fw={600} c={INK}>{problem.topic_name}</Text>
                    </Group>
                  )}

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Question</Text>
                    <Text size="sm" fw={500} c={INK}>{problem.code}</Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Saved on</Text>
                    <Text size="sm" fw={500} c={INK}>{savedOn}</Text>
                  </Group>
                </Stack>
              </Card>

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

      <ReportModal opened={reportOpen} onClose={() => setReportOpen(false)} />

      {/*
        No FloatingChatbot here: its context (mastery summary, sibling Problems in
        the session) is grounded in one specific practice session, whereas this is
        a cross-session shortlist. Ask about a saved question from its own set —
        linked in the right panel.
      */}
    </Box>
  );
}
