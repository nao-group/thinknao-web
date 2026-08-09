"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { LatexText } from "@/components/latex-text";
import {
  IconArrowsShuffle,
  IconAtom,
  IconBook,
  IconCards,
  IconChevronLeft,
  IconChevronRight,
  IconFlask,
  IconLayoutGrid,
  IconLayoutList,
  IconMathFunction,
  IconMicroscope,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { fetchWords, fetchFormulas, type Subject, type WordEntry, type FormulaEntry } from "./data";

// ─── Constants ────────────────────────────────────────────────────────────────

import { INK, SURFACE, PRIMARY, CREAM, MUTED, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Liberal Arts Chinese", "Science Chinese"] as const;
type SubjectFilter = (typeof SUBJECTS)[number];

// Strips diacritics (e.g. pinyin tone marks) and lowercases, so "daoshu" matches "dǎoshù".
function normalizeForSearch(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const SUBJECT_META: Record<Subject, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  "Liberal Arts Chinese": { icon: IconBook,        iconBg: "#F5F3FF", iconColor: VIOLET  },
  "Science Chinese":      { icon: IconMicroscope,  iconBg: "#ECFDF5", iconColor: EMERALD },
  Mathematics:            { icon: IconMathFunction, iconBg: CREAM,    iconColor: PRIMARY },
  Physics:                { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  Chemistry:              { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabBar({
  active,
  wordCount,
  formulaCount,
  onChange,
}: {
  active: "words" | "formulas";
  wordCount: number;
  formulaCount: number;
  onChange: (t: "words" | "formulas") => void;
}) {
  const tabs = [
    { key: "words" as const, label: "Words", count: wordCount },
    { key: "formulas" as const, label: "Formulas", count: formulaCount },
  ];
  return (
    <Group gap={0} style={{ borderBottom: "1px solid #E2E8F0" }}>
      {tabs.map((tab) => (
        <UnstyledButton
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: `${rem(12)} ${rem(20)}`,
            borderBottom: active === tab.key ? `2px solid ${PRIMARY}` : "2px solid transparent",
            marginBottom: -1,
            color: active === tab.key ? PRIMARY : MUTED,
            fontWeight: active === tab.key ? 700 : 400,
            fontSize: rem(14),
            transition: "color 150ms ease",
            display: "flex",
            alignItems: "center",
            gap: rem(6),
          }}
        >
          {tab.label}
          <Box
            style={{
              padding: `${rem(1)} ${rem(7)}`,
              borderRadius: rem(999),
              backgroundColor: active === tab.key ? CREAM : SURFACE,
              fontSize: rem(11),
              fontWeight: 700,
              color: active === tab.key ? PRIMARY : MUTED,
            }}
          >
            {tab.count}
          </Box>
        </UnstyledButton>
      ))}
    </Group>
  );
}

function SubjectChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: `${rem(5)} ${rem(13)}`,
        borderRadius: rem(999),
        backgroundColor: active ? INK : hovered ? "#F8FAFC" : "white",
        color: active ? "white" : hovered ? INK : MUTED,
        border: `1.5px solid ${active ? INK : hovered ? "#94A3B8" : "#E2E8F0"}`,
        fontSize: rem(13),
        fontWeight: active ? 600 : hovered ? 500 : 400,
        whiteSpace: "nowrap",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered && !active ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        transition: "all 150ms ease",
      }}
    >
      {label}
    </UnstyledButton>
  );
}

function SubjectChips({
  value,
  onChange,
}: {
  value: SubjectFilter;
  onChange: (s: SubjectFilter) => void;
}) {
  return (
    <Group gap={6} wrap="nowrap">
      {SUBJECTS.map((s) => (
        <SubjectChip key={s} label={s} active={value === s} onClick={() => onChange(s)} />
      ))}
    </Group>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}) {
  return (
    <Group gap={0} style={{ border: "1.5px solid #E2E8F0", borderRadius: rem(8), overflow: "hidden" }}>
      {(["grid", "list"] as const).map((v) => (
        <Tooltip key={v} label={v === "grid" ? "Card view" : "List view"} withArrow>
          <UnstyledButton
            onClick={() => onChange(v)}
            style={{
              width: rem(34),
              height: rem(34),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: view === v ? INK : "white",
              transition: "background-color 150ms ease",
            }}
          >
            {v === "grid" ? (
              <IconLayoutGrid size={16} stroke={1.5} color={view === v ? "white" : MUTED} />
            ) : (
              <IconLayoutList size={16} stroke={1.5} color={view === v ? "white" : MUTED} />
            )}
          </UnstyledButton>
        </Tooltip>
      ))}
    </Group>
  );
}

