"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { MarkdownLatexText, CircleBadge } from "@/components/markdown-latex-text";
import { LatexText } from "@/components/latex-text";
import { Card } from "@/components/ui/card";
import {
  IconAlertCircle,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { ReportModal } from "@/components/report-modal";
import { SUBJECT_META } from "../../data";
import { DIFFICULTY_STYLE, DIFFICULTY_LABEL } from "../components/ProblemRow";
import { fetchSavedQuestion, removeBookmark } from "../api";
import type { SavedQuestionDetail } from "../types";
import { LanguageToggle, type Lang } from "@/components/language-toggle";
import { useNavStore } from "@/store/nav";
import { OptionRow } from "./components/OptionRow";
import { ExplanationBox } from "./components/ExplanationBox";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED,
  CORRECT_BG, CORRECT_BORDER, CORRECT_GREEN,
  WRONG_BG, WRONG_BORDER, WRONG_RED,
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

// ─── Shared word bank (DT / XT pre-submit) ────────────────────────────────────

function WordBank({
  choices,
  selectedKey,
  label,
  onSelect,
}: {
  choices: { key: string; text: string }[];
  selectedKey: string | null;
  label: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: rem(8),
        padding: rem(16),
        borderRadius: rem(12),
        border: "1px solid #E2E8F0",
        backgroundColor: SURFACE,
      }}
    >
      <Text size="xs" c={MUTED} style={{ width: "100%", marginBottom: rem(4) }}>
        {label}
      </Text>
      {choices.map((choice) => {
        const isSelected = choice.key === selectedKey;
        return (
          <span
            key={choice.key}
            onClick={() => onSelect(isSelected ? "" : choice.key)}
            style={{
              padding: `${rem(6)} ${rem(14)}`,
              borderRadius: rem(20),
              border: `1.5px solid ${isSelected ? PRIMARY : "#93C5FD"}`,
              backgroundColor: isSelected ? CREAM : "#EFF6FF",
              color: INK,
              fontSize: rem(14),
              fontWeight: 500,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 150ms ease",
            }}
          >
            {choice.key}. {choice.text}
          </span>
        );
      })}
    </div>
  );
}

// ─── Inline blank renderer (used by both DT and XT) ───────────────────────────

function ClozeBlank({
  idx,
  partIndex,
  selectedKey,
  correctKey,
  submitted,
  choices,
  onClear,
}: {
  idx: string;
  partIndex: number;
  selectedKey: string | null;
  correctKey: string;
  submitted: boolean;
  choices: { key: string; text: string }[];
  onClear: () => void;
}) {
  const isCurrentBlank = Number(idx) === partIndex;

  function getChoiceText(key: string) {
    return choices.find((c) => c.key === key)?.text ?? key;
  }

  // Non-active blanks — show a numbered neutral placeholder
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

  // Current blank — pre-submit
  if (!submitted) {
    const filledText = selectedKey ? getChoiceText(selectedKey) : null;
    return (
      <span
        onClick={selectedKey ? onClear : undefined}
        title={selectedKey ? "Click to clear" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: rem(72),
          minHeight: rem(32),
          padding: `${rem(4)} ${rem(10)}`,
          borderRadius: rem(8),
          border: `1.5px dashed ${selectedKey ? "#93C5FD" : PRIMARY}`,
          backgroundColor: selectedKey ? "#EFF6FF" : "#FFF9EC",
          verticalAlign: "middle",
          margin: `0 ${rem(3)}`,
          fontSize: rem(14),
          fontWeight: 500,
          color: INK,
          cursor: selectedKey ? "pointer" : "default",
          transition: "all 150ms ease",
        }}
      >
        {filledText ?? <CircleBadge n={idx} />}
      </span>
    );
  }

  // Current blank — submitted
  const isCorrect = selectedKey === correctKey;
  const selectedText = selectedKey ? getChoiceText(selectedKey) : null;
  const correctText = getChoiceText(correctKey);

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
          border: `1.5px solid ${isCorrect ? CORRECT_BORDER : WRONG_BORDER}`,
          backgroundColor: isCorrect ? CORRECT_BG : WRONG_BG,
          fontSize: rem(14),
          fontWeight: 600,
          color: isCorrect ? CORRECT_GREEN : WRONG_RED,
        }}
      >
        {selectedText ?? "—"}
      </span>
      {!isCorrect && (
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

// ─── DT: Paragraph cloze ──────────────────────────────────────────────────────

function ParagraphClozeView({
  text,
  choices,
  partIndex,
  selectedKey,
  correctKey,
  submitted,
  onSelect,
}: {
  text: string;
  choices: { key: string; text: string }[];
  partIndex: number;
  selectedKey: string | null;
  correctKey: string;
  submitted: boolean;
  onSelect: (key: string) => void;
}) {
  const segments = parseClozeSegments(text);

  return (
    <Stack gap={rem(16)}>
      {!submitted && (
        <WordBank
          choices={choices}
          selectedKey={selectedKey}
          label={`备选词 / Word bank — click to fill blank ${partIndex}`}
          onSelect={onSelect}
        />
      )}

      {/* Paragraph with inline blanks */}
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
              submitted={submitted}
              choices={choices}
              onClear={() => onSelect("")}
            />
          )
        )}
      </div>
    </Stack>
  );
}

