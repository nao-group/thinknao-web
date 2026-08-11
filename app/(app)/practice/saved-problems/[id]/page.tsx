"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { LatexText } from "@/components/latex-text";
import { Card } from "@/components/ui/card";
import {
  IconAlertCircle,
  IconAtom,
  IconBook,
  IconBookmarkFilled,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconFlask,
  IconMathFunction,
  IconMicroscope,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { ReportModal } from "@/components/report-modal";
import { SAVED_PROBLEMS, type SubjectKey, type Difficulty } from "../data";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { LanguageToggle, type Lang } from "@/components/language-toggle";
import { OptionRow } from "./components/OptionRow";
import { ExplanationBox } from "./components/ExplanationBox";

import {
  INK, SURFACE, PRIMARY, CREAM, MUTED, INDIGO, PANDA, VIOLET, EMERALD,
  CORRECT_GREEN,
} from "@/constants/colors";

// ─── Styling constants ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: "#DCFCE7", color: "#16A34A" },
  Medium: { bg: CREAM, color: PRIMARY },
  Hard: { bg: "#FEE2E2", color: "#DC2626" },
};

const SUBJECT_META: Record<SubjectKey, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY  },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO   },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA    },
  "Liberal Arts Chinese": { icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET   },
  "Science Chinese":      { icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const allProblems = SAVED_PROBLEMS;
  const currentIndex = allProblems.findIndex((p) => p.id === id);
  const problem = allProblems[currentIndex];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;

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

  if (!problem) {
    return (
      <Box p="xl">
        <Text c="dimmed">Problem not found.</Text>
      </Box>
    );
  }

  const meta = SUBJECT_META[problem.subject];
  const SubjectIcon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const date = new Date(problem.dateAdded).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allProblems.length - 1;

  function goTo(idx: number) {
    setSelectedOption(null);
    setSubmitted(false);
    router.push(`/practice/saved-problems/${allProblems[idx].id}`);
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
                    Problem {problem.id}
                  </Badge>
                  <Badge
                    size="md"
                    radius="md"
                    style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 600 }}
                  >
                    {lang === "zh" ? (problem.zh?.topic ?? problem.topic) : problem.topic}
                  </Badge>
                </Group>
                <Group gap={6}>
                  <LanguageToggle lang={lang} onChange={setLang} />
                  <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                    {problem.difficulty}
                  </Badge>
                  <IconBookmarkFilled size={16} color={PRIMARY} />
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

              {/* Question text */}
              <Box p="md" mb="lg" style={{ backgroundColor: SURFACE, borderRadius: rem(10) }}>
                <Text size="md" c={INK} lh={1.7}>
                  <LatexText>{lang === "zh" ? (problem.zh?.question ?? problem.question) : problem.question}</LatexText>
                </Text>
              </Box>

              {/* Question image */}
              {problem.image && (
                <Box mb="lg" style={{ display: "flex", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={problem.image}
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
                {problem.options.map((opt) => {
                  const isCorrect = opt.key === problem.correctAnswer;
                  const isSelected = submitted && opt.key === selectedOption && !isCorrect;
                  const showResult = submitted;

                  const displayText = lang === "zh" ? (opt.text_zh ?? opt.text) : opt.text;

                  if (showResult) {
                    return (
                      <OptionRow
                        key={opt.key}
                        optKey={opt.key}
                        text={displayText}
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
                      <Text size="sm" c={INK} fw={chosen ? 600 : 400}><LatexText>{displayText}</LatexText></Text>
                    </Box>
                  );
                })}
              </Stack>

              {/* Explanation — shown after submit */}
              {submitted && (
                <ExplanationBox explanation={lang === "zh" ? (problem.zh?.explanation ?? problem.explanation) : problem.explanation} />
              )}
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
                  <IconCheck size={15} stroke={2} color={CORRECT_GREEN} />
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
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Subject</Text>
                    <Group gap={6}>
                      <Box style={{ width: rem(20), height: rem(20), borderRadius: rem(5), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <SubjectIcon size={12} stroke={1.5} color={meta.iconColor} />
                      </Box>
                      <Text size="sm" fw={600} c={INK}>{problem.subject}</Text>
                    </Group>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Topic</Text>
                    <Text size="sm" fw={600} c={INK}>{problem.topic}</Text>
                  </Group>
                  <Group justify="space-between" align="center">
                    <Text size="sm" c="dimmed">Practice Set</Text>
                    <UnstyledButton
                      onClick={() => router.push(`/practice/${problem.setSlug}`)}
                      style={{
                        fontSize: rem(14),
                        fontWeight: 600,
                        color: PRIMARY,
                        textDecoration: "underline",
                        textUnderlineOffset: rem(3),
                        cursor: "pointer",
                      }}
                    >
                      {problem.setName}
                    </UnstyledButton>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Difficulty</Text>
                    <Badge size="sm" radius="sm" style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}>
                      {problem.difficulty}
                    </Badge>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Saved on</Text>
                    <Text size="sm" fw={500} c={INK}>{date}</Text>
                  </Group>
                </Stack>
              </Card>

              {/* Problem counter */}
              <Card p="lg">
                <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="md">
                  Saved Problems
                </Text>
                <Group justify="space-between" align="center">
                  <Text fw={700} size="xl" c={INK}>{currentIndex + 1}</Text>
                  <Text size="sm" c="dimmed">of {allProblems.length}</Text>
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
                      width: `${((currentIndex + 1) / allProblems.length) * 100}%`,
                      backgroundColor: PRIMARY,
                      borderRadius: rem(999),
                      transition: "width 300ms ease",
                    }}
                  />
                </Box>
              </Card>

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
      {problem?.image && (
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
                src={problem.image}
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

      <FloatingChatbot
        questionContext={[
          `Subject: ${problem.subject} — Topic: ${problem.topic}`,
          `Question: ${problem.question}`,
          `Options:`,
          ...problem.options.map((o) => `  ${o.key}. ${o.text}`),
          `Correct Answer: ${problem.correctAnswer}`,
        ].join("\n")}
      />
    </Box>
  );
}
