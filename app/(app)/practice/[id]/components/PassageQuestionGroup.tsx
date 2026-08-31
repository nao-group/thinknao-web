"use client";

import { rem, Stack, Text, Group, Box } from "@mantine/core";
import { IconNotes, IconCircleCheck, IconCircleX, IconZoomIn } from "@tabler/icons-react";
import { useState } from "react";
import {
  INK, SURFACE, MUTED, PRIMARY,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN, CORRECT_DARK,
  WRONG_BG, WRONG_BORDER, WRONG_RED, WRONG_DARK,
} from "@/constants/colors";
import { ImageLightbox } from "@/components/image-lightbox";
import { AlignedText } from "./AlignedText";
import type { ApiQuestion, SubmitResult, Vocab } from "../types";
import { vocabEnToVocab } from "../types";

interface PassageQuestionGroupProps {
  passage: string;
  /** Vocab dict for the passage (from group.passage_alignment) */
  passageVocab?: Vocab;
  questions: ApiQuestion[];
  userAnswers: Record<string, string>;
  submittedIds: Set<string>;
  results?: Record<string, SubmitResult>;
  lang: "en" | "zh";
  /** Offset added to the displayed question number (for page-by-page YL) */
  startIndex?: number;
  /** True while the submit API call is in flight — shows loading skeleton in explanation box */
  submitting?: boolean;
  onAnswer: (questionId: string, key: string) => void;
  onSubmit: (questionId: string) => void;
}

// ─── Option button — same design as page.tsx's OptionButton ──────────────────