// ─── XT: Vocabulary / sentence cloze ──────────────────────────────────────────

function SentenceClozeView({
  text,
  questionNumber,
  choices,
  selectedKey,
  correctKey,
  submitted,
  onSelect,
}: {
  text: string;
  questionNumber: number;
  choices: { key: string; text: string }[];
  selectedKey: string | null;
  correctKey: string;
  submitted: boolean;
  onSelect: (key: string) => void;
}) {
  const segments = parseClozeSegments(text);

  function getChoiceText(key: string) {
    return choices.find((c) => c.key === key)?.text ?? key;
  }

  return (
    <Stack gap={rem(16)}>
      {!submitted && (
        <WordBank
          choices={choices}
          selectedKey={selectedKey}
          label="备选词 / Word bank — click to fill blank"
          onSelect={onSelect}
        />
      )}

      {/* Single sentence row */}
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

            if (!submitted) {
              const filledText = selectedKey ? getChoiceText(selectedKey) : null;
              return (
                <span
                  key={i}
                  onClick={selectedKey ? () => onSelect("") : undefined}
                  title={selectedKey ? "Click to clear" : undefined}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: rem(68),
                    minHeight: rem(28),
                    padding: `${rem(3)} ${rem(10)}`,
                    borderRadius: rem(8),
                    border: `1.5px dashed ${selectedKey ? "#93C5FD" : MUTED}`,
                    backgroundColor: selectedKey ? "#EFF6FF" : SURFACE,
                    verticalAlign: "middle",
                    margin: `0 ${rem(4)}`,
                    fontSize: rem(14),
                    fontWeight: 500,
                    color: INK,
                    cursor: selectedKey ? "pointer" : "default",
                    transition: "all 150ms ease",
                  }}
                >
                  {filledText ?? (
                    <span style={{ color: MUTED, fontSize: rem(12) }}>____</span>
                  )}
                </span>
              );
            }

            const isCorrect = selectedKey === correctKey;
            const selectedText = selectedKey ? getChoiceText(selectedKey) : null;
            const correctText = getChoiceText(correctKey);

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
                    border: `1.5px solid ${isCorrect ? CORRECT_BORDER : WRONG_BORDER}`,
                    backgroundColor: isCorrect ? CORRECT_BG : WRONG_BG,
                    fontSize: rem(14),
                    fontWeight: 600,
                    color: isCorrect ? CORRECT_GREEN : WRONG_RED,
                  }}
                >
                  {selectedText ?? "—"}
                </span>
                {!isCorrect && (
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
    </Stack>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = params.id as string;

  const idList = (searchParams.get("ids") ?? questionId).split(",").filter(Boolean);
  const currentIndex = idList.indexOf(questionId);
  const idsParam = idList.length > 0 ? `?ids=${idList.join(",")}` : "";

  const [problem, setProblem] = useState<SavedQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [reportOpen, setReportOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

  const setProblemCode = useNavStore((s) => s.setProblemCode);
  useEffect(() => {
    if (problem?.code) setProblemCode(problem.code);
  }, [problem?.code, setProblemCode]);
  useEffect(() => () => setProblemCode(""), [setProblemCode]);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    setSelectedOption(null);
    setSubmitted(false);
    fetchSavedQuestion(questionId)
      .then((data) => {
        setProblem(data);
        if (data.answer_state) {
          setSelectedOption(data.answer_state.selected_key);
          setSubmitted(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load saved question:", err);
        setLoadError("Failed to load this saved question.");
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  function openLightbox() { setZoom(1); setPan({ x: 0, y: 0 }); setLightboxOpen(true); }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const { mx, my, px, py } = dragOrigin.current;
    setPan({ x: px + (e.clientX - mx), y: py + (e.clientY - my) });
  }

  function handlePointerUp() {
    dragOrigin.current = null;
    setDragging(false);
  }

  function changeZoom(next: number) {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +next.toFixed(2)));
    setZoom(clamped);
    if (clamped <= 1) setPan({ x: 0, y: 0 });
  }

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

  if (loadError || !problem) {
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
  const date = new Date(problem.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ── Data extraction ──────────────────────────────────────────────────────────

  const contentZh = problem.content?.zh;
  const contentEn = problem.content?.en;
  const langContent = lang === "zh" ? contentZh : contentEn;

  const rawQText = problem.question_text;
  /** For non-cloze types, get the question stem (respects lang). */
  function getQuestionStem(): string {
    const q = langContent?.question ?? contentZh?.question;
    if (!q) return rawQText;
    if (typeof q === "string") return q;
    return Object.values(q)[0] ?? rawQText;
  }

  const choices = problem.choices ?? [];
  const correctAnswer = problem.answer;
  const explanation = problem.explanation;
  const partIndex = problem.part_index ?? 1;

  const isDT = problem.question_type === "DT";
  const isXT = problem.question_type === "XT";
  const isCloze = isDT || isXT;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < idList.length - 1;

  function goTo(idx: number) {
    router.push(`/practice/saved-problems/${idList[idx]}${idsParam}`);
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap">
          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Question Card */}
            <Card p="xl" className="no-select">
              {/* Header */}
              <Group justify="space-between" align="center" mb="lg">
                <Group gap={8}>
                  <Badge
                    size="md"
                    radius="md"
                    style={{ backgroundColor: INK, color: "white", fontWeight: 700, fontSize: rem(13) }}
                  >
                    {problem.code}
                  </Badge>
                  {problem.topic_name && (
                    <Badge
                      size="md"
                      radius="md"
                      style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600 }}
                    >
                      {problem.topic_name}
                    </Badge>
                  )}
                </Group>
                <Group gap={6}>
                  <LanguageToggle lang={lang} onChange={setLang} />
                  {problem.answer_state && (
                    <Badge
                      size="sm"
                      radius="sm"
                      style={{
                        backgroundColor: problem.answer_state.correct ? "#DCFCE7" : "#FEE2E2",
                        color: problem.answer_state.correct ? "#15803D" : "#B91C1C",
                        fontWeight: 600,
                      }}
                    >
                      {problem.answer_state.correct ? "Answered correctly" : "Answered incorrectly"}
                    </Badge>
                  )}
                  <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                    {DIFFICULTY_LABEL[problem.difficulty]}
                  </Badge>
                  <Tooltip label="Remove bookmark" withArrow>
                    <UnstyledButton onClick={handleUnbookmark} disabled={removing} style={{ display: "flex", alignItems: "center" }}>
                      <IconBookmarkFilled size={16} color={PRIMARY} />
                    </UnstyledButton>
                  </Tooltip>
                  <Tooltip label="Report a problem" withArrow>
                    <UnstyledButton
                      onClick={() => setReportOpen(true)}
                      style={{
                        width: rem(28), height: rem(28), borderRadius: rem(7),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: SURFACE,
                      }}
                    >
                      <IconAlertCircle size={15} color={MUTED} stroke={1.5} />
                    </UnstyledButton>
                  </Tooltip>
                </Group>
              </Group>

              {/* ── Question body ── */}

              {/* DT: Paragraph cloze */}
              {isDT && (
                <Box mb="lg">
                  <ParagraphClozeView
                    text={problem.question_text}
                    choices={choices}
                    partIndex={partIndex}
                    selectedKey={selectedOption}
                    correctKey={correctAnswer}
                    submitted={submitted}
                    onSelect={(key) => { if (!submitted) setSelectedOption(key || null); }}
                  />
                </Box>
              )}

              {/* XT: Vocabulary / sentence cloze */}
              {isXT && (
                <Box mb="lg">
                  <SentenceClozeView
                    text={problem.question_text}
                    questionNumber={problem.question_number ?? 1}
                    choices={choices}
                    selectedKey={selectedOption}
                    correctKey={correctAnswer}
                    submitted={submitted}
                    onSelect={(key) => { if (!submitted) setSelectedOption(key || null); }}
                  />
                </Box>
              )}

              {/* Reading comprehension / standard MC */}
              {!isCloze && (
                <>
                  {/* Passage — shown for YL questions */}
                  {problem.passage && (
                    <Box
                      p="md"
                      mb="md"
                      style={{
                        backgroundColor: SURFACE,
                        borderRadius: rem(10),
                        border: "1.5px solid #E2E8F0",
                        lineHeight: 1.9,
                        fontSize: rem(15),
                        color: INK,
                      }}
                    >
                      <Text
                        size="xs"
                        fw={700}
                        c={MUTED}
                        mb={rem(6)}
                        style={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
                      >
                        Passage / 阅读材料
                      </Text>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        <MarkdownLatexText>{problem.passage}</MarkdownLatexText>
                      </div>
                    </Box>
                  )}

                  {/* Question text with number badge */}
                  <Box p="md" mb="lg" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                    {problem.question_number ? (
                      <Group gap={rem(10)} align="flex-start">
                        <Box
                          style={{
                            minWidth: rem(28),
                            height: rem(28),
                            borderRadius: "50%",
                            backgroundColor: "#F0F4FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: rem(13),
                            fontWeight: 700,
                            color: "#6670B0",
                            flexShrink: 0,
                          }}
                        >
                          {problem.question_number}
                        </Box>
                        <Box fz="md" c={INK} lh={1.7} style={{ flex: 1 }}>
                          <MarkdownLatexText>{getQuestionStem()}</MarkdownLatexText>
                        </Box>
                      </Group>
                    ) : (
                      <Box fz="md" c={INK} lh={1.7}>
                        <MarkdownLatexText>{getQuestionStem()}</MarkdownLatexText>
                      </Box>
                    )}
                  </Box>

                  {/* Question image */}
                  {problem.image_url && (
                    <Box mb="lg" style={{ display: "flex", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={problem.image_url}
                        alt="Question figure"
                        onClick={openLightbox}
                        style={{
                          maxWidth: "100%",
                          maxHeight: rem(280),
                          borderRadius: rem(8),
                          objectFit: "contain",
                          cursor: "zoom-in",
                        }}
                      />
                    </Box>
                  )}

                  {/* Options */}
                  <Stack gap="sm" mb="lg">
                    {choices.map((opt) => {
                      const isCorrect = opt.key === correctAnswer;
                      const isSelected = submitted && opt.key === selectedOption && !isCorrect;

                      if (submitted) {
                        return (
                          <OptionRow
                            key={opt.key}
                            optKey={opt.key}
                            text={opt.text}
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
                          <Box fz="sm" c={INK} fw={chosen ? 600 : 400}>
                            <LatexText>{opt.text}</LatexText>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </>
              )}

              {/* Explanation — shown after submit */}
              {submitted && explanation && <ExplanationBox explanation={explanation} circleNums={isCloze} />}
            </Card>

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
                  <IconCheck size={15} stroke={2} color={PRIMARY} />
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
              <Card p="lg">
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                  Problem Info
                </Text>
                <Stack gap="sm">
                  {problem.subject_name && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Subject</Text>
                      <Group gap={6}>
                        <Box style={{ width: rem(20), height: rem(20), borderRadius: rem(5), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <SubjectIcon size={12} stroke={1.5} color={meta.iconColor} />
                        </Box>
                        <Text size="sm" fw={600} c={INK}>{problem.subject_name}</Text>
                      </Group>
                    </Group>
                  )}
                  {problem.topic_name && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Topic</Text>
                      <Text size="sm" fw={600} c={INK}>{problem.topic_name}</Text>
                    </Group>
                  )}
                  {/* Part info for cloze questions */}
                  {isCloze && problem.part_index != null && problem.part_total != null && (
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">Blank</Text>
                      <Text size="sm" fw={600} c={INK}>{problem.part_index} of {problem.part_total}</Text>
                    </Group>
                  )}
                  {problem.session_name && problem.session_id && (
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">Practice Set</Text>
                      <UnstyledButton
                        onClick={() => router.push(`/practice/${problem.session_id}`)}
                        style={{
                          fontSize: rem(14),
                          fontWeight: 600,
                          color: PRIMARY,
                          textDecoration: "underline",
                          textUnderlineOffset: rem(3),
                          cursor: "pointer",
                        }}
                      >
                        {problem.session_name}
                      </UnstyledButton>
                    </Group>
                  )}
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Difficulty</Text>
                    <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                      {DIFFICULTY_LABEL[problem.difficulty]}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Saved on</Text>
                    <Text size="sm" fw={500} c={INK}>{date}</Text>
                  </Group>
                </Stack>
              </Card>

              {/* Problem counter */}
              {currentIndex >= 0 && idList.length > 1 && (
                <Card p="lg">
                  <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                    Saved Problems
                  </Text>
                  <Group justify="space-between" align="center">
                    <Text fw={700} size="xl" c={INK}>{currentIndex + 1}</Text>
                    <Text size="sm" c="dimmed">of {idList.length}</Text>
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
                        width: `${((currentIndex + 1) / idList.length) * 100}%`,
                        backgroundColor: PRIMARY,
                        borderRadius: rem(999),
                        transition: "width 300ms ease",
                      }}
                    />
                  </Box>
                </Card>
              )}

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

      {/* Image lightbox */}
      {problem.image_url && (
        <Modal
          opened={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          size="auto"
          centered
          withCloseButton={false}
          padding={0}
          styles={{
            content: { backgroundColor: "transparent", boxShadow: "none", overflow: "visible" },
            overlay: { backgroundColor: "rgba(0,0,0,0.85)" },
          }}
        >
          <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: rem(12) }}>
            {/* Toolbar */}
            <Group
              gap={6}
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                borderRadius: rem(10),
                padding: `${rem(6)} ${rem(10)}`,
              }}
            >
              <Tooltip label="Zoom out" withArrow>
                <UnstyledButton
                  disabled={zoom <= ZOOM_MIN}
                  onClick={() => changeZoom(zoom - ZOOM_STEP)}
                  style={{
                    width: rem(32), height: rem(32), borderRadius: rem(7),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: zoom <= ZOOM_MIN ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                    cursor: zoom <= ZOOM_MIN ? "not-allowed" : "pointer",
                  }}
                >
                  <IconZoomOut size={16} color="white" stroke={1.8} />
                </UnstyledButton>
              </Tooltip>

              <Text size="xs" fw={600} style={{ color: "white", minWidth: rem(36), textAlign: "center" }}>
                {Math.round(zoom * 100)}%
              </Text>

              <Tooltip label="Zoom in" withArrow>
                <UnstyledButton
                  disabled={zoom >= ZOOM_MAX}
                  onClick={() => changeZoom(zoom + ZOOM_STEP)}
                  style={{
                    width: rem(32), height: rem(32), borderRadius: rem(7),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: zoom >= ZOOM_MAX ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                    cursor: zoom >= ZOOM_MAX ? "not-allowed" : "pointer",
                  }}
                >
                  <IconZoomIn size={16} color="white" stroke={1.8} />
                </UnstyledButton>
              </Tooltip>

              <Box style={{ width: "1px", height: rem(20), backgroundColor: "rgba(255,255,255,0.2)" }} />

              <Tooltip label="Reset zoom" withArrow>
                <UnstyledButton
                  onClick={() => changeZoom(1)}
                  style={{
                    width: rem(32), height: rem(32), borderRadius: rem(7),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                  }}
                >
                  <IconZoomReset size={16} color="white" stroke={1.8} />
                </UnstyledButton>
              </Tooltip>

              <Box style={{ width: "1px", height: rem(20), backgroundColor: "rgba(255,255,255,0.2)" }} />

              <Tooltip label="Close" withArrow>
                <UnstyledButton
                  onClick={() => setLightboxOpen(false)}
                  style={{
                    width: rem(32), height: rem(32), borderRadius: rem(7),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    fontSize: rem(16),
                    color: "white",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </UnstyledButton>
              </Tooltip>
            </Group>

            {/* Image */}
            <Box
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                overflow: "hidden",
                maxWidth: "90vw",
                maxHeight: "80vh",
                width: "80vw",
                height: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
                userSelect: "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={problem.image_url}
                alt="Question figure"
                draggable={false}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: "center center",
                  transition: dragging ? "none" : "transform 200ms ease",
                  maxWidth: "80vw",
                  maxHeight: "80vh",
                  display: "block",
                  borderRadius: rem(8),
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>
        </Modal>
      )}

      <ReportModal opened={reportOpen} onClose={() => setReportOpen(false)} />
    </Box>
  );
}