function SubjectBadge({ subject }: { subject: Subject }) {
  const meta = SUBJECT_META[subject];
  const Icon = meta.icon;
  return (
    <Group gap={5} style={{ flexShrink: 0 }}>
      <Box
        style={{
          width: rem(20),
          height: rem(20),
          borderRadius: rem(5),
          backgroundColor: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={11} stroke={1.5} color={meta.iconColor} />
      </Box>
      <Text size="xs" fw={600} c={meta.iconColor}>{subject}</Text>
    </Group>
  );
}

// ── Shared Chinese header helper ──────────────────────────────────────────────

function ChineseLabel({ zh, pinyin, term }: { zh?: string; pinyin?: string; term: string }) {
  if (!zh) {
    return <Text fw={700} size="lg" c={INK} style={{ lineHeight: 1.2 }}>{term}</Text>;
  }
  return (
    <Box>
      <Text fw={800} size="xl" c={INK} style={{ lineHeight: 1.1, letterSpacing: "-0.01em" }}>{zh}</Text>
      {pinyin && <Text size="xs" c={PRIMARY} fw={600} style={{ letterSpacing: "0.03em" }}>{pinyin}</Text>}
      <Text size="xs" c={MUTED} mt={1}>{term}</Text>
    </Box>
  );
}

// ── Grid cards ────────────────────────────────────────────────────────────────

function WordCard({ entry, onClick }: { entry: WordEntry; onClick: () => void }) {
  return (
    <Box
      p="md"
      className="hover-zoom"
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: rem(14),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        flexDirection: "column",
        gap: rem(10),
        minHeight: rem(148),
        cursor: "pointer",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ChineseLabel zh={entry.zh} pinyin={entry.pinyin} term={entry.term} />
        <SubjectBadge subject={entry.subject} />
      </Group>
      <Text size="sm" c={MUTED} lh={1.55} style={{ flex: 1 }}>
        {entry.definition.length > 90 ? entry.definition.slice(0, 90) + "…" : entry.definition}
      </Text>
      {entry.example && (
        <Box px="xs" py={4} style={{ backgroundColor: SURFACE, borderRadius: rem(6) }}>
          <Text size="xs" c={MUTED} style={{ fontStyle: "italic" }}>
            e.g. {entry.example}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function FormulaCard({ entry, onClick }: { entry: FormulaEntry; onClick: () => void }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Box
      p="md"
      className="hover-zoom"
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: rem(14),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        flexDirection: "column",
        gap: rem(10),
        minHeight: rem(148),
        cursor: "pointer",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <ChineseLabel zh={entry.zhName} pinyin={entry.pinyin} term={entry.name} />
        <SubjectBadge subject={entry.subject} />
      </Group>
      <Box
        px="sm"
        py="xs"
        style={{
          backgroundColor: meta.iconBg,
          borderRadius: rem(8),
          borderLeft: `3px solid ${meta.iconColor}`,
        }}
      >
        <Text size="sm" fw={700} c={meta.iconColor} style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}>
          <LatexText>{entry.formula}</LatexText>
        </Text>
      </Box>
      <Text size="xs" c={MUTED} lh={1.5}>
        {entry.description.length > 80 ? entry.description.slice(0, 80) + "…" : entry.description}
      </Text>
    </Box>
  );
}

// ── List rows ─────────────────────────────────────────────────────────────────

function WordRow({ entry, onClick }: { entry: WordEntry; onClick: () => void }) {
  return (
    <Box
      px="md"
      py="sm"
      className="hover-zoom"
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: rem(10),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        gap: rem(16),
        cursor: "pointer",
      }}
    >
      <Box style={{ width: rem(140), flexShrink: 0 }}>
        {entry.zh ? (
          <>
            <Text size="md" fw={800} c={INK} style={{ lineHeight: 1.1 }}>{entry.zh}</Text>
            {entry.pinyin && <Text size="xs" c={PRIMARY} fw={600}>{entry.pinyin}</Text>}
            <Text size="xs" c={MUTED}>{entry.term}</Text>
          </>
        ) : (
          <Text size="sm" fw={700} c={INK}>{entry.term}</Text>
        )}
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Text size="sm" c={MUTED} style={{ flex: 1 }} lineClamp={1}>
        {entry.definition}
      </Text>
      {entry.example && (
        <Text size="xs" c="dimmed" style={{ flexShrink: 0, maxWidth: rem(160) }} lineClamp={1}>
          {entry.example}
        </Text>
      )}
    </Box>
  );
}

function FormulaRow({ entry, onClick }: { entry: FormulaEntry; onClick: () => void }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Box
      px="md"
      py="sm"
      className="hover-zoom"
      onClick={onClick}
      style={{
        backgroundColor: "white",
        borderRadius: rem(10),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        gap: rem(16),
        cursor: "pointer",
      }}
    >
      <Box style={{ width: rem(160), flexShrink: 0 }}>
        {entry.zhName ? (
          <>
            <Text size="md" fw={800} c={INK} style={{ lineHeight: 1.1 }}>{entry.zhName}</Text>
            {entry.pinyin && <Text size="xs" c={PRIMARY} fw={600}>{entry.pinyin}</Text>}
            <Text size="xs" c={MUTED}>{entry.name}</Text>
          </>
        ) : (
          <Text size="sm" fw={700} c={INK}>{entry.name}</Text>
        )}
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Box px="xs" py={3} style={{ backgroundColor: meta.iconBg, borderRadius: rem(6), flexShrink: 0, maxWidth: rem(240) }}>
        <Text size="xs" fw={700} c={meta.iconColor} style={{ fontFamily: "monospace" }} lineClamp={1}>
          <LatexText>{entry.formula}</LatexText>
        </Text>
      </Box>
      <Text size="sm" c={MUTED} style={{ flex: 1 }} lineClamp={1}>
        {entry.description}
      </Text>
    </Box>
  );
}

// ── Gallery shell ─────────────────────────────────────────────────────────────

const G_GAP = 16; // px gap between cards in the strip

function GalleryShell({
  opened, onClose, count, idx,
  hasPrev, hasNext, onPrev, onNext,
  renderSlot,
  headerExtra,
  progress,
  activeScale = 1.06,
  bareSlots = false,
}: {
  opened: boolean;
  onClose: () => void;
  count: number;
  idx: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  renderSlot: (slot: "prev" | "current" | "next") => React.ReactNode;
  headerExtra?: React.ReactNode;
  progress?: number;
  // Scale applied to the active slot. Keep at 1 for content with its own 3D transform
  // (e.g. a flip card) — scaling an already-GPU-composited 3D layer stretches its
  // rasterized bitmap instead of repainting crisply, which looks blurry.
  activeScale?: number;
  // When true, slots render with no background/padding — use when slot content
  // provides its own card visuals (e.g. FlipCard with FlashcardFace).
  bareSlots?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(680);
  const [slideX, setSlideX] = useState(0);
  const [noTrans, setNoTrans] = useState(false);
  const [busy, setBusy] = useState(false);
  const [navDir, setNavDir] = useState<"prev" | "next" | null>(null);
  const pendingDir = useRef<"prev" | "next" | null>(null);
  const swipeStartX = useRef<number | null>(null);

  // Derived layout values (all in px)
  const peek = Math.min(80, Math.floor(cw * 0.12));
  const cardW = cw - 2 * peek;
  const step = cardW + G_GAP;
  const baseX = -step + peek; // centers slot-1 (current) in the container

  // Measure once when gallery opens
  useEffect(() => {
    if (!opened || !containerRef.current) return;
    const w = containerRef.current.clientWidth;
    setCw(w);
    const p = Math.min(80, Math.floor(w * 0.12));
    setSlideX(-(w - 2 * p + G_GAP) + p);
  }, [opened]);

  function navigate(dir: "prev" | "next") {
    if (busy) return;
    if (dir === "next" && !hasNext) return;
    if (dir === "prev" && !hasPrev) return;
    setBusy(true);
    setNoTrans(false);
    setNavDir(dir);
    pendingDir.current = dir;
    setSlideX(dir === "next" ? baseX - step : baseX + step);
  }

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    // Only react to the strip's own transform transition
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    const dir = pendingDir.current;
    if (!dir) return;
    pendingDir.current = null;
    // Disable transition, update index, snap strip back, clear navDir — all in one paint
    setNoTrans(true);
    setNavDir(null);
    if (dir === "next") onNext(); else onPrev();
    setSlideX(baseX);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setNoTrans(false);
      setBusy(false);
    }));
  }

  // Keyboard navigation — use refs to avoid stale closures
  const navRef = useRef(navigate);
  navRef.current = navigate;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!opened) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navRef.current("prev");
      else if (e.key === "ArrowRight") navRef.current("next");
      else if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [opened]);

  // Swipe / drag
  function handlePointerDown(e: React.PointerEvent) { swipeStartX.current = e.clientX; }
  function handlePointerUp(e: React.PointerEvent) {
    if (swipeStartX.current === null) return;
    const delta = e.clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) > 60) navigate(delta < 0 ? "next" : "prev");
  }

  if (!opened) return null;

  const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";
  const DUR = 380;

  // During navigation, the incoming slot scales up and sharpens while the outgoing scales down and blurs.
  function slotIsBecomingActive(slot: "prev" | "current" | "next"): boolean {
    return (navDir === "next" && slot === "next") || (navDir === "prev" && slot === "prev");
  }
  function slotIsBecomingInactive(slot: "prev" | "current" | "next"): boolean {
    return navDir !== null && slot === "current";
  }

  function slotStyle(slot: "prev" | "current" | "next"): React.CSSProperties {
    const hasSide = slot === "prev" ? hasPrev : hasNext;
    const becomingActive = slotIsBecomingActive(slot);
    const becomingInactive = slotIsBecomingInactive(slot);
    const isActive = slot === "current" && !becomingInactive || becomingActive;
    const scale = isActive ? `scale(${activeScale})` : "scale(0.88) translateY(8px)";
    const blur = isActive ? "none" : (hasSide ? "blur(3px) brightness(0.68)" : "none");
    const zIdx = isActive ? 3 : (slot === "current" && becomingInactive) ? 2 : 1;
    const trans = noTrans ? "none" : `opacity ${DUR}ms ${EASE}, filter ${DUR}ms ${EASE}, transform ${DUR}ms ${EASE}, box-shadow ${DUR}ms ${EASE}`;

    return {
      position: "relative",
      zIndex: zIdx,
      width: cardW,
      flexShrink: 0,
      ...(!bareSlots && {
        backgroundColor: "white",
        borderRadius: rem(16),
        padding: rem(24),
        maxHeight: "78vh",
        overflowY: isActive ? "auto" : "hidden",
        boxShadow: isActive ? "0 32px 80px rgba(0,0,0,0.55)" : "none",
      }),
      userSelect: "none",
      opacity: hasSide || slot === "current" ? 1 : 0,
      filter: blur,
      transform: scale,
      transformOrigin: "center center",
      pointerEvents: (slot !== "current" && hasSide && !busy) ? "auto" : slot === "current" ? "auto" : "none",
      cursor: slot !== "current" ? "pointer" : "default",
      transition: trans,
    } as React.CSSProperties;
  }

  return (
    <Box
      style={{ position: "fixed", inset: 0, zIndex: 300, backgroundColor: "rgba(15,23,42,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Backdrop — click outside card to close */}
      <Box style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      {/* Top bar */}
      <Group
        justify="space-between"
        align="center"
        style={{ position: "relative", zIndex: 1, width: "min(720px, 95vw)", marginBottom: progress !== undefined ? rem(12) : rem(16) }}
      >
        <Text size="sm" c="rgba(255,255,255,0.5)" fw={600}>{idx + 1} / {count}</Text>
        <Group gap={8}>
          {headerExtra}
          <UnstyledButton
            onClick={onClose}
            style={{ width: rem(32), height: rem(32), borderRadius: rem(8), backgroundColor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <IconX size={16} stroke={2} color="rgba(255,255,255,0.8)" />
          </UnstyledButton>
        </Group>
      </Group>

      {/* Progress bar (optional — used by flashcard study) */}
      {progress !== undefined && (
        <Box
          style={{
            position: "relative",
            zIndex: 1,
            width: "min(720px, 95vw)",
            height: rem(4),
            borderRadius: rem(999),
            backgroundColor: "rgba(255,255,255,0.15)",
            marginBottom: rem(20),
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: PRIMARY,
              borderRadius: rem(999),
              transition: "width 300ms ease",
            }}
          />
        </Box>
      )}

      {/* Gallery viewport — clips the strip to show peek */}
      <Box
        ref={containerRef}
        style={{ position: "relative", zIndex: 1, width: "min(680px, 95vw)" }}
      >
        {/* Sliding strip of 3 card slots */}
        <Box
          style={{
            display: "flex",
            gap: rem(G_GAP),
            transform: `translateX(${slideX}px)`,
            transition: noTrans ? "none" : `transform ${DUR}ms ${EASE}`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <Box onClick={() => !busy && navigate("prev")} style={slotStyle("prev")}>{renderSlot("prev")}</Box>
          <Box style={slotStyle("current")}>{renderSlot("current")}</Box>
          <Box onClick={() => !busy && navigate("next")} style={slotStyle("next")}>{renderSlot("next")}</Box>
        </Box>
      </Box>

      {/* Arrow buttons flanking the gallery */}
      {hasPrev && (
        <Box onClick={() => navigate("prev")} style={{ position: "absolute", left: rem(16), top: "50%", transform: "translateY(-50%)", zIndex: 2, width: rem(40), height: rem(40), borderRadius: rem(999), backgroundColor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconChevronLeft size={20} stroke={2} color="white" />
        </Box>
      )}
      {hasNext && (
        <Box onClick={() => navigate("next")} style={{ position: "absolute", right: rem(16), top: "50%", transform: "translateY(-50%)", zIndex: 2, width: rem(40), height: rem(40), borderRadius: rem(999), backgroundColor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <IconChevronRight size={20} stroke={2} color="white" />
        </Box>
      )}
    </Box>
  );
}

// ── Detail modals ─────────────────────────────────────────────────────────────

function WordDetailModal({
  entries, idx, onIdxChange, onClose,
}: {
  entries: WordEntry[];
  idx: number | null;
  onIdxChange: (i: number) => void;
  onClose: () => void;
}) {
  function renderSlot(slot: "prev" | "current" | "next") {
    const i = idx ?? 0;
    const e = slot === "prev" ? (i > 0 ? entries[i - 1] : null)
            : slot === "next" ? (i < entries.length - 1 ? entries[i + 1] : null)
            : entries[i];
    if (!e) return null;
    const meta = SUBJECT_META[e.subject];
    return (
      <Stack gap={0}>
        <SubjectBadge subject={e.subject} />
        <Box mt="md" mb="lg" style={{ textAlign: "center" }}>
          {e.zh && <Text fw={800} style={{ fontSize: rem(48), lineHeight: 1.1, color: INK, letterSpacing: "-0.02em" }}>{e.zh}</Text>}
          {e.pinyin && <Text size="md" fw={600} c={PRIMARY} mt={4} style={{ letterSpacing: "0.04em" }}>{e.pinyin}</Text>}
          <Text size="md" fw={600} c={MUTED} mt={e.zh ? 2 : 0}>{e.term}</Text>
        </Box>
        {slot === "current" && (
          <>
            <Divider mb="md" />
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Definition</Text>
            <Text size="sm" c={INK} lh={1.7} mb="lg">{e.definition}</Text>
            {e.example && (
              <>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Example</Text>
                <Box p="sm" style={{ backgroundColor: SURFACE, borderRadius: rem(10), borderLeft: `3px solid ${meta.iconColor}` }}>
                  <Text size="sm" c={INK} lh={1.6} style={{ fontStyle: "italic" }}><LatexText>{e.example}</LatexText></Text>
                </Box>
              </>
            )}
          </>
        )}
      </Stack>
    );
  }

  return (
    <GalleryShell
      opened={idx !== null}
      onClose={onClose}
      count={entries.length}
      idx={idx ?? 0}
      hasPrev={idx !== null && idx > 0}
      hasNext={idx !== null && idx < entries.length - 1}
      onPrev={() => onIdxChange((idx ?? 0) - 1)}
      onNext={() => onIdxChange((idx ?? 0) + 1)}
      renderSlot={renderSlot}
    />
  );
}

function FormulaDetailModal({
  entries, idx, onIdxChange, onClose,
}: {
  entries: FormulaEntry[];
  idx: number | null;
  onIdxChange: (i: number) => void;
  onClose: () => void;
}) {
  function renderSlot(slot: "prev" | "current" | "next") {
    const i = idx ?? 0;
    const e = slot === "prev" ? (i > 0 ? entries[i - 1] : null)
            : slot === "next" ? (i < entries.length - 1 ? entries[i + 1] : null)
            : entries[i];
    if (!e) return null;
    const meta = SUBJECT_META[e.subject];
    return (
      <Stack gap={0}>
        <SubjectBadge subject={e.subject} />
        <Box mt="md" mb="lg" style={{ textAlign: "center" }}>
          {e.zhName && <Text fw={800} style={{ fontSize: rem(36), lineHeight: 1.1, color: INK, letterSpacing: "-0.02em" }}>{e.zhName}</Text>}
          {e.pinyin && <Text size="md" fw={600} c={PRIMARY} mt={4} style={{ letterSpacing: "0.04em" }}>{e.pinyin}</Text>}
          <Text size="md" fw={600} c={MUTED} mt={e.zhName ? 2 : 0}>{e.name}</Text>
        </Box>
        <Box px="lg" py="md" mb="lg" style={{ backgroundColor: meta.iconBg, borderRadius: rem(12), borderLeft: `4px solid ${meta.iconColor}`, textAlign: "center" }}>
          <Text fw={800} style={{ fontFamily: "monospace", fontSize: rem(20), color: meta.iconColor, letterSpacing: "0.04em" }}>
            <LatexText>{e.formula}</LatexText>
          </Text>
        </Box>
        {slot === "current" && (
          <>
            <Divider mb="md" />
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={6}>Description</Text>
            <Text size="sm" c={INK} lh={1.7} mb={e.variables ? "lg" : 0}>{e.description}</Text>
            {e.variables && e.variables.length > 0 && (
              <>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.08em" }} mb={8}>Variables</Text>
                <Stack gap={6}>
                  {e.variables.map((v) => (
                    <Group key={v} gap={8} align="flex-start">
                      <Box style={{ width: rem(5), height: rem(5), borderRadius: "50%", backgroundColor: meta.iconColor, marginTop: rem(7), flexShrink: 0 }} />
                      <Text size="sm" c={INK} style={{ fontFamily: "monospace" }}><LatexText>{v}</LatexText></Text>
                    </Group>
                  ))}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
    );
  }

  return (
    <GalleryShell
      opened={idx !== null}
      onClose={onClose}
      count={entries.length}
      idx={idx ?? 0}
      hasPrev={idx !== null && idx > 0}
      hasNext={idx !== null && idx < entries.length - 1}
      onPrev={() => onIdxChange((idx ?? 0) - 1)}
      onNext={() => onIdxChange((idx ?? 0) + 1)}
      renderSlot={renderSlot}
    />
  );
}


// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Box
      py={60}
      style={{ textAlign: "center", backgroundColor: "white", borderRadius: rem(14) }}
    >
      <Text size="sm" c="dimmed">No results found. Try a different search or filter.</Text>
    </Box>
  );
}

function LoadingState() {
  return (
    <Box py={60} style={{ textAlign: "center", backgroundColor: "white", borderRadius: rem(14) }}>
      <Text size="sm" c="dimmed">Loading references…</Text>
    </Box>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Box py={60} style={{ textAlign: "center", backgroundColor: "white", borderRadius: rem(14) }}>
      <Text size="sm" c="dimmed" mb="sm">Failed to load references. Please try again.</Text>
      <Button variant="light" radius="md" size="xs" onClick={onRetry}>Retry</Button>
    </Box>
  );
}

// ─── Flashcard Study Overlay ──────────────────────────────────────────────────

interface FlashcardItem {
  id: string;
  subject: Subject;
  front: string;
  back: string;
  hanzi?: string;
  pinyin?: string;
  detail?: string;
  extra?: string[];
}

function FlashcardFace({
  card,
  meta,
  Icon,
  side,
}: {
  card: FlashcardItem;
  meta: (typeof SUBJECT_META)[Subject];
  Icon: React.ElementType;
  side: "front" | "back";
}) {
  if (side === "front") {
    return (
      <Box
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          backgroundColor: "white",
          borderRadius: rem(18),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: rem(32),
          gap: rem(12),
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <Group gap={6}>
          <Box
            style={{
              width: rem(24),
              height: rem(24),
              borderRadius: rem(6),
              backgroundColor: meta.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={13} stroke={1.5} color={meta.iconColor} />
          </Box>
          <Text size="xs" fw={600} c={meta.iconColor}>{card.subject}</Text>
        </Group>

        {card.hanzi && (
          <Text fw={800} style={{ fontSize: rem(40), lineHeight: 1.1, letterSpacing: "-0.02em" }} c={INK} ta="center">
            {card.hanzi}
          </Text>
        )}

        <Text fw={800} size="xl" c={INK} ta="center" lh={1.3}>
          {card.front}
        </Text>

        <Text size="xs" c="dimmed" mt={8}>Click to reveal →</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        backgroundColor: INK,
        borderRadius: rem(18),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(32),
        gap: rem(10),
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        overflowY: "auto",
      }}
    >
      {card.pinyin && (
        <Text fw={800} size="lg" c={PRIMARY} ta="center" mb={2} style={{ letterSpacing: "0.03em" }}>
          {card.pinyin}
        </Text>
      )}

      <Text fw={600} size="sm" c={PRIMARY} ta="center" lh={1.55}>
        <LatexText>{card.back}</LatexText>
      </Text>

      {card.detail && (
        <Box
          px="md"
          py="xs"
          mt={4}
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: rem(10),
            width: "100%",
          }}
        >
          <Text size="xs" c="rgba(255,255,255,0.6)" ta="center" style={{ fontStyle: "italic" }}>
            {card.detail}
          </Text>
        </Box>
      )}

      {card.extra && card.extra.length > 0 && (
        <Stack gap={3} mt={4} style={{ width: "100%" }}>
          {card.extra.map((v, i) => (
            <Text key={i} size="xs" c="rgba(255,255,255,0.45)" ta="center">{v}</Text>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function FlipCard({
  card,
  interactive,
  flipped,
  onFlip,
}: {
  card: FlashcardItem;
  interactive: boolean;
  flipped: boolean;
  onFlip: () => void;
}) {
  const meta = SUBJECT_META[card.subject];
  const Icon = meta.icon;
  return (
    <Box
      onClick={interactive ? onFlip : undefined}
      style={{ perspective: "1200px", width: "100%", height: rem(300), cursor: interactive ? "pointer" : "default" }}
    >
      <Box
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s ease",
          transform: interactive && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <FlashcardFace card={card} meta={meta} Icon={Icon} side="front" />
        <FlashcardFace card={card} meta={meta} Icon={Icon} side="back" />
      </Box>
    </Box>
  );
}

function FlashcardStudy({
  items,
  onClose,
}: {
  items: FlashcardItem[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState(items);

  function goTo(i: number) {
    setFlipped(false);
    setIndex(i);
  }

  function handleShuffle() {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  function renderSlot(slot: "prev" | "current" | "next") {
    const i = slot === "prev" ? index - 1 : slot === "next" ? index + 1 : index;
    const card = deck[i];
    if (!card) return null;
    return <FlipCard card={card} interactive={slot === "current"} flipped={flipped} onFlip={() => setFlipped((v) => !v)} />;
  }

  return (
    <GalleryShell
      opened
      onClose={onClose}
      count={deck.length}
      idx={index}
      hasPrev={index > 0}
      hasNext={index < deck.length - 1}
      onPrev={() => goTo(index - 1)}
      onNext={() => goTo(index + 1)}
      renderSlot={renderSlot}
      progress={((index + 1) / deck.length) * 100}
      activeScale={1}
      bareSlots
      headerExtra={
        <Tooltip label="Shuffle deck" withArrow>
          <UnstyledButton
            onClick={handleShuffle}
            style={{
              width: rem(32),
              height: rem(32),
              borderRadius: rem(8),
              backgroundColor: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconArrowsShuffle size={16} stroke={1.5} color="rgba(255,255,255,0.8)" />
          </UnstyledButton>
        </Tooltip>
      }
    />
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// Collapses long page lists to first, last, and a window around the current page, e.g. 1 … 4 5 6 … 17.
function paginationRange(page: number, totalPages: number): (number | "ellipsis")[] {
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  const range: (number | "ellipsis")[] = [1];
  if (left > 2) range.push("ellipsis");
  for (let p = left; p <= right; p++) range.push(p);
  if (right < totalPages - 1) range.push("ellipsis");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const btnBase: React.CSSProperties = {
    width: rem(26),
    height: rem(26),
    borderRadius: rem(6),
    border: "1.5px solid #D1D5DB",
    backgroundColor: "white",
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <Group justify="center" gap={4} mt="lg">
      <UnstyledButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous"
        style={{ ...btnBase, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
      >
        <IconChevronLeft size={12} stroke={2} />
      </UnstyledButton>

      {paginationRange(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <Text key={`ellipsis-${i}`} size="xs" c="dimmed" style={{ width: rem(18), textAlign: "center" }}>
            …
          </Text>
        ) : (
          <UnstyledButton
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              border: `1.5px solid ${p === page ? INK : "#D1D5DB"}`,
              backgroundColor: p === page ? INK : "white",
              color: p === page ? "white" : "#6B7280",
              fontWeight: 600,
              fontSize: rem(12),
              transition: "all 150ms ease",
            }}
          >
            {p}
          </UnstyledButton>
        )
      )}

      <UnstyledButton
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next"
        style={{ ...btnBase, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
      >
        <IconChevronRight size={12} stroke={2} />
      </UnstyledButton>
    </Group>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ReferencesPage() {
  const [activeTab, setActiveTab] = useState<"words" | "formulas">("words");
  const [subject, setSubject] = useState<SubjectFilter>("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [studyMode, setStudyMode] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [selectedFormulaIdx, setSelectedFormulaIdx] = useState<number | null>(null);

  const [words, setWords] = useState<WordEntry[]>([]);
  const [formulas, setFormulas] = useState<FormulaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    Promise.all([fetchWords(), fetchFormulas()])
      .then(([w, f]) => {
        if (cancelled) return;
        setWords(w);
        setFormulas(f);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const normalizedSearch = normalizeForSearch(search);

  const filteredWords = useMemo(() =>
    words.filter((w) =>
      (subject === "All" || w.subject === subject) &&
      (!normalizedSearch ||
        [w.term, w.definition, w.zh, w.pinyin].some((field) => field && normalizeForSearch(field).includes(normalizedSearch)))
    ),
    [words, subject, normalizedSearch]
  );

  const filteredFormulas = useMemo(() =>
    formulas.filter((f) =>
      (subject === "All" || f.subject === subject) &&
      (!normalizedSearch ||
        [f.name, f.formula, f.description, f.zhName, f.pinyin].some((field) => field && normalizeForSearch(field).includes(normalizedSearch)))
    ),
    [formulas, subject, normalizedSearch]
  );

  // Reset to page 1 whenever filters or tab change
  useEffect(() => { setPage(1); }, [activeTab, subject, search]);

  const totalPages = Math.ceil(
    (activeTab === "words" ? filteredWords.length : filteredFormulas.length) / PAGE_SIZE
  );

  const pageSlice = (arr: typeof filteredWords | typeof filteredFormulas) =>
    arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const flashcardItems: FlashcardItem[] = useMemo(() => {
    if (activeTab === "words") {
      return filteredWords.map((w) => ({
        id: w.id,
        subject: w.subject,
        front: w.term,
        back: w.definition,
        hanzi: w.zh,
        pinyin: w.pinyin,
        detail: w.example,
      }));
    }
    return filteredFormulas.map((f) => ({
      id: f.id,
      subject: f.subject,
      front: f.name,
      back: f.formula,
      hanzi: f.zhName,
      pinyin: f.pinyin,
      detail: f.description,
      extra: f.variables,
    }));
  }, [activeTab, filteredWords, filteredFormulas]);

  const activeCount = activeTab === "words" ? filteredWords.length : filteredFormulas.length;

  function handleTabChange(tab: "words" | "formulas") {
    setActiveTab(tab);
    setSearch("");
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        {/* Page header */}
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box>
            <Text fw={800} size="xl" c={INK} mb={4}>References</Text>
            <Text size="sm" c="dimmed">Study key vocabulary and formulas with flashcards.</Text>
          </Box>
          <Tooltip
            label={activeCount === 0 ? "No items to study" : `Study ${activeCount} ${activeTab} as flashcards`}
            withArrow
          >
            <Button
              leftSection={<IconCards size={16} stroke={1.5} />}
              radius="md"
              disabled={activeCount === 0}
              onClick={() => setStudyMode(true)}
              style={{
                backgroundColor: activeCount > 0 ? PRIMARY : undefined,
                color: "white",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              Study with Flashcards
            </Button>
          </Tooltip>
        </Group>

        {/* Main card */}
        <Box style={{ backgroundColor: "white", borderRadius: rem(16) }}>
          {/* Tab bar */}
          <Box px="lg" pt="md">
            <TabBar
              active={activeTab}
              wordCount={filteredWords.length}
              formulaCount={filteredFormulas.length}
              onChange={handleTabChange}
            />
          </Box>

          {/* Toolbar */}
          <Box px="lg" py="md">
            <Group justify="space-between" wrap="nowrap" gap="sm">
              <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                {/* Search */}
                <TextInput
                  placeholder={activeTab === "words" ? "Search terms…" : "Search formulas…"}
                  leftSection={<IconSearch size={14} stroke={1.5} color={MUTED} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  rightSection={
                    search ? (
                      <UnstyledButton onClick={() => setSearch("")}>
                        <IconX size={13} stroke={2} color={MUTED} />
                      </UnstyledButton>
                    ) : null
                  }
                  size="sm"
                  style={{ maxWidth: rem(240) }}
                  styles={{ input: { borderRadius: rem(8) } }}
                />
                {/* Subject chips */}
                <Box visibleFrom="sm">
                  <SubjectChips value={subject} onChange={setSubject} />
                </Box>
              </Group>

              {/* View toggle */}
              <ViewToggle view={view} onChange={setView} />
            </Group>

            {/* Subject chips (mobile) */}
            <Box hiddenFrom="sm" mt="sm">
              <SubjectChips value={subject} onChange={setSubject} />
            </Box>
          </Box>

          {/* Content */}
          <Box px="lg" pb="lg">
            {loading ? (
              <LoadingState />
            ) : loadError ? (
              <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
            ) : activeTab === "words" ? (
              filteredWords.length === 0 ? (
                <EmptyState />
              ) : view === "grid" ? (
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: rem(12),
                  }}
                >
                  {(pageSlice(filteredWords) as typeof filteredWords).map((w) => (
                    <WordCard key={w.id} entry={w} onClick={() => setSelectedWordIdx(filteredWords.findIndex((x) => x.id === w.id))} />
                  ))}
                </Box>
              ) : (
                <Stack gap={8}>
                  {(pageSlice(filteredWords) as typeof filteredWords).map((w) => (
                    <WordRow key={w.id} entry={w} onClick={() => setSelectedWordIdx(filteredWords.findIndex((x) => x.id === w.id))} />
                  ))}
                </Stack>
              )
            ) : filteredFormulas.length === 0 ? (
              <EmptyState />
            ) : view === "grid" ? (
              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: rem(12),
                }}
              >
                {(pageSlice(filteredFormulas) as typeof filteredFormulas).map((f) => (
                  <FormulaCard key={f.id} entry={f} onClick={() => setSelectedFormulaIdx(filteredFormulas.findIndex((x) => x.id === f.id))} />
                ))}
              </Box>
            ) : (
              <Stack gap={8}>
                {(pageSlice(filteredFormulas) as typeof filteredFormulas).map((f) => (
                  <FormulaRow key={f.id} entry={f} onClick={() => setSelectedFormulaIdx(filteredFormulas.findIndex((x) => x.id === f.id))} />
                ))}
              </Stack>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </Box>
        </Box>
      </Box>

      {/* Detail modals */}
      <WordDetailModal
        entries={filteredWords}
        idx={selectedWordIdx}
        onIdxChange={setSelectedWordIdx}
        onClose={() => setSelectedWordIdx(null)}
      />
      <FormulaDetailModal
        entries={filteredFormulas}
        idx={selectedFormulaIdx}
        onIdxChange={setSelectedFormulaIdx}
        onClose={() => setSelectedFormulaIdx(null)}
      />

      {/* Flashcard study overlay */}
      {studyMode && flashcardItems.length > 0 && (
        <FlashcardStudy items={flashcardItems} onClose={() => setStudyMode(false)} />
      )}
    </Box>
  );
}
