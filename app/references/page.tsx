"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
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
import { WORDS, FORMULAS, type Subject, type WordEntry, type FormulaEntry } from "./data";

// ─── Constants ────────────────────────────────────────────────────────────────

import { INK, SURFACE, PRIMARY, CREAM, MUTED, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Liberal Arts Chinese", "Science Chinese"] as const;
type SubjectFilter = (typeof SUBJECTS)[number];

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

function SubjectChips({
  value,
  onChange,
}: {
  value: SubjectFilter;
  onChange: (s: SubjectFilter) => void;
}) {
  return (
    <Group gap={6} wrap="nowrap">
      {SUBJECTS.map((s) => {
        const active = value === s;
        return (
          <UnstyledButton
            key={s}
            onClick={() => onChange(s)}
            style={{
              padding: `${rem(5)} ${rem(13)}`,
              borderRadius: rem(999),
              backgroundColor: active ? INK : "white",
              color: active ? "white" : MUTED,
              border: `1.5px solid ${active ? INK : "#E2E8F0"}`,
              fontSize: rem(13),
              fontWeight: active ? 600 : 400,
              whiteSpace: "nowrap",
              transition: "all 150ms ease",
            }}
          >
            {s}
          </UnstyledButton>
        );
      })}
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

// ── Grid cards ────────────────────────────────────────────────────────────────

function WordCard({ entry }: { entry: WordEntry }) {
  return (
    <Box
      p="md"
      className="hover-zoom"
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
        <Text fw={700} size="lg" c={INK} style={{ lineHeight: 1.2 }}>{entry.term}</Text>
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

function FormulaCard({ entry }: { entry: FormulaEntry }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Box
      p="md"
      className="hover-zoom"
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
        <Text fw={700} size="sm" c={INK}>{entry.name}</Text>
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
        <Text
          size="sm"
          fw={700}
          c={meta.iconColor}
          style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}
        >
          {entry.formula}
        </Text>
      </Box>
      <Text size="xs" c={MUTED} lh={1.5}>
        {entry.description.length > 80 ? entry.description.slice(0, 80) + "…" : entry.description}
      </Text>
    </Box>
  );
}

// ── List rows ─────────────────────────────────────────────────────────────────

function WordRow({ entry }: { entry: WordEntry }) {
  return (
    <Box
      px="md"
      py="sm"
      style={{
        backgroundColor: "white",
        borderRadius: rem(10),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        gap: rem(16),
      }}
    >
      <Box style={{ width: rem(120), flexShrink: 0 }}>
        <Text size="sm" fw={700} c={INK}>{entry.term}</Text>
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

function FormulaRow({ entry }: { entry: FormulaEntry }) {
  const meta = SUBJECT_META[entry.subject];
  return (
    <Box
      px="md"
      py="sm"
      style={{
        backgroundColor: "white",
        borderRadius: rem(10),
        border: "1.5px solid #F1F5F9",
        display: "flex",
        alignItems: "center",
        gap: rem(16),
      }}
    >
      <Box style={{ width: rem(150), flexShrink: 0 }}>
        <Text size="sm" fw={700} c={INK}>{entry.name}</Text>
      </Box>
      <Box style={{ width: rem(110), flexShrink: 0 }}>
        <SubjectBadge subject={entry.subject} />
      </Box>
      <Box
        px="xs"
        py={3}
        style={{
          backgroundColor: meta.iconBg,
          borderRadius: rem(6),
          flexShrink: 0,
          maxWidth: rem(240),
        }}
      >
        <Text
          size="xs"
          fw={700}
          c={meta.iconColor}
          style={{ fontFamily: "monospace" }}
          lineClamp={1}
        >
          {entry.formula}
        </Text>
      </Box>
      <Text size="sm" c={MUTED} style={{ flex: 1 }} lineClamp={1}>
        {entry.description}
      </Text>
    </Box>
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

// ─── Flashcard Study Overlay ──────────────────────────────────────────────────

interface FlashcardItem {
  id: string;
  subject: Subject;
  front: string;
  back: string;
  detail?: string;
  extra?: string[];
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

  const card = deck[index];
  const meta = SUBJECT_META[card.subject];
  const Icon = meta.icon;

  function handleFlip() {
    setFlipped((v) => !v);
  }

  function handlePrev() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(0, i - 1)), 150);
  }

  function handleNext() {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(deck.length - 1, i + 1)), 150);
  }

  function handleShuffle() {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  const progress = ((index + 1) / deck.length) * 100;

  return (
    <Box
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15,23,42,0.75)",
        zIndex: 9990,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: rem(24),
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header bar */}
      <Box
        style={{
          width: "100%",
          maxWidth: rem(600),
          marginBottom: rem(20),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text fw={600} size="sm" c="rgba(255,255,255,0.7)">
          {index + 1} / {deck.length}
        </Text>

        <Group gap={8}>
          <Tooltip label="Shuffle deck" withArrow>
            <UnstyledButton
              onClick={handleShuffle}
              style={{
                width: rem(34),
                height: rem(34),
                borderRadius: rem(8),
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconArrowsShuffle size={16} stroke={1.5} color="rgba(255,255,255,0.7)" />
            </UnstyledButton>
          </Tooltip>
          <Tooltip label="Close" withArrow>
            <UnstyledButton
              onClick={onClose}
              style={{
                width: rem(34),
                height: rem(34),
                borderRadius: rem(8),
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconX size={16} stroke={2} color="rgba(255,255,255,0.7)" />
            </UnstyledButton>
          </Tooltip>
        </Group>
      </Box>

      {/* Progress bar */}
      <Box
        style={{
          width: "100%",
          maxWidth: rem(600),
          height: rem(4),
          borderRadius: rem(999),
          backgroundColor: "rgba(255,255,255,0.15)",
          marginBottom: rem(24),
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

      {/* 3-D Flip Card */}
      <Box
        onClick={handleFlip}
        style={{
          perspective: "1200px",
          width: "100%",
          maxWidth: rem(560),
          height: rem(300),
          cursor: "pointer",
          marginBottom: rem(20),
        }}
      >
        <Box
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.45s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
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

            <Text fw={800} size="xl" c={INK} ta="center" lh={1.3}>
              {card.front}
            </Text>

            <Text size="xs" c="dimmed" mt={8}>Click to reveal →</Text>
          </Box>

          {/* Back */}
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
            <Text fw={600} size="sm" c={PRIMARY} ta="center" lh={1.55}>
              {card.back}
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
        </Box>
      </Box>

      {/* Navigation */}
      <Group gap="md" align="center">
        <Button
          variant="white"
          radius="xl"
          size="sm"
          disabled={index === 0}
          onClick={handlePrev}
          style={{ color: INK, fontWeight: 600 }}
        >
          ← Previous
        </Button>

        <Text size="sm" c="rgba(255,255,255,0.5)" fw={500}>
          {flipped ? "Revealed" : "Tap card to reveal"}
        </Text>

        <Button
          radius="xl"
          size="sm"
          disabled={index === deck.length - 1}
          onClick={handleNext}
          style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600 }}
        >
          Next →
        </Button>
      </Group>
    </Box>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

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
    width: rem(32),
    height: rem(32),
    borderRadius: rem(8),
    border: "1.5px solid #D1D5DB",
    backgroundColor: "white",
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <Group justify="center" gap={6} mt="lg">
      <UnstyledButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous"
        style={{ ...btnBase, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
      >
        <IconChevronLeft size={14} stroke={2} />
      </UnstyledButton>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <UnstyledButton
          key={p}
          onClick={() => onChange(p)}
          style={{
            ...btnBase,
            border: `1.5px solid ${p === page ? INK : "#D1D5DB"}`,
            backgroundColor: p === page ? INK : "white",
            color: p === page ? "white" : "#6B7280",
            fontWeight: 600,
            fontSize: rem(13),
            transition: "all 150ms ease",
          }}
        >
          {p}
        </UnstyledButton>
      ))}

      <UnstyledButton
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next"
        style={{ ...btnBase, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
      >
        <IconChevronRight size={14} stroke={2} />
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

  const filteredWords = useMemo(() =>
    WORDS.filter((w) =>
      (subject === "All" || w.subject === subject) &&
      (!search || w.term.toLowerCase().includes(search.toLowerCase()) || w.definition.toLowerCase().includes(search.toLowerCase()))
    ),
    [subject, search]
  );

  const filteredFormulas = useMemo(() =>
    FORMULAS.filter((f) =>
      (subject === "All" || f.subject === subject) &&
      (!search || f.name.toLowerCase().includes(search.toLowerCase()) || f.formula.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase()))
    ),
    [subject, search]
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
        detail: w.example,
      }));
    }
    return filteredFormulas.map((f) => ({
      id: f.id,
      subject: f.subject,
      front: f.name,
      back: f.formula,
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
            {activeTab === "words" ? (
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
                    <WordCard key={w.id} entry={w} />
                  ))}
                </Box>
              ) : (
                <Stack gap={8}>
                  {(pageSlice(filteredWords) as typeof filteredWords).map((w) => (
                    <WordRow key={w.id} entry={w} />
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
                  <FormulaCard key={f.id} entry={f} />
                ))}
              </Box>
            ) : (
              <Stack gap={8}>
                {(pageSlice(filteredFormulas) as typeof filteredFormulas).map((f) => (
                  <FormulaRow key={f.id} entry={f} />
                ))}
              </Stack>
            )}

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </Box>
        </Box>
      </Box>

      {/* Flashcard study overlay */}
      {studyMode && flashcardItems.length > 0 && (
        <FlashcardStudy items={flashcardItems} onClose={() => setStudyMode(false)} />
      )}
    </Box>
  );
}
