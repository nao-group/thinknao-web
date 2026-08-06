"use client";

import { rem, Stack, Text, Group, Box } from "@mantine/core";
import { IconNotes, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import {
  INK, SURFACE, MUTED, PRIMARY,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
} from "@/constants/colors";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import type { ApiQuestion, SubmitResult } from "./types";

interface PassageQuestionGroupProps {
  passage: string;
  questions: ApiQuestion[];
  userAnswers: Record<string, string>;
  submittedIds: Set<string>;
  results?: Record<string, SubmitResult>;
  lang: "en" | "zh";
  onAnswer: (questionId: string, key: string) => void;
  onSubmit: (questionId: string) => void;
}

// ─── Option button — same design as page.tsx's OptionButton ──────────────────

function PassageOption({
  optKey, text, selected, submitted, isCorrect, isUserAnswer, onClick,
}: {
  optKey: string;
  text: string;
  selected: boolean;
  submitted: boolean;
  isCorrect: boolean;
  isUserAnswer: boolean;
  onClick: () => void;
}) {
  let containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: rem(12),
    padding: `${rem(14)} ${rem(16)}`,
    borderRadius: rem(10),
    border: "1.5px solid #E2E8F0",
    backgroundColor: "white",
    cursor: submitted ? "default" : "pointer",
    width: "100%",
    transition: "all 150ms ease",
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

  let textColor = INK;
  let rightBadge: React.ReactNode = null;

  if (!submitted) {
    if (selected) {
      containerStyle = { ...containerStyle, backgroundColor: "#FFF9EC", border: `2px solid ${PRIMARY}` };
      circleStyle = { ...circleStyle, backgroundColor: PRIMARY, color: INK };
    }
  } else {
    if (isCorrect) {
      containerStyle = { ...containerStyle, backgroundColor: CORRECT_BG, border: `1.5px solid ${CORRECT_BORDER}` };
      circleStyle = { ...circleStyle, backgroundColor: CORRECT_GREEN, color: "white" };
      textColor = CORRECT_DARK;
      rightBadge = (
        <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#DCFCE7", flexShrink: 0 }}>
          <Text size="xs" fw={700} c={CORRECT_DARK}>CORRECT</Text>
        </Box>
      );
    } else if (isUserAnswer) {
      containerStyle = { ...containerStyle, backgroundColor: WRONG_BG, border: `1.5px solid ${WRONG_BORDER}` };
      circleStyle = { ...circleStyle, backgroundColor: WRONG_RED, color: "white" };
      textColor = WRONG_DARK;
      rightBadge = (
        <Box style={{ marginLeft: "auto", padding: `${rem(2)} ${rem(8)}`, borderRadius: rem(999), backgroundColor: "#FEE2E2", flexShrink: 0 }}>
          <Text size="xs" fw={700} c={WRONG_DARK}>YOUR ANSWER</Text>
        </Box>
      );
    } else {
      containerStyle = { ...containerStyle, backgroundColor: "white", border: "1.5px solid #F1F5F9" };
      circleStyle = { ...circleStyle, color: "#CBD5E1" };
      textColor = "#94A3B8";
    }
  }

  return (
    <Box style={containerStyle} onClick={submitted ? undefined : onClick}>
      <Box style={circleStyle}>
        {submitted && isCorrect ? (
          <IconCircleCheck size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : submitted && isUserAnswer && !isCorrect ? (
          <IconCircleX size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : (
          <Text size="xs" fw={700} style={{ color: "inherit" }}>{optKey}</Text>
        )}
      </Box>
      <Text size="md" fw={500} c={textColor} style={{ flex: 1 }}>{text}</Text>
      {rightBadge}
    </Box>
  );
}

// ─── Passage box ──────────────────────────────────────────────────────────────

function PassageBox({ passage }: { passage: string }) {
  return (
    <Box
      p="md"
      style={{
        backgroundColor: SURFACE,
        borderRadius: rem(10),
        border: "1.5px solid #E2E8F0",
        lineHeight: 1.9,
        fontSize: rem(15),
        color: INK,
        marginBottom: rem(4),
      }}
    >
      <Text size="xs" fw={700} c={MUTED} mb={rem(6)} style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Passage / 阅读材料
      </Text>
      <div style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: passage }} />
    </Box>
  );
}

// ─── Explanation box — same amber design as standard ExplanationBox ───────────

function PassageExplanationBox({
  correctStatement,
  explanation,
}: {
  correctStatement: string;
  explanation?: string;
}) {
  return (
    <Box
      mt="md"
      style={{
        backgroundColor: "#FFF9EC",
        borderLeft: `4px solid ${PRIMARY}`,
        borderRadius: rem(10),
        padding: rem(20),
      }}
    >
      <Group gap={8} mb={rem(10)}>
        <IconNotes size={18} stroke={1.5} color={PRIMARY} />
        <Text size="sm" fw={700} c={PRIMARY}>Answer Key &amp; Explanation</Text>
      </Group>
      <Text size="md" fw={700} c={CORRECT_DARK} mb={rem(explanation ? 12 : 0)}>
        Correct Answer: {correctStatement}
      </Text>
      {explanation && <MarkdownLatexText>{explanation}</MarkdownLatexText>}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PassageQuestionGroup({
  passage,
  questions,
  userAnswers,
  submittedIds,
  results,
  lang,
  onAnswer,
  onSubmit,
}: PassageQuestionGroupProps) {
  function getQuestionText(q: ApiQuestion): string {
    const content = lang === "zh" ? q.content_zh : q.content_en;
    return (content?.question as string) ?? "";
  }

  function getOptions(q: ApiQuestion): Array<{ key: string; text: string }> {
    const content = lang === "zh" ? q.content_zh : q.content_en;
    const choices = content?.choices as Record<string, string> | undefined;
    if (!choices) return [];
    return Object.entries(choices).map(([key, text]) => ({ key, text }));
  }

  function getExplanation(q: ApiQuestion): string | undefined {
    return (q.content_zh.explanation ?? q.content_en.explanation) as string | undefined;
  }

  return (
    <Stack gap={rem(24)}>
      {questions.map((q, qi) => {
        const submitted = submittedIds.has(q.id);
        const result = results?.[q.id];
        const selected = userAnswers[q.id] ?? "";
        const correctAnswer = result?.correct_answer ?? (q.content_zh.correct_answer as string | undefined) ?? (q.content_en.correct_answer as string | undefined) ?? "";
        const options = getOptions(q);
        const explanation = getExplanation(q);

        return (
          <Stack key={q.id} gap={rem(12)}>
            {/* Passage above each question */}
            <PassageBox passage={passage} />

            {/* Question card */}
            <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              {/* Question number + text */}
              <Group gap={rem(10)} mb="md" align="flex-start">
                <Box
                  style={{
                    minWidth: rem(28), height: rem(28), borderRadius: "50%",
                    backgroundColor: "#F0F4FF", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: rem(13), fontWeight: 700,
                    color: "#6670B0", flexShrink: 0,
                  }}
                >
                  {qi + 1}
                </Box>
                <Text size="md" fw={500} c={INK} style={{ lineHeight: 1.7, flex: 1 }}>
                  {getQuestionText(q)}
                </Text>
              </Group>

              {/* Options */}
              <Stack gap={rem(8)} mb="md">
                {options.map((opt) => (
                  <PassageOption
                    key={opt.key}
                    optKey={opt.key}
                    text={opt.text}
                    selected={selected === opt.key}
                    submitted={submitted}
                    isCorrect={submitted && opt.key === correctAnswer}
                    isUserAnswer={submitted && selected === opt.key}
                    onClick={() => onAnswer(q.id, opt.key)}
                  />
                ))}
              </Stack>

              {/* Explanation after submit */}
              {submitted && (
                <PassageExplanationBox
                  correctStatement={`${correctAnswer} — ${options.find((o) => o.key === correctAnswer)?.text ?? ""}`}
                  explanation={explanation}
                />
              )}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
}
