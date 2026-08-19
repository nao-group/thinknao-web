"use client";

import { rem, Text } from "@mantine/core";
import {
  INK, SURFACE, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN,
  WRONG_BG, WRONG_BORDER, WRONG_RED,
} from "@/constants/colors";
import type { WordChoice, BlankResult } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DragDropParagraphProps {
  /** Paragraph text with numbered placeholders: "蒸馏水不能{1}导电，是因为…" */
  questionText: string;
  wordChoices: WordChoice[];
  /** blankIndex → choiceKey, e.g. { "1": "B", "2": "" } */
  userAnswers: Record<string, string>;
  submitted: boolean;
  blankResults?: BlankResult[];
  onChange: (blankIndex: string, choiceKey: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Split "text{1}more text{2}end" into tokens */
function parseSegments(text: string): Array<{ type: "text" | "blank"; value: string }> {
  const parts = text.split(/(\{\d+\})/g);
  return parts.map((part) => {
    const m = part.match(/^\{(\d+)\}$/);
    return m ? { type: "blank" as const, value: m[1] } : { type: "text" as const, value: part };
  });
}

/** Keys currently placed in any blank */
function usedKeys(userAnswers: Record<string, string>): Set<string> {
  return new Set(Object.values(userAnswers).filter(Boolean));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DragDropParagraph({
  questionText,
  wordChoices,
  userAnswers,
  submitted,
  blankResults,
  onChange,
}: DragDropParagraphProps) {
  const segments = parseSegments(questionText);
  const placed = usedKeys(userAnswers);

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
        minWidth: rem(72),
        minHeight: rem(32),
        padding: `${rem(4)} ${rem(10)}`,
        borderRadius: rem(8),
        border: `1.5px dashed ${filled ? "#93C5FD" : MUTED}`,
        backgroundColor: filled ? "#EFF6FF" : SURFACE,
        cursor: "pointer",
        verticalAlign: "middle",
        margin: `0 ${rem(4)}`,
        fontSize: rem(14),
        fontWeight: 500,
        color: INK,
        transition: "all 150ms ease",
      };
    }

    const result = getBlankResult(idx);
    if (!result) return blankStyle_neutral(idx);
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: rem(72),
      minHeight: rem(32),
      padding: `${rem(4)} ${rem(10)}`,
      borderRadius: rem(8),
      border: `1.5px solid ${result.correct ? CORRECT_BORDER : WRONG_BORDER}`,
      backgroundColor: result.correct ? CORRECT_BG : WRONG_BG,
      verticalAlign: "middle",
      margin: `0 ${rem(4)}`,
      fontSize: rem(14),
      fontWeight: 600,
      color: result.correct ? CORRECT_GREEN : WRONG_RED,
      cursor: "default",
    };
  }

  function blankStyle_neutral(idx: string): React.CSSProperties {
    const filled = Boolean(userAnswers[idx]);
    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: rem(72),
      minHeight: rem(32),
      padding: `${rem(4)} ${rem(10)}`,
      borderRadius: rem(8),
      border: `1.5px solid ${filled ? "#93C5FD" : MUTED}`,
      backgroundColor: filled ? "#EFF6FF" : SURFACE,
      verticalAlign: "middle",
      margin: `0 ${rem(4)}`,
      fontSize: rem(14),
      fontWeight: 500,
      color: INK,
      cursor: submitted ? "default" : "pointer",
    };
  }

  function handleDrop(idx: string, e: React.DragEvent) {
    e.preventDefault();
    if (submitted) return;
    const key = e.dataTransfer.getData("text/plain");
    if (key) onChange(idx, key);
  }

  function handleBlankClick(idx: string) {
    if (submitted || !userAnswers[idx]) return;
    // Click a filled blank to clear it
    onChange(idx, "");
  }

  function getChoiceText(key: string): string {
    return wordChoices.find((c) => c.key === key)?.text ?? key;
  }

  return (
    <div>
      {/* Word bank — above paragraph, hidden after submit */}
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

      {/* Paragraph with inline blanks */}
      <div
        style={{
          fontSize: rem(16),
          lineHeight: 2,
          color: INK,
          marginTop: rem(20),
        }}
      >
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return <span key={i}>{seg.value}</span>;
          }
          const idx = seg.value;
          const result = submitted ? getBlankResult(idx) : undefined;
          return (
            <span
              key={i}
              style={blankStyle(idx)}
              onDragOver={(e) => { if (!submitted) e.preventDefault(); }}
              onDrop={(e) => handleDrop(idx, e)}
              onClick={() => handleBlankClick(idx)}
              title={submitted ? undefined : (userAnswers[idx] ? "Click to clear" : "Drop here")}
            >
              {userAnswers[idx]
                ? getChoiceText(userAnswers[idx])
                : submitted && result
                  ? result.correct_answer
                  : (
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: rem(22), height: rem(22), borderRadius: "50%",
                      backgroundColor: "#F0F4FF", color: "#6670B0",
                      fontSize: rem(11), fontWeight: 700, flexShrink: 0,
                    }}>{idx}</span>
                  )
              }
            </span>
          );
        })}
      </div>
    </div>
  );
}