function PassageOption({
  optKey, text, selected, submitted, resultReady, isCorrect, isUserAnswer,
  vocab, mode, onClick,
}: {
  optKey: string;
  text: string;
  selected: boolean;
  submitted: boolean;
  /** True once the API result has returned — only then show correct/wrong colours */
  resultReady: boolean;
  isCorrect: boolean;
  isUserAnswer: boolean;
  vocab: Vocab;
  mode: "zh" | "en";
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

  if (!submitted || !resultReady) {
    // Pre-submit OR submitted but result still loading — show selection highlight only
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
        {submitted && resultReady && isCorrect ? (
          <IconCircleCheck size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : submitted && resultReady && isUserAnswer && !isCorrect ? (
          <IconCircleX size={18} stroke={2.5} color="white" style={{ display: "block" }} />
        ) : (
          <Text size="xs" fw={700} style={{ color: "inherit" }}>{optKey}</Text>
        )}
      </Box>
      <div style={{ flex: 1, color: textColor, fontWeight: 500 }}>
        <AlignedText text={text} vocab={vocab} mode={mode} />
      </div>
      {rightBadge}
    </Box>
  );
}

// ─── Passage box ──────────────────────────────────────────────────────────────

function PassageBox({ passage, vocab, mode }: {
  passage: string;
  vocab: Vocab;
  mode: "zh" | "en";
}) {
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
      <div style={{ whiteSpace: "pre-wrap" }}>
        <AlignedText text={passage} vocab={vocab} mode={mode} multiline />
      </div>
    </Box>
  );
}

// ─── Explanation box — same amber design as standard ExplanationBox ───────────

function PassageExplanationBox({
  explanation,
  vocab,
  lang,
  loading,
}: {
  explanation?: string;
  vocab: Vocab;
  lang: "zh" | "en";
  loading?: boolean;
}) {
  return (
    <Box mt="md" className="answer-explanation-panel">
      <Group gap={8} mb={rem(10)}>
        <IconNotes size={18} stroke={1.5} color="#5F7D59" />
        <Text className="answer-explanation-header" size="sm" fw={700}>Answer Key &amp; Explanation</Text>
      </Group>
      {loading ? (
        <Box style={{ display: "flex", flexDirection: "column", gap: rem(8) }}>
          {[80, 60, 90].map((w, i) => (
            <Box
              key={i}
              style={{
                height: rem(14),
                width: `${w}%`,
                borderRadius: rem(6),
                backgroundColor: "rgba(245,158,11,0.18)",
                animation: "skeleton-pulse 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
          <style>{`
            @keyframes skeleton-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.35; }
            }
          `}</style>
        </Box>
      ) : explanation ? (
        <AlignedText text={explanation} vocab={vocab} mode={lang} block />
      ) : null}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PassageQuestionGroup({
  passage,
  passageVocab = {},
  questions,
  userAnswers,
  submittedIds,
  results,
  lang,
  startIndex = 0,
  submitting = false,
  onAnswer,
  onSubmit,
}: PassageQuestionGroupProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
      const choices = content?.choices as Record<string, string> | undefined;
      if (choices && Object.keys(choices).length > 0) return Object.entries(choices).map(([key, text]) => ({ key, text }));
      return null;
    }
    return extractOptions(lang === "zh" ? q.content_zh : q.content_en)
      ?? extractOptions(q.content_zh)
      ?? [];
  }

  function getExplanation(q: ApiQuestion): string | undefined {
    return q.explanation;
  }

  return (
    <>
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
      <Stack gap={rem(24)}>
      {questions.map((q, qi) => {
        const submitted = submittedIds.has(q.id);
        const result = results?.[q.id];
        const resultReady = result != null;
        const selected = userAnswers[q.id] ?? "";
        const correctAnswer = result?.correct_answer ?? (q.content_zh.correct_answer as string | undefined) ?? (q.content_en.correct_answer as string | undefined) ?? "";
        const options = getOptions(q);
        const explanation = getExplanation(q);
        const questionNum = q.question_number ?? (startIndex + qi + 1);

        const qVocab = q.alignment?.vocab ?? {};

        return (
          <Stack key={q.id} gap={rem(12)}>
            {/* Passage above each question — omitted for JF (no passage) */}
            {passage && <PassageBox passage={passage} vocab={passageVocab} mode={lang} />}

            {/* Question card */}
            <Box p="lg" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              {/* Question number + text */}
              <Group gap={rem(10)} mb={q.image_url ? rem(12) : "md"} align="flex-start">
                <Box
                  style={{
                    minWidth: rem(28), height: rem(28), borderRadius: "50%",
                    backgroundColor: "#F0F4FF", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: rem(13), fontWeight: 700,
                    color: "#6670B0", flexShrink: 0,
                  }}
                >
                  {questionNum}
                </Box>
                <div style={{ flex: 1, lineHeight: 1.7 }}>
                  <AlignedText text={getQuestionText(q)} vocab={qVocab} mode={lang} />
                </div>
              </Group>

              {/* Question image — thumbnail, click to open lightbox */}
              {q.image_url && (
                <Box mb="md" style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    style={{ position: "relative", display: "inline-block", cursor: "zoom-in" }}
                    onClick={() => setLightboxSrc(q.image_url!)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.image_url}
                      alt="Question diagram"
                      style={{ maxHeight: rem(220), maxWidth: "100%", height: "auto", borderRadius: rem(8), display: "block" }}
                    />
                    <div style={{
                      position: "absolute", bottom: rem(8), right: rem(8),
                      backgroundColor: "rgba(0,0,0,0.45)", borderRadius: rem(6),
                      padding: `${rem(4)} ${rem(6)}`, display: "flex", alignItems: "center", gap: rem(4),
                      color: "white", fontSize: rem(11), fontWeight: 600,
                    }}>
                      <IconZoomIn size={13} />
                      Click to zoom
                    </div>
                  </div>
                </Box>
              )}

              {/* Options */}
              <Stack gap={rem(8)} mb="md">
                {options.map((opt) => (
                  <PassageOption
                    key={opt.key}
                    optKey={opt.key}
                    text={opt.text}
                    selected={selected === opt.key}
                    submitted={submitted}
                    resultReady={resultReady}
                    isCorrect={resultReady && opt.key === correctAnswer}
                    isUserAnswer={resultReady && selected === opt.key}
                    vocab={qVocab}
                    mode={lang}
                    onClick={() => onAnswer(q.id, opt.key)}
                  />
                ))}
              </Stack>

              {/* Explanation after submit — only render when content is available or loading */}
              {submitted && (explanation || (submitting && !explanation)) && (
                <PassageExplanationBox
                  explanation={explanation}
                  vocab={lang === "zh"
                    ? (q.explanation_alignment?.vocab_zh ?? qVocab)
                    : vocabEnToVocab(q.explanation_alignment?.vocab_en ?? {})}
                  lang={lang}
                  loading={submitting && !explanation}
                />
              )}
            </Box>
          </Stack>
        );
      })}
      </Stack>
    </>
  );
}
