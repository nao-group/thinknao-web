"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Box,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBookmark,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconFlag,
  IconFlagFilled,
  IconNotes,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { ReportModal } from "@/components/report-modal";
import { LanguageToggle, type Lang } from "@/components/language-toggle";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
  NAV_CORRECT, NAV_WRONG,
} from "@/constants/colors";
import { DragDropParagraph } from "./components/DragDropParagraph";
import { WordBankSet } from "./components/WordBankSet";
import { PassageQuestionGroup } from "./components/PassageQuestionGroup";
import { AlignedText } from "./components/AlignedText";
import type { ApiQuestion, QuestionGroup, FillAnswerMap, SubmitResult } from "./types";
import { vocabEnToVocab } from "./types";
import {
  fetchSessionQuestions,
  fetchSessionReview,
  submitSingleQuestion,
  submitQuestionGroup,
  completeSession,
  fetchBookmarkedIds,
  addBookmark,
  removeBookmark,
} from "./api";
import { useNavStore } from "@/store/nav";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isGroupCorrect(group: QuestionGroup, submitResults: Record<string, SubmitResult>): boolean {
  return group.questions.every((q) => submitResults[q.id]?.correct === true);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ProgressCard({
  submittedSet,
  submitResults,
  questionGroups,
  flaggedSet,
  fillAnswers,
  answers,
}: {
  submittedSet: Set<number>;
  submitResults: Record<string, SubmitResult>;
  questionGroups: QuestionGroup[];
  flaggedSet: Set<string>;
  fillAnswers: FillAnswerMap;
  answers: Record<string, string>;
}) {
  const allQ = questionGroups.flatMap((g) => g.questions);
  const total = allQ.length;
  const correct = allQ.filter((q) => submitResults[q.id]?.correct === true).length;
  const wrong = allQ.filter((q) => submitResults[q.id] != null && submitResults[q.id].correct === false).length;
  const filledNotSubmitted = questionGroups.reduce((acc, g, gi) => {
    if (submittedSet.has(gi)) return acc;
    return acc + g.questions.filter((q) => {
      if (submitResults[q.id] != null) return false;
      // DT/XT: check fill blanks; JF/YL: check selected answer
      return Object.values(fillAnswers[q.id] ?? {}).some(Boolean) || Boolean(answers[q.id]);
    }).length;
  }, 0);
  const flaggedNotSubmitted = allQ.filter(
    (q) => flaggedSet.has(q.id) && submitResults[q.id] == null && !Object.values(fillAnswers[q.id] ?? {}).some(Boolean)
  ).length;
  const submittedQ = correct + wrong;
  const answered = submittedQ + filledNotSubmitted;
  const remaining = Math.max(0, total - answered - flaggedNotSubmitted);

  const correctPct = total > 0 ? (correct / total) * 100 : 0;
  const wrongPct = total > 0 ? (wrong / total) * 100 : 0;
  const flaggedPct = total > 0 ? (flaggedNotSubmitted / total) * 100 : 0;
  const filledPct = total > 0 ? (filledNotSubmitted / total) * 100 : 0;
  const remainingPct = total > 0 ? (remaining / total) * 100 : 100;

  return (
    <Card p="lg">
      <Group justify="space-between" mb={rem(10)}>
        <Text size="sm" fw={700} c={INK}>Progress</Text>
        <Text size="sm" fw={700} c={PRIMARY}>{answered} / {total}</Text>
      </Group>

      <Box style={{
        display: "flex", height: rem(8), borderRadius: rem(999),
        overflow: "hidden", backgroundColor: SURFACE, marginBottom: rem(10),
      }}>
        {correctPct > 0 && <Box style={{ width: `${correctPct}%`, backgroundColor: CORRECT_GREEN }} />}
        {wrongPct > 0 && <Box style={{ width: `${wrongPct}%`, backgroundColor: WRONG_RED }} />}
        {flaggedPct > 0 && <Box style={{ width: `${flaggedPct}%`, backgroundColor: PRIMARY }} />}
        {filledPct > 0 && <Box style={{ width: `${filledPct}%`, backgroundColor: "#93C5FD" }} />}
        {remainingPct > 0 && <Box style={{ width: `${remainingPct}%`, backgroundColor: "#CBD5E1" }} />}
      </Box>

      <Group gap="md">
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: CORRECT_GREEN, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{correct} correct</Text>
        </Group>
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: WRONG_RED, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{wrong} wrong</Text>
        </Group>
        {filledNotSubmitted > 0 && (
          <Group gap={rem(5)}>
            <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#93C5FD", flexShrink: 0 }} />
            <Text size="xs" c={MUTED}>{filledNotSubmitted} filled</Text>
          </Group>
        )}
        <Group gap={rem(5)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>{remaining} left</Text>
        </Group>
      </Group>
    </Card>
  );
}

function QuestionNavigator({
  currentQ,
  currentSubQ,
  submitResults,
  questionGroups,
  flaggedSet,
  fillAnswers,
  answers,
  onJump,
}: {
  currentQ: number;
  currentSubQ: number;
  submitResults: Record<string, SubmitResult>;
  questionGroups: QuestionGroup[];
  flaggedSet: Set<string>;
  fillAnswers: FillAnswerMap;
  answers: Record<string, string>;
  onJump: (groupIdx: number, subQIdx: number) => void;
}) {
  const flatQ = questionGroups.flatMap((g, gi) =>
    g.questions.map((q, qi) => ({ groupIdx: gi, subQIdx: qi, questionId: q.id }))
  );

  function getQStatus(questionId: string): "correct" | "wrong" | "flagged" | "filled" | "unanswered" {
    const result = submitResults[questionId];
    if (result != null) return result.correct ? "correct" : "wrong";
    if (flaggedSet.has(questionId)) return "flagged";
    // Selected-but-not-submitted answer (JF/YL) or filled blank (DT/XT)
    if (answers[questionId] || Object.values(fillAnswers[questionId] ?? {}).some(Boolean)) return "filled";
    return "unanswered";
  }

  function getNavStyle(groupIdx: number, subQIdx: number, questionId: string): React.CSSProperties {
    const status = getQStatus(questionId);
    const isCurrent = groupIdx === currentQ && subQIdx === currentSubQ;

    const base: React.CSSProperties = {
      width: rem(48), height: rem(48), borderRadius: rem(10),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: rem(14), fontWeight: 500, cursor: "pointer", border: "none",
      transition: "box-shadow 150ms ease",
      boxShadow: isCurrent ? `0 0 0 3px ${INK}` : "none",
    };
    const flaggedBorder = flaggedSet.has(questionId) ? { border: `2px solid ${PRIMARY}` } : {};

    switch (status) {
      case "correct": return { ...base, backgroundColor: NAV_CORRECT, color: "white", fontWeight: 700, ...flaggedBorder };
      case "wrong": return { ...base, backgroundColor: NAV_WRONG, color: "white", fontWeight: 700, ...flaggedBorder };
      case "flagged": return { ...base, backgroundColor: CREAM, color: PRIMARY, fontWeight: 700, border: `2px solid ${PRIMARY}` };
      case "filled": return { ...base, backgroundColor: "#BFDBFE", color: INK, fontWeight: 600 };
      default: return { ...base, backgroundColor: SURFACE, color: "#94A3B8", fontWeight: 500 };
    }
  }

  return (
    <Card p="lg">
      <Text size="sm" fw={700} c={INK} mb="md">Questions</Text>
      <SimpleGrid cols={4} spacing={rem(8)}>
        {flatQ.map((fq, i) => (
          <UnstyledButton key={fq.questionId} onClick={() => onJump(fq.groupIdx, fq.subQIdx)} style={getNavStyle(fq.groupIdx, fq.subQIdx, fq.questionId)}>
            {i + 1}
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={2} spacing={rem(6)} mt="md">
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_CORRECT, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Correct</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: NAV_WRONG, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Wrong</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: PRIMARY, flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Flagged</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#BFDBFE", flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Filled</Text>
        </Group>
        <Group gap={rem(6)}>
          <Box style={{ width: rem(10), height: rem(10), borderRadius: rem(2), backgroundColor: "#CBD5E1", flexShrink: 0 }} />
          <Text size="xs" c={MUTED}>Not answered</Text>
        </Group>
      </SimpleGrid>
    </Card>
  );
}

// ─── Summary ───────────────────────────────────────────────────────────────────

function SummaryView({
  questionGroups,
  submitResults,
  submittedSet,
  answers,
  totalSeconds,
  lang,
  xpEarned,
  topicName,
  onBack,
}: {
  questionGroups: QuestionGroup[];
  submitResults: Record<string, SubmitResult>;
  submittedSet: Set<number>;
  answers: Record<string, string>;
  totalSeconds: number;
  lang: Lang;
  xpEarned: number;
  topicName: string;
  onBack: () => void;
}) {
  const [currentReviewQ, setCurrentReviewQ] = useState(0);
  const [currentReviewSubQ, setCurrentReviewSubQ] = useState(0);

  const allQuestions = questionGroups.flatMap((g) => g.questions);
  const totalQ = allQuestions.length;
  const correct = allQuestions.filter((q) => submitResults[q.id]?.correct === true).length;
  const wrong = allQuestions.filter((q) => submitResults[q.id] != null && submitResults[q.id].correct === false).length;
  const skipped = totalQ - correct - wrong;
  const scorePct = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;

  const scoreColor = scorePct >= 70 ? CORRECT_GREEN : scorePct >= 40 ? PRIMARY : WRONG_RED;
  const scoreBg = scorePct >= 70 ? CORRECT_BG : scorePct >= 40 ? "#FFF9EC" : WRONG_BG;

  function handleReviewPrev() {
    const cg = questionGroups[currentReviewQ];
    const isP = cg?.type === "YL" || cg?.type === "JF" || cg?.type === "SH" || cg?.type === "BY";
    if (isP && currentReviewSubQ > 0) { setCurrentReviewSubQ((q) => q - 1); return; }
    const prevIdx = currentReviewQ - 1;
    const prevG = questionGroups[prevIdx];
    const prevIsP = prevG?.type === "YL" || prevG?.type === "JF";
    setCurrentReviewSubQ(prevIsP ? prevG.questions.length - 1 : 0);
    setCurrentReviewQ(prevIdx);
  }

  function handleReviewNext() {
    const cg = questionGroups[currentReviewQ];
    const isP = cg?.type === "YL" || cg?.type === "JF" || cg?.type === "SH" || cg?.type === "BY";
    if (isP && currentReviewSubQ < cg.questions.length - 1) { setCurrentReviewSubQ((q) => q + 1); return; }
    setCurrentReviewSubQ(0);
    setCurrentReviewQ((q) => q + 1);
  }

  const isCurrentGroupPassage = questionGroups[currentReviewQ]?.type === "YL" || questionGroups[currentReviewQ]?.type === "JF" || questionGroups[currentReviewQ]?.type === "SH" || questionGroups[currentReviewQ]?.type === "BY";
  const prevDisabledReview = currentReviewQ === 0 && currentReviewSubQ === 0;
  const nextDisabledReview = currentReviewQ === questionGroups.length - 1 &&
    (!isCurrentGroupPassage || currentReviewSubQ >= (questionGroups[currentReviewQ]?.questions.length ?? 1) - 1);

  function getQuestionText(q: ApiQuestion): string {
    function extract(content: ApiQuestion["content_zh"] | ApiQuestion["content_en"]): string {
      const qField = content?.question;
      if (!qField) return "";
      if (typeof qField === "string") return qField;
      return Object.values(qField as Record<string, string>)[0] ?? "";
    }
    return extract(lang === "zh" ? q.content_zh : q.content_en) || extract(q.content_zh);
  }

  function getOptions(q: ApiQuestion): Array<{ key: string; text: string }> {
    function extractOptions(content: ApiQuestion["content_zh"] | ApiQuestion["content_en"]): Array<{ key: string; text: string }> | null {
      const answer = content?.answer as Record<string, string> | undefined;
      if (answer && Object.keys(answer).length > 0) return Object.entries(answer).map(([key, text]) => ({ key, text }));
      return null;
    }
    return extractOptions(lang === "zh" ? q.content_zh : q.content_en) ?? extractOptions(q.content_zh) ?? [];
  }

  return (
    <Stack gap="md">
      {/* ── Score header ── */}
      <Card p="xl">
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.07em" }} mb={4}>
              Practice Complete
            </Text>
            <Text fw={800} size="xl" c={INK}>Your Results</Text>
          </Box>
          <Group gap={12} style={{ flexShrink: 0 }}>
            {xpEarned > 0 && (
              <Box px="sm" py={4} style={{ backgroundColor: "#FFF9EC", border: `1.5px solid ${PRIMARY}`, borderRadius: rem(999) }}>
                <Text size="sm" fw={700} c={PRIMARY}>+{xpEarned} XP</Text>
              </Box>
            )}
            <Group gap={6}>
              <IconClock size={14} stroke={1.5} color={MUTED} />
              <Text size="sm" fw={600} c={MUTED}>{formatTime(totalSeconds)}</Text>
            </Group>
          </Group>
        </Group>

        <Group align="center" gap="xl" mb="lg" wrap="nowrap">
          <Box style={{
            width: rem(96), height: rem(96), borderRadius: "50%",
            backgroundColor: scoreBg, border: `3px solid ${scoreColor}`,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}>
            <Text fw={800} size="xl" c={scoreColor} lh={1}>{scorePct}%</Text>
            <Text size="xs" c={scoreColor} fw={600}>{correct}/{totalQ}</Text>
          </Box>

          <Box style={{ flex: 1 }}>
            <Box mb="md" style={{
              height: rem(10), borderRadius: rem(999), backgroundColor: SURFACE,
              overflow: "hidden", display: "flex",
            }}>
              {correct > 0 && <Box style={{ width: `${(correct / totalQ) * 100}%`, backgroundColor: CORRECT_GREEN, transition: "width 600ms ease" }} />}
              {wrong > 0 && <Box style={{ width: `${(wrong / totalQ) * 100}%`, backgroundColor: WRONG_RED }} />}
              {skipped > 0 && <Box style={{ width: `${(skipped / totalQ) * 100}%`, backgroundColor: "#CBD5E1" }} />}
            </Box>

            <SimpleGrid cols={3} spacing="xs">
              <Box p="sm" style={{ backgroundColor: CORRECT_BG, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconCircleCheck size={14} stroke={2} color={CORRECT_GREEN} />
                  <Text size="xs" fw={700} c={CORRECT_GREEN}>Correct</Text>
                </Group>
                <Text fw={800} size="lg" c={CORRECT_DARK}>{correct}</Text>
              </Box>
              <Box p="sm" style={{ backgroundColor: WRONG_BG, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconCircleX size={14} stroke={2} color={WRONG_RED} />
                  <Text size="xs" fw={700} c={WRONG_RED}>Wrong</Text>
                </Group>
                <Text fw={800} size="lg" c={WRONG_DARK}>{wrong}</Text>
              </Box>
              <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10), textAlign: "center" }}>
                <Group gap={4} justify="center" mb={2}>
                  <IconFlag size={14} stroke={1.5} color={MUTED} />
                  <Text size="xs" fw={700} c={MUTED}>Skipped</Text>
                </Group>
                <Text fw={800} size="lg" c={INK}>{skipped}</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </Group>

        <Button variant="outline" color="dark" radius="md"
          leftSection={<IconChevronLeft size={14} stroke={2} />}
          onClick={onBack}>
          Back to Practice Sets
        </Button>
      </Card>

      {/* ── Question review — one at a time ── */}
      <Group justify="space-between" align="center" px={2}>
        <Text fw={700} size="sm" c={INK}>Answer Key &amp; Review</Text>
        <Text size="sm" c={MUTED} fw={500}>{currentReviewQ + 1} / {questionGroups.length}</Text>
      </Group>

      {questionGroups.slice(currentReviewQ, currentReviewQ + 1).map((group, _) => {
        const gi = currentReviewQ;
        const submitted = submittedSet.has(gi);
        const groupTotal = group.questions.length;
        const groupCorrect = group.questions.filter((q) => submitResults[q.id]?.correct === true).length;
        const groupIsCorrect = submitted && groupCorrect === groupTotal;
        const scoreLabel = !submitted ? "Skipped" : `${groupCorrect}/${groupTotal}`;
        const resultBg = !submitted ? SURFACE : groupIsCorrect ? "#DCFCE7" : "#FEE2E2";
        const resultColor = !submitted ? MUTED : groupIsCorrect ? CORRECT_GREEN : WRONG_RED;

        const isPassage = group.type === "YL" || group.type === "JF" || group.type === "SH" || group.type === "BY";
        const isFill = group.type === "DT" || group.type === "XT";

        return (
          <Card key={group.group_id ?? gi} p="lg" className="no-select">

            <Group justify="space-between" align="center" mb="md">
              <Group gap={8}>
                <Badge size="sm" style={{ backgroundColor: INK, color: "white", fontWeight: 700, borderRadius: rem(999) }}>
                  Problem {gi + 1}
                </Badge>
                {isPassage && group.questions.length > 1 && (
                  <Badge size="sm" style={{ backgroundColor: SURFACE, color: MUTED, fontWeight: 600, borderRadius: rem(999) }}>
                    {currentReviewSubQ + 1}/{group.questions.length}
                  </Badge>
                )}
                <Badge size="sm" style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600, borderRadius: rem(999) }}>
                  {topicName || group.type}
                </Badge>
              </Group>
              <Box px="sm" py={3} style={{ backgroundColor: resultBg, borderRadius: rem(999) }}>
                <Text size="xs" fw={700} c={resultColor}>{scoreLabel}</Text>
              </Box>
            </Group>

            {/* YL / JF: show one question at a time */}
            {isPassage && (() => {
              const q = group.questions[currentReviewSubQ];
              const qi = currentReviewSubQ;
              if (!q) return null;
              const qResult = submitResults[q.id];
              const userKey = answers[q.id] ?? "";
              const correctKey = qResult?.correct_answer ?? "";
              const options = getOptions(q);
              const explanation = lang === "zh" ? (q.explanation ?? q.explanation_en) : (q.explanation_en ?? q.explanation);
              const passage = group.passage;

              return (
                <Stack key={q.id} gap={rem(8)} mb={rem(16)}>
                  {/* Passage box */}
                  {passage && (
                    <Box p="md" style={{
                      backgroundColor: SURFACE, borderRadius: rem(10),
                      border: "1.5px solid #E2E8F0", lineHeight: 1.9,
                      fontSize: rem(15), color: INK,
                    }}>
                      <Text size="xs" fw={700} c={MUTED} mb={rem(6)}
                        style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Passage / 阅读材料
                      </Text>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        <AlignedText
                          text={passage}
                          vocab={group.passage_alignment?.vocab ?? {}}
                          mode={lang}
                          multiline
                        />
                      </div>
                    </Box>
                  )}

                  {/* Question text with number circle */}
                  <Box p="md" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                    <Group gap={rem(10)} align="flex-start">
                      <Box style={{
                        minWidth: rem(28), height: rem(28), borderRadius: "50%",
                        backgroundColor: "#F0F4FF", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: rem(13), fontWeight: 700,
                        color: "#6670B0", flexShrink: 0,
                      }}>
                        {qi + 1}
                      </Box>
                      <div style={{ flex: 1, lineHeight: 1.7 }}>
                        <AlignedText
                          text={getQuestionText(q)}
                          vocab={q.alignment?.vocab ?? {}}
                          mode={lang}
                        />
                      </div>
                    </Group>
                  </Box>
                  <Stack gap={rem(6)}>
                    {options.map((opt) => {
                      const isCorrectOpt = submitted && opt.key === correctKey;
                      const isUserWrong = submitted && opt.key === userKey && !isCorrectOpt;
                      const bg = isCorrectOpt ? CORRECT_BG : isUserWrong ? WRONG_BG : "white";
                      const border = isCorrectOpt
                        ? `1.5px solid ${CORRECT_BORDER}`
                        : isUserWrong ? `1.5px solid ${WRONG_BORDER}`
                        : submitted ? "1.5px solid #F1F5F9" : "1.5px solid #E2E8F0";
                      const textColor = isCorrectOpt ? CORRECT_DARK : isUserWrong ? WRONG_DARK : submitted ? "#94A3B8" : INK;

                      return (
                        <Box key={opt.key} style={{
                          display: "flex", alignItems: "center", gap: rem(10),
                          padding: `${rem(10)} ${rem(14)}`, borderRadius: rem(10),
                          border, backgroundColor: bg,
                        }}>
                          <Box style={{
                            width: rem(28), height: rem(28), borderRadius: "50%", flexShrink: 0,
                            backgroundColor: isCorrectOpt ? CORRECT_GREEN : isUserWrong ? WRONG_RED : SURFACE,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: rem(12), fontWeight: 700,
                            color: (isCorrectOpt || isUserWrong) ? "white" : MUTED,
                          }}>
                            {isCorrectOpt
                              ? <IconCircleCheck size={16} color="white" style={{ display: "block" }} />
                              : isUserWrong
                              ? <IconCircleX size={16} color="white" style={{ display: "block" }} />
                              : <Text size="xs" fw={700} style={{ color: "inherit" }}>{opt.key}</Text>}
                          </Box>
                          <div style={{ flex: 1, color: textColor, fontWeight: 500, fontSize: rem(14) }}>
                            <AlignedText text={opt.text} vocab={q.alignment?.vocab ?? {}} mode={lang} />
                          </div>
                          {isCorrectOpt && (
                            <Box style={{ padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#DCFCE7", flexShrink: 0 }}>
                              <Text size="xs" fw={700} c={CORRECT_DARK}>CORRECT</Text>
                            </Box>
                          )}
                          {isUserWrong && (
                            <Box style={{ padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#FEE2E2", flexShrink: 0 }}>
                              <Text size="xs" fw={700} c={WRONG_DARK}>YOUR ANSWER</Text>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                  {submitted && explanation && (
                    <Box className="answer-explanation-panel">
                      <Group gap={8} mb={rem(8)}>
                        <IconNotes size={18} stroke={1.5} color="#5F7D59" />
                        <Text className="answer-explanation-header" size="sm" fw={700}>Explanation</Text>
                      </Group>
                      <AlignedText
                        text={explanation}
                        vocab={lang === "zh"
                          ? (q.explanation_alignment?.vocab_zh ?? q.alignment?.vocab ?? {})
                          : vocabEnToVocab(q.explanation_alignment?.vocab_en ?? {})}
                        mode={lang}
                        block
                      />
                    </Box>
                  )}
                </Stack>
              );
            })()}

            {/* DT / XT: show summary + sentence rows (XT) + explanation */}
            {isFill && (
              <>
                <Box p="md" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                  <Text size="sm" c={MUTED}>
                    {group.type === "DT" ? "Paragraph fill-in-the-blank" : "Sentence word bank"} —{" "}
                    {!submitted
                      ? "Not attempted"
                      : groupIsCorrect
                      ? "All blanks correct"
                      : "Some blanks incorrect"}
                  </Text>
                </Box>

                {/* XT: sentence rows with filled blanks coloured by correctness */}
                {group.type === "XT" && submitted && (() => {
                  const wordChoices = group.questions[0].choices ?? [];
                  const getChoiceText = (key: string) =>
                    wordChoices.find((c) => c.key === key)?.text ?? key;
                  const getSentenceText = (q: ApiQuestion, qi: number): string => {
                    const qField = q.content_zh?.question;
                    if (!qField) return "";
                    if (typeof qField === "string") return qField;
                    const obj = qField as Record<string, string>;
                    return obj[String(q.question_number ?? qi + 1)] ?? Object.values(obj)[qi] ?? "";
                  };
                  return (
                    <Stack gap={rem(6)}>
                      {group.questions.map((q, qi) => {
                        const blankResult = submitResults[q.id]?.blank_results?.[0];
                        const userKey = blankResult?.user_answer ?? "";
                        const correctKey = blankResult?.correct_answer ?? "";
                        const isCorrect = blankResult?.correct ?? false;
                        const sentence = getSentenceText(q, qi);
                        const parts = sentence.split("____");
                        return (
                          <Box key={q.id} style={{
                            display: "flex", alignItems: "center", gap: rem(8),
                            padding: `${rem(10)} ${rem(14)}`, borderRadius: rem(10),
                            border: "1px solid #E2E8F0", backgroundColor: "white",
                          }}>
                            <span style={{
                              minWidth: rem(24), height: rem(24), borderRadius: "50%",
                              backgroundColor: SURFACE, display: "inline-flex", alignItems: "center",
                              justifyContent: "center", fontSize: rem(12), fontWeight: 700,
                              color: MUTED, flexShrink: 0,
                            }}>
                              {qi + 1}
                            </span>
                            <span style={{ fontSize: rem(15), color: INK, flex: 1, lineHeight: 1.8 }}>
                              {parts.length > 1 ? (
                                <>
                                  {parts[0]}
                                  <span style={{
                                    display: "inline-flex", alignItems: "center",
                                    padding: `${rem(2)} ${rem(10)}`, borderRadius: rem(8),
                                    margin: `0 ${rem(4)}`,
                                    border: `1.5px solid ${isCorrect ? CORRECT_BORDER : WRONG_BORDER}`,
                                    backgroundColor: isCorrect ? CORRECT_BG : WRONG_BG,
                                    color: isCorrect ? CORRECT_GREEN : WRONG_RED,
                                    fontWeight: 600, fontSize: rem(13),
                                  }}>
                                    {userKey ? getChoiceText(userKey) : "—"}
                                  </span>
                                  {!isCorrect && correctKey && (
                                    <span style={{ fontSize: rem(12), color: CORRECT_GREEN, fontWeight: 500, marginRight: rem(4) }}>
                                      → {getChoiceText(correctKey)}
                                    </span>
                                  )}
                                  {parts[1]}
                                </>
                              ) : sentence}
                            </span>
                          </Box>
                        );
                      })}
                    </Stack>
                  );
                })()}

                {/* Explanation — shown once (all questions share the same text) */}
                {submitted && (() => {
                  const explanation = group.questions
                    .map((q) => (lang === "zh" ? (q.explanation ?? q.explanation_en) : (q.explanation_en ?? q.explanation)))
                    .find(Boolean);
                  if (!explanation) return null;
                  const firstQ = group.questions[0];
                  return (
                    <Box className="answer-explanation-panel">
                      <Group gap={8} mb={rem(8)}>
                        <IconNotes size={18} stroke={1.5} color="#5F7D59" />
                        <Text className="answer-explanation-header" size="sm" fw={700}>Explanation</Text>
                      </Group>
                      <AlignedText
                        text={explanation}
                        vocab={lang === "zh"
                          ? (firstQ?.explanation_alignment?.vocab_zh ?? firstQ?.alignment?.vocab ?? {})
                          : vocabEnToVocab(firstQ?.explanation_alignment?.vocab_en ?? {})}
                        mode={lang}
                        block
                      />
                    </Box>
                  );
                })()}
              </>
            )}
          </Card>
        );
      })}

      {/* ── Prev / Next navigation ── */}
      <Group justify="space-between" align="center">
        <Button
          variant="outline"
          radius="xl"
          leftSection={<IconChevronLeft size={15} stroke={2} />}
          disabled={prevDisabledReview}
          onClick={handleReviewPrev}
          style={{ borderColor: "#E2E8F0", color: INK }}
        >
          Previous
        </Button>

        {/* Mini dot navigator */}
        <Group gap={rem(6)}>
          {questionGroups.map((g, i) => {
            const gCorrect = g.questions.every((q) => submitResults[q.id]?.correct === true);
            const gSubmitted = submittedSet.has(i);
            const dotColor = !gSubmitted ? "#CBD5E1" : gCorrect ? NAV_CORRECT : NAV_WRONG;
            return (
              <UnstyledButton
                key={i}
                onClick={() => { setCurrentReviewSubQ(0); setCurrentReviewQ(i); }}
                style={{
                  width: rem(i === currentReviewQ ? 22 : 8),
                  height: rem(8),
                  borderRadius: rem(999),
                  backgroundColor: i === currentReviewQ ? INK : dotColor,
                  transition: "all 200ms ease",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </Group>

        <Button
          radius="xl"
          rightSection={<IconChevronRight size={15} stroke={2} />}
          disabled={nextDisabledReview}
          onClick={handleReviewNext}
          style={{
            backgroundColor: nextDisabledReview ? SURFACE : INK,
            color: nextDisabledReview ? MUTED : "white",
            fontWeight: 600,
          }}
        >
          Next
        </Button>
      </Group>
    </Stack>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const isReview = searchParams.get("review") === "true";
  const topicName = searchParams.get("topic") ?? "";
  const sessionNameParam = searchParams.get("name") ?? "";
  const subjectParam = searchParams.get("subject") ?? "";

  const setSessionName = useNavStore((s) => s.setSessionName);

  // Push session name into the global nav store so the breadcrumb can display it.
  // Set immediately from URL param or topic name so breadcrumb is never empty while loading.
  useEffect(() => {
    setSessionName(sessionNameParam || topicName || "Practice Set");
    return () => setSessionName("");
  }, [sessionNameParam, topicName, setSessionName]);

  const [currentQ, setCurrentQ] = useState(0);
  const [currentSubQ, setCurrentSubQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set());
  const [flaggedSet, setFlaggedSet] = useState<Set<string>>(new Set()); // question IDs
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set()); // question IDs
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [subjectCode, setSubjectCode] = useState(subjectParam);
  const zhOnly = subjectCode === "WH" || subjectCode === "LH";
  const [lang, setLang] = useState<Lang>(subjectParam === "WH" || subjectParam === "LH" ? "zh" : "en");
  const [reportOpen, setReportOpen] = useState(false);

  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [fillAnswers, setFillAnswers] = useState<FillAnswerMap>({});
  const [submittedGroups, setSubmittedGroups] = useState<Set<number>>(new Set());
  const [submitResults, setSubmitResults] = useState<Record<string, SubmitResult>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  // ── Load session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const fetch = isReview ? fetchSessionReview(sessionId) : fetchSessionQuestions(sessionId);
    fetch
      .then((result) => {
        const { groups, restored, fillAnswers: restoredFill } = result;
        if ("xpEarned" in result) setXpEarned((result as { xpEarned: number }).xpEarned);
        // Update with the canonical name and subject from the API
        if (result.sessionName) setSessionName(result.sessionName);
        if (result.subjectCode) {
          setSubjectCode(result.subjectCode);
          if (result.subjectCode === "WH" || result.subjectCode === "LH") setLang("zh");
        }
        setQuestionGroups(groups);
        setAnswers(restored.answers as Record<string, string>);
        setSubmittedIds(restored.submittedIds);
        setSubmittedGroups(restored.submittedGroupIndices);
        setSubmitResults(restored.submitResults);
        setFillAnswers(restoredFill);
        const submittedSetInit = new Set<number>();
        restored.submittedGroupIndices.forEach((i) => submittedSetInit.add(i));
        restored.submittedIds.forEach((qid) => {
          groups.forEach((g, gi) => {
            if (g.questions.some((q) => q.id === qid)) submittedSetInit.add(gi);
          });
        });
        setSubmittedSet(submittedSetInit);
        // Review mode: skip straight to the summary view
        if (isReview) {
          setFinished(true);
        } else {
          // Jump to the first unanswered group so the user doesn't have to scroll past done questions
          const firstUnanswered = groups.findIndex((_, gi) => !submittedSetInit.has(gi));
          if (firstUnanswered > 0) setCurrentQ(firstUnanswered);
        }
      })
      .catch((err) => {
        console.error("Failed to load session:", err);
        setLoadError("Failed to load session. Please try again.");
      })
      .finally(() => setLoading(false));

    fetchBookmarkedIds(sessionId)
      .then(setBookmarked)
      .catch((err) => console.error("Failed to load bookmarks:", err));
  }, [sessionId, isReview]);

  const activeGroup: QuestionGroup | null = questionGroups[currentQ] ?? null;
  const activeType = activeGroup?.type ?? "JF";

  function updateFillAnswer(questionId: string, blankIdx: string, choiceKey: string) {
    setFillAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? {}), [blankIdx]: choiceKey },
    }));
    // Auto-advance to the next unfilled question in an XT group
    if (choiceKey && activeGroup?.type === "XT") {
      const groupQs = activeGroup.questions;
      const qIdx = groupQs.findIndex((q) => q.id === questionId);
      for (let i = qIdx + 1; i < groupQs.length; i++) {
        if (!Object.values(fillAnswers[groupQs[i].id] ?? {}).some(Boolean)) {
          setCurrentSubQ(i);
          break;
        }
      }
    }
  }

  async function handleSubmitGroup(groupIdx: number) {
    if (submittedGroups.has(groupIdx) || !activeGroup || submitting) return;
    const groupId = activeGroup.group_id;
    if (!groupId) return;

    const answersMap: Record<string, Record<string, string>> = {};
    for (const q of activeGroup.questions) {
      answersMap[q.id] = fillAnswers[q.id] ?? {};
    }

    setSubmitting(true);
    try {
      const { results, explanation, explanation_en, explanation_alignment } = await submitQuestionGroup(sessionId, groupId, answersMap);
      if (explanation || explanation_en || explanation_alignment) {
        setQuestionGroups((prev) => prev.map((g, gi) => {
          if (gi !== groupIdx) return g;
          return {
            ...g,
            questions: g.questions.map((q, qi) => ({
              ...q,
              ...(qi === 0 && explanation ? { explanation } : {}),
              ...(qi === 0 && explanation_en ? { explanation_en } : {}),
              ...(explanation_alignment?.[q.id] ? { explanation_alignment: explanation_alignment[q.id] } : {}),
            })),
          };
        }));
      }
      setSubmitResults((prev) => ({ ...prev, ...results }));
    } catch (err) {
      console.error("Group submit failed:", err);
    } finally {
      setSubmitting(false);
    }

    setSubmittedGroups((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
    setSubmittedSet((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
  }

  async function handleSubmitDT(groupIdx: number) {
    if (submittedGroups.has(groupIdx) || !activeGroup || submitting) return;
    const groupId = activeGroup.group_id;
    if (!groupId) return;

    const answersMap: Record<string, Record<string, string>> = {};
    for (const aq of activeGroup.questions) {
      answersMap[aq.id] = fillAnswers[aq.id] ?? {};
    }

    setSubmitting(true);
    try {
      const { results, explanation, explanation_en, explanation_alignment } = await submitQuestionGroup(sessionId, groupId, answersMap);
      if (explanation || explanation_en || explanation_alignment) {
        setQuestionGroups((prev) => prev.map((g, gi) => {
          if (gi !== groupIdx) return g;
          return {
            ...g,
            questions: g.questions.map((aq, qi) => ({
              ...aq,
              ...(qi === 0 && explanation ? { explanation } : {}),
              ...(qi === 0 && explanation_en ? { explanation_en } : {}),
              ...(explanation_alignment?.[aq.id] ? { explanation_alignment: explanation_alignment[aq.id] } : {}),
            })),
          };
        }));
      }
      setSubmitResults((prev) => ({ ...prev, ...results }));
    } catch (err) {
      console.error("DT submit failed:", err);
    } finally {
      setSubmitting(false);
    }

    setSubmittedGroups((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
    setSubmittedSet((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
  }

  function handlePassageAnswer(questionId: string, key: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  }

  async function handlePassageSubmit(questionId: string) {
    if (submittedIds.has(questionId) || submitting) return;
    setSubmitting(true);
    setSubmittedIds((prev) => { const next = new Set(prev); next.add(questionId); return next; });

    const selectedKey = answers[questionId] ?? "";

    try {
      const result = await submitSingleQuestion(sessionId, questionId, selectedKey);
      if (result.explanation || result.explanation_en || result.explanation_alignment) {
        setQuestionGroups((prev) => prev.map((g) => ({
          ...g,
          questions: g.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  explanation: result.explanation,
                  explanation_en: result.explanation_en,
                  explanation_alignment: result.explanation_alignment ?? q.explanation_alignment,
                }
              : q
          ),
        })));
      }
      setSubmitResults((prev) => ({ ...prev, [questionId]: result }));
      // Mark the group as submitted when all its questions are answered
      const groupIdx = questionGroups.findIndex((g) => g.questions.some((q) => q.id === questionId));
      if (groupIdx >= 0) {
        const group = questionGroups[groupIdx];
        const allDone = group.questions.every((q) => q.id === questionId || submittedIds.has(q.id));
        if (allDone) setSubmittedSet((prev) => { const next = new Set(prev); next.add(groupIdx); return next; });
      }
    } catch (err) {
      console.error("Single submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Timer — stops when finished
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [finished]);

  function handlePrev() {
    if ((activeType === "YL" || activeType === "JF" || activeType === "SH" || activeType === "BY") && currentSubQ > 0) {
      setCurrentSubQ((q) => q - 1);
      return;
    }
    if (currentQ === 0) return;
    const prevIdx = currentQ - 1;
    const prevGroup = questionGroups[prevIdx];
    if (prevGroup && (prevGroup.type === "YL" || prevGroup.type === "JF" || prevGroup.type === "SH" || prevGroup.type === "BY") && prevGroup.questions.length > 1) {
      setCurrentSubQ(prevGroup.questions.length - 1);
    } else {
      setCurrentSubQ(0);
    }
    setCurrentQ(prevIdx);
  }

  function handleNext() {
    if ((activeType === "YL" || activeType === "JF" || activeType === "SH" || activeType === "BY") && activeGroup && currentSubQ < activeGroup.questions.length - 1) {
      setCurrentSubQ((q) => q + 1);
      return;
    }
    setCurrentSubQ(0);
    if (currentQ < questionGroups.length - 1) setCurrentQ((q) => q + 1);
  }

  function handleJump(groupIdx: number, subQIdx: number = 0) {
    setCurrentSubQ(subQIdx);
    setCurrentQ(groupIdx);
  }

  function toggleFlag() {
    const qId = activeGroup?.questions[currentSubQ]?.id;
    if (!qId) return;
    setFlaggedSet((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }

  async function toggleBookmark() {
    const qId = activeGroup?.questions[currentSubQ]?.id;
    if (!qId) return;
    const wasBookmarked = bookmarked.has(qId);

    setBookmarked((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(qId);
      else next.add(qId);
      return next;
    });

    try {
      if (wasBookmarked) await removeBookmark(qId);
      else await addBookmark(qId, sessionId);
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      // revert on failure
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(qId);
        else next.delete(qId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh" }}>
        <Stack align="center" gap="md">
          <div style={{
            width: rem(40), height: rem(40), borderRadius: "50%",
            border: `3px solid ${PRIMARY}`, borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }} />
          <Text size="sm" c={MUTED}>Loading session…</Text>
        </Stack>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh" }}>
        <Stack align="center" gap="md">
          <IconAlertCircle size={40} color={WRONG_RED} stroke={1.5} />
          <Text size="sm" c={WRONG_DARK} fw={600}>{loadError}</Text>
          <Button variant="outline" color="dark" radius="md" onClick={() => router.push("/practice")}>
            Back to Practice Sets
          </Button>
        </Stack>
      </Box>
    );
  }

  if (finished) {
    return (
      <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
          <SummaryView
            questionGroups={questionGroups}
            submitResults={submitResults}
            submittedSet={submittedSet}
            answers={answers}
            totalSeconds={elapsedSeconds}
            lang={lang}
            xpEarned={xpEarned}
            topicName={topicName}
            onBack={() => router.push("/practice")}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>
          {/* ── Left column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Question Card */}
            <Card p="lg" className="no-select">
              {/* Header row */}
              <Group justify="space-between" align="center" mb="md" wrap="nowrap">
                <Group gap={rem(8)} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Badge size="sm" style={{ backgroundColor: INK, color: "white", fontWeight: 700, borderRadius: rem(999), flexShrink: 0 }}>
                    Problem {currentQ + 1}
                  </Badge>
                  {(activeType === "YL" || activeType === "JF" || activeType === "SH" || activeType === "BY") && activeGroup && activeGroup.questions.length > 1 && (
                    <Badge size="sm" style={{ backgroundColor: SURFACE, color: MUTED, fontWeight: 600, borderRadius: rem(999), flexShrink: 0 }}>
                      {currentSubQ + 1}/{activeGroup.questions.length}
                    </Badge>
                  )}
                  <Badge size="sm" style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600, borderRadius: rem(999), flexShrink: 0 }}>
                    {topicName || activeType}
                  </Badge>
                </Group>
                <Group gap={rem(6)} wrap="nowrap" style={{ flexShrink: 0 }}>
                  {!zhOnly && <LanguageToggle lang={lang} onChange={setLang} />}
                  {(() => {
                    const isFlaggedCurrent = flaggedSet.has(activeGroup?.questions[currentSubQ]?.id ?? "");
                    return (
                      <Tooltip label={isFlaggedCurrent ? "Remove flag" : "Flag question"} withArrow>
                        <UnstyledButton onClick={toggleFlag} style={{
                          width: rem(32), height: rem(32), borderRadius: rem(8),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: isFlaggedCurrent ? "#FFF9EC" : SURFACE,
                        }}>
                          {isFlaggedCurrent ? <IconFlagFilled size={16} color={PRIMARY} /> : <IconFlag size={16} color={MUTED} />}
                        </UnstyledButton>
                      </Tooltip>
                    );
                  })()}
                  {(() => {
                    const isBookmarkedCurrent = bookmarked.has(activeGroup?.questions[currentSubQ]?.id ?? "");
                    return (
                      <Tooltip label={isBookmarkedCurrent ? "Remove bookmark" : "Bookmark question"} withArrow>
                        <UnstyledButton onClick={toggleBookmark} style={{
                          width: rem(32), height: rem(32), borderRadius: rem(8),
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: isBookmarkedCurrent ? "#FFF9EC" : SURFACE,
                        }}>
                          {isBookmarkedCurrent ? <IconBookmarkFilled size={16} color={PRIMARY} /> : <IconBookmark size={16} color={MUTED} />}
                        </UnstyledButton>
                      </Tooltip>
                    );
                  })()}
                  <Tooltip label="Report a problem" withArrow>
                    <UnstyledButton onClick={() => setReportOpen(true)} style={{
                      width: rem(32), height: rem(32), borderRadius: rem(8),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: SURFACE,
                    }}>
                      <IconAlertCircle size={16} color={MUTED} stroke={1.5} />
                    </UnstyledButton>
                  </Tooltip>
                  <Group gap={rem(5)} style={{ flexShrink: 0 }}>
                    <IconClock size={15} color={MUTED} stroke={1.5} />
                    <Text size="sm" fw={600} c={MUTED} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatTime(elapsedSeconds)}
                    </Text>
                  </Group>
                </Group>
              </Group>

              {/* ── Question body — branches on type ── */}
              {activeType === "DT" && activeGroup ? (
                <>
                  <DragDropParagraph
                    questionText={(() => {
                      const content = lang === "zh"
                        ? activeGroup.questions[0].content_zh
                        : activeGroup.questions[0].content_en;
                      const q = content?.question ?? activeGroup.questions[0].content_zh?.question;
                      if (!q) return "";
                      if (typeof q === "string") return q;
                      return Object.values(q as Record<string, string>)[0] ?? "";
                    })()}
                    wordChoices={activeGroup.questions[0].choices ?? []}
                    userAnswers={Object.fromEntries(
                      activeGroup.questions.map((q, i) => [String(i + 1), fillAnswers[q.id]?.["1"] ?? ""])
                    )}
                    submitted={submittedGroups.has(currentQ)}
                    blankResults={submitResults[activeGroup.questions[0].id]?.blank_results}
                    onChange={(blankIdx, choiceKey) => {
                      const qIdx = parseInt(blankIdx) - 1;
                      const qId = activeGroup.questions[qIdx]?.id ?? activeGroup.questions[0].id;
                      updateFillAnswer(qId, "1", choiceKey);
                    }}
                  />
                  {submittedGroups.has(currentQ) && (() => {
                    const q0 = activeGroup.questions[0];
                    const dtExplanation = lang === "zh" ? (q0.explanation ?? q0.explanation_en) : (q0.explanation_en ?? q0.explanation);
                    if (!dtExplanation) return null;
                    return (
                      <Box mt="md" className="answer-explanation-panel">
                        <Group gap={8} mb={rem(10)}>
                          <IconNotes size={18} stroke={1.5} color="#5F7D59" />
                          <Text className="answer-explanation-header" size="sm" fw={700}>Answer Key &amp; Explanation</Text>
                        </Group>
                        <AlignedText
                          text={dtExplanation}
                          vocab={lang === "zh"
                            ? (q0.explanation_alignment?.vocab_zh ?? q0.alignment?.vocab ?? {})
                            : vocabEnToVocab(q0.explanation_alignment?.vocab_en ?? {})}
                          mode={lang}
                          block
                        />
                      </Box>
                    );
                  })()}
                </>
              ) : activeType === "XT" && activeGroup ? (
                <WordBankSet
                  questions={activeGroup.questions}
                  wordChoices={activeGroup.questions[0].choices ?? []}
                  userAnswers={fillAnswers}
                  submitted={submittedGroups.has(currentQ)}
                  results={submitResults}
                  lang={lang}
                  highlightIdx={currentSubQ}
                  flaggedQIds={flaggedSet}
                  onChange={updateFillAnswer}
                  onSubmitSet={() => handleSubmitGroup(currentQ)}
                />
              ) : (activeType === "YL" || activeType === "JF" || activeType === "SH" || activeType === "BY") && activeGroup ? (
                <PassageQuestionGroup
                  passage={activeGroup.passage ?? activeGroup.questions[0]?.passage ?? ""}
                  passageVocab={activeGroup.passage_alignment?.vocab ?? {}}
                  questions={[activeGroup.questions[currentSubQ]].filter(Boolean) as typeof activeGroup.questions}
                  startIndex={currentSubQ}
                  userAnswers={answers}
                  submittedIds={submittedIds}
                  results={submitResults}
                  lang={lang}
                  submitting={submitting}
                  onAnswer={handlePassageAnswer}
                  onSubmit={handlePassageSubmit}
                />
              ) : null}
            </Card>

            {/* Navigation buttons */}
            {(() => {
              const isYLorJF = activeType === "YL" || activeType === "JF" || activeType === "SH" || activeType === "BY";
              const hasMoreSubQ = isYLorJF && activeGroup && currentSubQ < activeGroup.questions.length - 1;
              const isLastGroup = currentQ === questionGroups.length - 1;
              const showFinish = isLastGroup && !hasMoreSubQ;
              const prevDisabled = currentQ === 0 && (!isYLorJF || currentSubQ === 0);

              return (
            <Group justify="space-between" align="center">
              <Button
                variant="outline"
                radius="xl"
                leftSection={<IconChevronLeft size={15} stroke={2} />}
                disabled={prevDisabled}
                onClick={handlePrev}
                style={{ borderColor: "#E2E8F0", color: INK }}
              >
                Previous
              </Button>

              {/* Submit button — all types */}
              {(() => {
                const submittedBtn = (
                  <Button disabled radius="md" leftSection={<IconCheck size={15} stroke={2.5} />}
                    style={{ backgroundColor: SURFACE, color: MUTED, cursor: "default" }}>
                    Submitted
                  </Button>
                );
                const submitBtn = (enabled: boolean, onClick: () => void) => (
                  <Button
                    radius="md"
                    onClick={onClick}
                    disabled={!enabled || submitting}
                    loading={submitting}
                    loaderProps={{ type: "dots", color: "white" }}
                    style={{
                      backgroundColor: enabled && !submitting ? PRIMARY : SURFACE,
                      color: enabled && !submitting ? "white" : MUTED,
                      fontWeight: 600,
                    }}
                  >
                    Submit
                  </Button>
                );

                if (activeType === "DT") {
                  const dtId = activeGroup?.questions[0].id ?? "";
                  const dtEnabled = Object.keys(fillAnswers[dtId] ?? {}).length > 0;
                  return submittedGroups.has(currentQ) ? submittedBtn : submitBtn(dtEnabled, () => handleSubmitDT(currentQ));
                }
                if (activeType === "XT") {
                  const xtEnabled = activeGroup?.questions.every((q) => {
                    const qField = q.content_zh?.question;
                    if (typeof qField !== "string") return Boolean(fillAnswers[q.id]?.["1"]);
                    const blanks = [...qField.matchAll(/\{(\d+)\}/g)].map((m) => m[1]);
                    if (blanks.length === 0) return Boolean(fillAnswers[q.id]?.["1"]);
                    return blanks.every((idx) => Boolean(fillAnswers[q.id]?.[idx]));
                  }) ?? false;
                  return submittedGroups.has(currentQ) ? submittedBtn : submitBtn(xtEnabled, () => handleSubmitGroup(currentQ));
                }
                if (isYLorJF) {
                  const pq = activeGroup?.questions[currentSubQ];
                  const pqId = pq?.id ?? "";
                  const pEnabled = Boolean(answers[pqId]);
                  return submittedIds.has(pqId) ? submittedBtn : submitBtn(pEnabled, () => handlePassageSubmit(pqId));
                }
                return null;
              })()}

              {showFinish ? (
                <Button
                  radius="xl"
                  leftSection={finishing ? undefined : <IconCheck size={15} stroke={2.5} />}
                  loading={finishing}
                  loaderProps={{ type: "dots", color: "white" }}
                  disabled={finishing}
                  onClick={async () => {
                    setFinishing(true);
                    try {
                      await completeSession(sessionId);
                      // Fetch authoritative results from the review endpoint
                      const { groups, restored, fillAnswers: reviewFill, xpEarned: xp } = await fetchSessionReview(sessionId);
                      setXpEarned(xp);
                      setQuestionGroups(groups);
                      setAnswers(restored.answers as Record<string, string>);
                      setSubmittedIds(restored.submittedIds);
                      setSubmittedGroups(restored.submittedGroupIndices);
                      setSubmitResults(restored.submitResults);
                      setFillAnswers(reviewFill);
                      // Mark all groups submitted for the summary
                      const allSubmitted = new Set<number>(groups.map((_, i) => i));
                      setSubmittedSet(allSubmitted);
                    } catch (err) {
                      console.error("Failed to load review after completing:", err);
                    }
                    setFinished(true);
                  }}
                  style={{ backgroundColor: CORRECT_GREEN, color: "white", fontWeight: 600 }}
                >
                  Finish
                </Button>
              ) : (
                <Button
                  radius="xl"
                  rightSection={<IconChevronRight size={15} stroke={2} />}
                  onClick={handleNext}
                  style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                >
                  {hasMoreSubQ ? "Next" : "Next Question"}
                </Button>
              )}
            </Group>
              );
            })()}
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(272), flexShrink: 0 }}>
            <Stack gap="md">
              <ProgressCard
                submittedSet={submittedSet}
                submitResults={submitResults}
                questionGroups={questionGroups}
                flaggedSet={flaggedSet}
                fillAnswers={fillAnswers}
                answers={answers}
              />
              <QuestionNavigator
                currentQ={currentQ}
                currentSubQ={currentSubQ}
                submitResults={submitResults}
                questionGroups={questionGroups}
                flaggedSet={flaggedSet}
                fillAnswers={fillAnswers}
                answers={answers}
                onJump={handleJump}
              />
            </Stack>
          </Box>
        </Group>
      </Box>

      <ReportModal
        opened={reportOpen}
        onClose={() => setReportOpen(false)}
        questionId={activeGroup?.questions[currentSubQ]?.id ?? activeGroup?.questions[0]?.id}
        sessionId={sessionId}
      />

      <FloatingChatbot
        sessionId={sessionId}
        questionId={activeGroup?.questions[currentSubQ]?.id ?? activeGroup?.questions[0]?.id ?? ""}
      />
    </Box>
  );
}
