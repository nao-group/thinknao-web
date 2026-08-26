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
import { CircleBadge } from "@/components/markdown-latex-text";
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
import { ExplanationBox } from "./components/ExplanationBox";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
} from "@/constants/colors";

// ─── Cloze segment parser ──────────────────────────────────────────────────────

function parseClozeSegments(text: string): Array<{ type: "text" | "blank"; value: string }> {
  if (/\{\d+\}/.test(text)) {
    return text.split(/(\{\d+\})/g).map((part) => {
      const m = part.match(/^\{(\d+)\}$/);
      return m ? { type: "blank" as const, value: m[1] } : { type: "text" as const, value: part };
    });
  }
  // ____ format — one blank per sentence
  const parts = text.split("____");
  const result: Array<{ type: "text" | "blank"; value: string }> = [];
  parts.forEach((p, i) => {
    result.push({ type: "text" as const, value: p });
    if (i < parts.length - 1) result.push({ type: "blank" as const, value: "1" });
  });
  return result;
}

// ─── Inline blank (read-only, always submitted) ───────────────────────────────

function ClozeBlank({
  idx,
  partIndex,
  selectedKey,
  correctKey,
  choices,
}: {
  idx: string;
  partIndex: number;
  selectedKey: string | null;
  correctKey: string | null;
  choices: { key: string; text: string }[];
}) {
  function getChoiceText(key: string) {
    return choices.find((c) => c.key === key)?.text ?? key;
  }

  const isCurrentBlank = Number(idx) === partIndex;

  // Non-active blanks — neutral numbered placeholder
  if (!isCurrentBlank) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: rem(36),
          minHeight: rem(28),
          padding: `${rem(3)} ${rem(8)}`,
          borderRadius: rem(8),
          border: `1.5px dashed ${MUTED}`,
          backgroundColor: SURFACE,
          verticalAlign: "middle",
          margin: `0 ${rem(3)}`,
        }}
      >
        <CircleBadge n={idx} />
      </span>
    );
  }

  // Current blank — show answer result
  const isCorrect = !!selectedKey && selectedKey === correctKey;
  const selectedText = selectedKey ? getChoiceText(selectedKey) : null;
  const correctText = correctKey ? getChoiceText(correctKey) : null;

  return (
    <span
      style={{
        display: "inline",
        verticalAlign: "middle",
        margin: `0 ${rem(3)}`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: rem(72),
          minHeight: rem(32),
          padding: `${rem(4)} ${rem(10)}`,
          borderRadius: rem(8),
          border: `1.5px solid ${isCorrect ? CORRECT_BORDER : selectedKey ? WRONG_BORDER : MUTED}`,
          backgroundColor: isCorrect ? CORRECT_BG : selectedKey ? WRONG_BG : SURFACE,
          fontSize: rem(14),
          fontWeight: 600,
          color: isCorrect ? CORRECT_GREEN : selectedKey ? WRONG_RED : MUTED,
        }}
      >
        {selectedText ?? <CircleBadge n={idx} />}
      </span>
      {!isCorrect && selectedKey && correctText && (
        <span
          style={{
            fontSize: rem(12),
            color: CORRECT_GREEN,
            fontWeight: 600,
            marginLeft: rem(4),
          }}
        >
          → {correctText}
        </span>
      )}
    </span>
  );
}

// ─── DT: Paragraph cloze (read-only) ─────────────────────────────────────────

function ParagraphClozeView({
  text,
  choices,
  partIndex,
  selectedKey,
  correctKey,
}: {
  text: string;
  choices: { key: string; text: string }[];
  partIndex: number;
  selectedKey: string | null;
  correctKey: string | null;
}) {
  const segments = parseClozeSegments(text);

  return (
    <div style={{ fontSize: rem(16), lineHeight: 2.2, color: INK }}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.value}</span>
        ) : (
          <ClozeBlank
            key={i}
            idx={seg.value}
            partIndex={partIndex}
            selectedKey={selectedKey}
            correctKey={correctKey}
            choices={choices}
          />
        )
      )}
    </div>
  );
}

// ─── XT: Vocabulary / sentence cloze (read-only) ─────────────────────────────

