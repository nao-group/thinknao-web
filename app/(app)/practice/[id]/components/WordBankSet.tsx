"use client";

import { Box, Group, rem, Stack, Text } from "@mantine/core";
import { IconNotes } from "@tabler/icons-react";
import { MarkdownLatexText } from "@/components/markdown-latex-text";
import {
  INK, SURFACE, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN,
  WRONG_BG, WRONG_BORDER, WRONG_RED,
} from "@/constants/colors";
import type { ApiQuestion, WordChoice, FillAnswerMap, BlankResult, SubmitResult } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WordBankSetProps {
  /** All sibling questions in the XT group */
  questions: ApiQuestion[];
  /** Shared word bank — choices used once, removed from pool */
  wordChoices: WordChoice[];
  /** questionId → { blankIndex → choiceKey } */
  userAnswers: FillAnswerMap;
  submitted: boolean;
  /** questionId → SubmitResult (populated after submit) */
  results?: Record<string, SubmitResult>;
  lang: "en" | "zh";
  /** 0-based index of the sentence to highlight (from question navigator) */
  highlightIdx?: number;
  /** Set of question IDs that are flagged (per-question, not per-group) */
  flaggedQIds?: Set<string>;
  onChange: (questionId: string, blankIndex: string, choiceKey: string) => void;
  onSubmitSet: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Supports two blank formats:
 *  - Old:  "text{1}more{2}end"  →  blank value = "1", "2", …
 *  - Real API:  "text____more"  →  blank value = "1" (one blank per sentence)
 */
function parseSegments(text: string): Array<{ type: "text" | "blank"; value: string }> {
  if (/\{\d+\}/.test(text)) {
    const parts = text.split(/(\{\d+\})/g);
    return parts.map((part) => {
      const m = part.match(/^\{(\d+)\}$/);
      return m ? { type: "blank" as const, value: m[1] } : { type: "text" as const, value: part };
    });
  }
  // ____ format — one blank per sentence, always index "1"
  const parts = text.split("____");
  const result: Array<{ type: "text" | "blank"; value: string }> = [];
  parts.forEach((part, i) => {
    result.push({ type: "text" as const, value: part });
    if (i < parts.length - 1) result.push({ type: "blank" as const, value: "1" });
  });
  return result;
}

/**
 * Extract the sentence text for a given question + its index in the group.
 *
 * Real API: content_zh.question = { "1": "sent1", "2": "sent2", … }
 * Old mock: content_zh.question = "sentence with {1} placeholder"
 */
function getQuestionText(q: ApiQuestion, lang: "en" | "zh", qi: number): string {
  function extract(content: ApiQuestion["content_zh"] | ApiQuestion["content_en"]): string {
    const qField = content?.question;
    if (!qField) return "";
    if (typeof qField === "string") return qField;
    const obj = qField as Record<string, string>;
    const sentenceKey = String(q.question_number ?? qi + 1);
    return obj[sentenceKey] ?? Object.values(obj)[qi] ?? "";
  }
  // Try requested language first, fall back to zh
  const primary = lang === "zh" ? q.content_zh : q.content_en;
  return extract(primary) || extract(q.content_zh);
}

/** All choice keys currently placed across all blanks in the set */
function allPlacedKeys(userAnswers: FillAnswerMap): Set<string> {
  const keys = new Set<string>();
  for (const blanks of Object.values(userAnswers)) {
    for (const key of Object.values(blanks)) {
      if (key) keys.add(key);
    }
  }
  return keys;
}

function allBlanksFilledForSet(questions: ApiQuestion[], userAnswers: FillAnswerMap): boolean {
  return questions.every((q) => {
    const qField = q.content_zh?.question;
    if (typeof qField !== "string") {
      // Real API format: each question has exactly one blank at index "1"
      return Boolean(userAnswers[q.id]?.["1"]);
    }
    const blanks = [...qField.matchAll(/\{(\d+)\}/g)].map((m) => m[1]);
    if (blanks.length === 0) return Boolean(userAnswers[q.id]?.["1"]);
    return blanks.every((idx) => Boolean(userAnswers[q.id]?.[idx]));
  });
}

// ─── Single sentence row ──────────────────────────────────────────────────────

function SentenceRow({
  questionIndex,
  questionText,
  questionId,
  userAnswers,
  wordChoices,
  submitted,
  blankResults,
  isHighlighted = false,
  isFlagged = false,
  onDrop,
  onClear,
}: {
  questionIndex: number;
  questionText: string;
  questionId: string;
  userAnswers: Record<string, string>;
  wordChoices: WordChoice[];
  submitted: boolean;
  blankResults?: BlankResult[];
  isHighlighted?: boolean;
  isFlagged?: boolean;
  onDrop: (blankIdx: string, key: string) => void;
  onClear: (blankIdx: string) => void;
}) {
  const segments = parseSegments(questionText);

  function getBlankResult(idx: string): BlankResult | undefined {
    return blankResults?.find((r) => r.blank_index === idx);
  }

  function blankStyle(idx: string): React.CSSProperties {
    if (!submitted) {
      const filled = Boolean(userAnswers[idx]);
      return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: rem(68),
        minHeight: rem(28),
        padding: `${rem(3)} ${rem(10)}`,
        borderRadius: rem(8),
        border: `1.5px dashed ${filled ? "#93C5FD" : isFlagged ? "#F59E0B" : MUTED}`,
        backgroundColor: filled ? "#EFF6FF" : isFlagged ? "#FFF9EC" : SURFACE,
        cursor: filled ? "pointer" : "default",
        verticalAlign: "middle",
        margin: `0 ${rem(4)}`,
        fontSize: rem(14),
        fontWeight: 500,
        color: INK,
        transition: "all 150ms ease",
      };
    }

    const result = getBlankResult(idx);
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: rem(68),
      minHeight: rem(28),
      padding: `${rem(3)} ${rem(10)}`,
      borderRadius: rem(8),
      border: `1.5px solid ${result?.correct ? CORRECT_BORDER : WRONG_BORDER}`,
      backgroundColor: result?.correct ? CORRECT_BG : WRONG_BG,
      verticalAlign: "middle",
      margin: `0 ${rem(4)}`,
      fontSize: rem(14),
      fontWeight: 600,
      color: result?.correct ? CORRECT_GREEN : WRONG_RED,
      cursor: "default",
    };
  }

  function getChoiceText(key: string): string {
    return wordChoices.find((c) => c.key === key)?.text ?? key;
  }

  const rowBorder = isHighlighted
    ? `2px solid ${INK}`
    : isFlagged
    ? `2px solid #F59E0B`
    : "1px solid #E2E8F0";
  const rowBg = isHighlighted ? "#F8FAFC" : isFlagged ? "#FFFBEB" : "white";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: rem(8),
        padding: `${rem(12)} ${rem(16)}`,
        borderRadius: rem(10),
        border: rowBorder,
        backgroundColor: rowBg,
        lineHeight: 2,
        transition: "border-color 150ms ease, background-color 150ms ease",
      }}
    >
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
        {questionIndex + 1}
      </span>
      <span style={{ fontSize: rem(15), color: INK, flex: 1 }}>
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={i}>{seg.value}</span>;
          const idx = seg.value;
          const result = submitted ? getBlankResult(idx) : undefined;
          return (
            <span
              key={i}
              style={blankStyle(idx)}
              onDragOver={(e) => { if (!submitted) e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (!submitted) {
                  const key = e.dataTransfer.getData("text/plain");
                  if (key) onDrop(idx, key);
                }
              }}
              onClick={() => { if (!submitted && userAnswers[idx]) onClear(idx); }}
              title={submitted ? undefined : (userAnswers[idx] ? "Click to clear" : "Drop here")}
            >
              {userAnswers[idx]
                ? getChoiceText(userAnswers[idx])
                : submitted && result
                  ? result.correct_answer
                  : <span style={{ color: MUTED, fontSize: rem(12) }}>____</span>
              }
            </span>
          );
        })}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WordBankSet({
  questions,
  wordChoices,
  userAnswers,
  submitted,
  results,
  lang,
  highlightIdx,
  flaggedQIds,
  onChange,
  onSubmitSet,
}: WordBankSetProps) {
  const placed = allPlacedKeys(userAnswers);
  const allFilled = allBlanksFilledForSet(questions, userAnswers);

  return (
    <Stack gap={rem(16)}>
      {/* Shared word bank — hidden after submit, matches DT style */}
      {!submitted && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: rem(8),
            padding: rem(16),
            borderRadius: rem(12),
            border: `1px solid #E2E8F0`,
            backgroundColor: SURFACE,
          }}
        >
          <Text size="xs" c={MUTED} style={{ width: "100%", marginBottom: rem(4) }}>
            备选词 / Word bank — drag to fill blanks
          </Text>
          {wordChoices.map((choice) => {
            const isPlaced = placed.has(choice.key);
            return (
              <span
                key={choice.key}
                draggable={!isPlaced}
                onDragStart={(e) => {
                  if (!isPlaced) e.dataTransfer.setData("text/plain", choice.key);
                }}
                style={{
                  padding: `${rem(6)} ${rem(14)}`,
                  borderRadius: rem(20),
                  border: `1.5px solid ${isPlaced ? "#E2E8F0" : "#93C5FD"}`,
                  backgroundColor: isPlaced ? "#F8FAFC" : "#EFF6FF",
                  color: isPlaced ? MUTED : INK,
                  fontSize: rem(14),
                  fontWeight: 500,
                  cursor: isPlaced ? "default" : "grab",
                  opacity: isPlaced ? 0.4 : 1,
                  userSelect: "none",
                  transition: "all 150ms ease",
                }}
              >
                {choice.key}. {choice.text}
              </span>
            );
          })}
        </div>
      )}

      {/* Sentence rows */}
      <Stack gap={rem(8)}>
        {questions.map((q, qi) => (
          <SentenceRow
            key={q.id}
            questionIndex={q.question_number != null ? q.question_number - 1 : qi}
            questionText={getQuestionText(q, lang, qi)}
            questionId={q.id}
            userAnswers={userAnswers[q.id] ?? {}}
            wordChoices={wordChoices}
            submitted={submitted}
            blankResults={results?.[q.id]?.blank_results}
            isHighlighted={!submitted && qi === highlightIdx}
            isFlagged={!submitted && (flaggedQIds?.has(q.id) ?? false)}
            onDrop={(blankIdx, key) => onChange(q.id, blankIdx, key)}
            onClear={(blankIdx) => onChange(q.id, blankIdx, "")}
          />
        ))}
      </Stack>


      {/* Post-submit answer key & explanation */}
      {submitted && (
        <Box
          className="answer-explanation-panel"
        >
          <Group gap={8} mb={rem(12)}>
            <IconNotes size={18} stroke={1.5} color="#5F7D59" />
            <Text className="answer-explanation-header" size="sm" fw={700}>Answer Key &amp; Explanation</Text>
          </Group>
          {(() => {
            const explanation = questions.map((q) => q.explanation).find(Boolean);
            return explanation ? <MarkdownLatexText circleNums>{explanation}</MarkdownLatexText> : null;
          })()}
        </Box>
      )}
    </Stack>
  );
}