function SentenceClozeView({
  text,
  questionNumber,
  choices,
  selectedKey,
  correctKey,
}: {
  text: string;
  questionNumber: number;
  choices: { key: string; text: string }[];
  selectedKey: string | null;
  correctKey: string | null;
}) {
  const segments = parseClozeSegments(text);

  function getChoiceText(key: string) {
    return choices.find((c) => c.key === key)?.text ?? key;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: rem(8),
        padding: `${rem(12)} ${rem(16)}`,
        borderRadius: rem(10),
        border: "1px solid #E2E8F0",
        backgroundColor: "white",
        lineHeight: 2,
      }}
    >
      {/* Question number circle */}
      <span
        style={{
          minWidth: rem(28),
          height: rem(28),
          borderRadius: "50%",
          backgroundColor: SURFACE,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: rem(12),
          fontWeight: 700,
          color: MUTED,
          flexShrink: 0,
        }}
      >
        {questionNumber}
      </span>

      <span style={{ fontSize: rem(15), color: INK, flex: 1 }}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.value}</span>;

          const isCorrect = !!selectedKey && selectedKey === correctKey;
          const selectedText = selectedKey ? getChoiceText(selectedKey) : null;
          const correctText = correctKey ? getChoiceText(correctKey) : null;

          return (
            <span
              key={i}
              style={{
                display: "inline",
                verticalAlign: "middle",
                margin: `0 ${rem(4)}`,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: rem(68),
                  minHeight: rem(28),
                  padding: `${rem(3)} ${rem(10)}`,
                  borderRadius: rem(8),
                  border: `1.5px solid ${isCorrect ? CORRECT_BORDER : selectedKey ? WRONG_BORDER : MUTED}`,
                  backgroundColor: isCorrect ? CORRECT_BG : selectedKey ? WRONG_BG : SURFACE,
                  fontSize: rem(14),
                  fontWeight: 600,
                  color: isCorrect ? CORRECT_GREEN : selectedKey ? WRONG_RED : MUTED,
                }}
              >
                {selectedText ?? <span style={{ color: MUTED, fontSize: rem(12) }}>____</span>}
              </span>
              {!isCorrect && selectedKey && correctText && (
                <span
                  style={{
                    fontSize: rem(12),
                    color: CORRECT_GREEN,
                    fontWeight: 600,
                    marginLeft: rem(4),
                  }}
                >
                  → {correctText}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </div>
  );
}

// ─── Reshape saved question → ApiQuestion for PassageQuestionGroup ─────────────

function toApiQuestion(d: SavedQuestionDetail): ApiQuestion {
  return {
    id: d.question_id,
    code: d.code,
    difficulty: d.difficulty,
    question_type: (d.question_type === "standard" ? "JF" : d.question_type) as QuestionType,
    // Show the sub-question number it had in its set, so the circled number matches
    // what the student saw while practising.
    question_number: d.part_index ?? d.question_number,
    image_url: d.image_url,
    group_id: d.group_id,
    passage: d.passage,
    choices: d.choices,
    alignment: d.alignment ?? undefined,
    content_zh: {
      ...d.content?.zh,
      explanation: d.explanation ?? undefined,
      correct_answer: d.answer ?? undefined,
    },
    content_en: {
      ...d.content?.en,
      explanation: d.explanation ?? undefined,
      correct_answer: d.answer ?? undefined,
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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

  // Only used for non-cloze types (YL, JF, standard MC) via PassageQuestionGroup.
  const apiQuestion = useMemo(() => (problem ? toApiQuestion(problem) : null), [problem]);

  /**
   * This view is read-only — shows the question exactly as it stood in its
   * practice set, not a fresh attempt. Two states:
   *
   *  answered   → feed PassageQuestionGroup a real result so it renders the full
   *               graded view: their choice, the correct one, and the explanation.
   *  unanswered → still mark it "submitted" (makes options non-interactive) but
   *               pass NO result, which the component reads as "not graded yet"
   *               and so reveals nothing. The answer isn't in the payload either way.
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

  const isDT = problem.question_type === "DT";
  const isXT = problem.question_type === "XT";
  const isCloze = isDT || isXT;

  const choices = problem.choices ?? [];
  const partIndex = problem.part_index ?? 1;
  const selectedKey = problem.answer_state?.selected_key ?? null;
  const correctKey = problem.answer;

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            <Card p="lg" className="no-select">
              {/* Header */}
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

              {/* ── Question body ── */}

              {/* DT: Paragraph cloze */}
              {isDT && (
                <Stack gap="md">
                  <ParagraphClozeView
                    text={problem.question_text}
                    choices={choices}
                    partIndex={partIndex}
                    selectedKey={selectedKey}
                    correctKey={correctKey}
                  />
                  {!answered && (
                    <Text size="xs" c={MUTED} ta="center">
                      You haven&rsquo;t answered this one yet — open it in{" "}
                      {problem.session_name ?? "its practice set"} to try it.
                    </Text>
                  )}
                  {answered && problem.explanation && (
                    <ExplanationBox explanation={problem.explanation} circleNums />
                  )}
                </Stack>
              )}

              {/* XT: Vocabulary / sentence cloze */}
              {isXT && (
                <Stack gap="md">
                  <SentenceClozeView
                    text={problem.question_text}
                    questionNumber={problem.question_number ?? 1}
                    choices={choices}
                    selectedKey={selectedKey}
                    correctKey={correctKey}
                  />
                  {!answered && (
                    <Text size="xs" c={MUTED} ta="center">
                      You haven&rsquo;t answered this one yet — open it in{" "}
                      {problem.session_name ?? "its practice set"} to try it.
                    </Text>
                  )}
                  {answered && problem.explanation && (
                    <ExplanationBox explanation={problem.explanation} circleNums />
                  )}
                </Stack>
              )}

              {/* YL / JF / standard MC — rendered through the same PassageQuestionGroup as a live session */}
              {!isCloze && (
                <>
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
                </>
              )}
            </Card>
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
            <Stack gap="md">
              {/* Display-only progress panel for the original set */}
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
