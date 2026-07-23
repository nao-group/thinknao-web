"use client";

import { useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import {
  IconAdjustmentsHorizontal,
  IconAtom,
  IconBookmarkFilled,
  IconChevronLeft,
  IconChevronRight,
  IconFlask,
  IconMathFunction,
  IconSearch,
} from "@tabler/icons-react";

const INK = "#0F172A";
const SURFACE = "#F3F5F7";
const PRIMARY = "#D4A017";
const INDIGO = "#6670B0";
const PANDA = "#C65D2E";
const CREAM = "#F7E7D3";

const PAGE_SIZE = 6;

// ─── Data ──────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { key: "Mathematics", icon: IconMathFunction, iconBg: CREAM, iconColor: PRIMARY },
  { key: "Physics", icon: IconAtom, iconBg: "#EEF0FF", iconColor: INDIGO },
  { key: "Chemistry", icon: IconFlask, iconBg: "#FDF0EC", iconColor: PANDA },
] as const;

type SubjectKey = (typeof SUBJECTS)[number]["key"];
type Difficulty = "Easy" | "Medium" | "Hard";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const DIFFICULTY_STYLE: Record<Difficulty, { bg: string; color: string }> = {
  Easy: { bg: "#DCFCE7", color: "#16A34A" },
  Medium: { bg: CREAM, color: PRIMARY },
  Hard: { bg: "#FEE2E2", color: "#DC2626" },
};

const SUBJECT_META: Record<SubjectKey, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
  Mathematics: { icon: IconMathFunction, iconBg: CREAM, iconColor: PRIMARY },
  Physics: { icon: IconAtom, iconBg: "#EEF0FF", iconColor: INDIGO },
  Chemistry: { icon: IconFlask, iconBg: "#FDF0EC", iconColor: PANDA },
};

const SAVED_PROBLEMS: Array<{
  id: string;
  subject: SubjectKey;
  difficulty: Difficulty;
  question: string;
  dateAdded: string;
}> = [
  { id: "1", subject: "Mathematics", difficulty: "Medium", question: "If f(x) = 2x² + 3x − 5, find f′(x) and determine all critical points of the function.", dateAdded: "2026-07-22" },
  { id: "2", subject: "Physics", difficulty: "Hard", question: "A particle moves in a circle of radius r with angular velocity ω. Derive the expression for centripetal acceleration in terms of r and ω.", dateAdded: "2026-07-21" },
  { id: "3", subject: "Chemistry", difficulty: "Easy", question: "What is the molecular formula of glucose? What type of isomerism does it exhibit?", dateAdded: "2026-07-20" },
  { id: "4", subject: "Mathematics", difficulty: "Hard", question: "Solve the differential equation dy/dx + 2y = 4x using the integrating factor method.", dateAdded: "2026-07-19" },
  { id: "5", subject: "Physics", difficulty: "Medium", question: "Explain the photoelectric effect and derive Einstein's photoelectric equation.", dateAdded: "2026-07-18" },
  { id: "6", subject: "Chemistry", difficulty: "Medium", question: "Describe the mechanism of SN1 and SN2 reactions with appropriate examples and transition state diagrams.", dateAdded: "2026-07-17" },
  { id: "7", subject: "Mathematics", difficulty: "Easy", question: "Find the area enclosed between the curves y = x² and y = 2x using definite integration.", dateAdded: "2026-07-16" },
  { id: "8", subject: "Physics", difficulty: "Hard", question: "A parallel plate capacitor is charged to V volts. If the distance between the plates is doubled, find the new energy stored in the capacitor.", dateAdded: "2026-07-15" },
  { id: "9", subject: "Chemistry", difficulty: "Hard", question: "Explain the hybridization of SF₆ and draw its 3D structure clearly showing all bond angles.", dateAdded: "2026-07-14" },
  { id: "10", subject: "Mathematics", difficulty: "Medium", question: "Using De Moivre's theorem, find all the cube roots of unity and plot them on the Argand diagram.", dateAdded: "2026-07-13" },
  { id: "11", subject: "Physics", difficulty: "Easy", question: "State Faraday's laws of electromagnetic induction and provide two practical applications.", dateAdded: "2026-07-12" },
  { id: "12", subject: "Chemistry", difficulty: "Easy", question: "What are the key differences between crystalline and amorphous solids? Give two examples of each.", dateAdded: "2026-07-11" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function PaginationBtn({
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: rem(32),
        height: rem(32),
        borderRadius: rem(8),
        border: "1.5px solid #D1D5DB",
        backgroundColor: "white",
        color: "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </UnstyledButton>
  );
}

function ProblemRow({
  problem,
  onRemove,
}: {
  problem: (typeof SAVED_PROBLEMS)[number];
  onRemove: (id: string) => void;
}) {
  const meta = SUBJECT_META[problem.subject];
  const Icon = meta.icon;
  const diff = DIFFICULTY_STYLE[problem.difficulty];
  const date = new Date(problem.dateAdded).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box
      className="hover-zoom"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: rem(14),
        padding: `${rem(16)} 0`,
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      {/* Icon */}
      <Box
        style={{
          width: rem(40),
          height: rem(40),
          borderRadius: rem(10),
          backgroundColor: meta.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: rem(2),
        }}
      >
        <Icon size={18} stroke={1.5} color={meta.iconColor} />
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          c={INK}
          fw={500}
          mb={8}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {problem.question}
        </Text>
        <Group gap={6} align="center">
          <Badge
            size="xs"
            radius="sm"
            style={{ backgroundColor: meta.iconBg, color: meta.iconColor, fontWeight: 600 }}
          >
            {problem.subject}
          </Badge>
          <Badge
            size="xs"
            radius="sm"
            style={{ backgroundColor: diff.bg, color: diff.color, fontWeight: 600 }}
          >
            {problem.difficulty}
          </Badge>
          <Text size="xs" c="dimmed">
            · Saved {date}
          </Text>
        </Group>
      </Box>

      {/* Remove */}
      <Tooltip label="Remove bookmark" position="left" withArrow>
        <UnstyledButton
          onClick={() => onRemove(problem.id)}
          style={{
            width: rem(32),
            height: rem(32),
            borderRadius: rem(8),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PRIMARY,
            flexShrink: 0,
          }}
        >
          <IconBookmarkFilled size={16} />
        </UnstyledButton>
      </Tooltip>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedProblemsPage() {
  const [problems, setProblems] = useState(SAVED_PROBLEMS);
  const [page, setPage] = useState(0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [draftDifficulties, setDraftDifficulties] = useState<string[]>([]);
  const [appliedSubjects, setAppliedSubjects] = useState<string[]>([]);
  const [appliedDifficulties, setAppliedDifficulties] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState<string | null>("newest");

  const activeFilters = appliedSubjects.length + appliedDifficulties.length;

  const filteredProblems = useMemo(() => {
    let list = problems
      .filter((p) => searchQuery === "" || p.question.toLowerCase().includes(searchQuery.toLowerCase()) || p.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((p) => appliedSubjects.length === 0 || appliedSubjects.includes(p.subject))
      .filter((p) => appliedDifficulties.length === 0 || appliedDifficulties.includes(p.difficulty));

    if (sortOrder === "newest") list = [...list].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    if (sortOrder === "oldest") list = [...list].sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));

    return list;
  }, [problems, searchQuery, appliedSubjects, appliedDifficulties, sortOrder]);

  const totalPages = Math.ceil(filteredProblems.length / PAGE_SIZE);
  const pagedProblems = filteredProblems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function applySearch(query: string) {
    setSearchQuery(query);
    setPage(0);
    setSearchOpen(false);
  }

  function openFilter() {
    setDraftSubjects(appliedSubjects);
    setDraftDifficulties(appliedDifficulties);
    setFilterOpen(true);
  }

  function applyFilter() {
    setAppliedSubjects(draftSubjects);
    setAppliedDifficulties(draftDifficulties);
    setPage(0);
    setFilterOpen(false);
  }

  function clearFilter() {
    setDraftSubjects([]);
    setDraftDifficulties([]);
    setAppliedSubjects([]);
    setAppliedDifficulties([]);
    setPage(0);
    setFilterOpen(false);
  }

  function removeBookmark(id: string) {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleDraft(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Box p="xl" style={{ backgroundColor: "white", borderRadius: rem(14) }}>

          {/* Header row */}
          <Group justify="space-between" align="center" mb="lg">
            <Group gap={10} align="center">
              <Text fw={700} size="lg" c={INK}>Saved Problems</Text>
              <Badge
                size="sm"
                radius="sm"
                style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 700 }}
              >
                {problems.length} saved
              </Badge>
            </Group>

            <Group gap="sm" align="center">
              {/* Search icon */}
              <Tooltip label="Search problems" position="bottom" withArrow>
                <UnstyledButton
                  onClick={() => { setSearchInput(searchQuery); setSearchOpen(true); }}
                  aria-label="Search saved problems"
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    border: `1.5px solid ${searchQuery ? INK : "#D1D5DB"}`,
                    backgroundColor: searchQuery ? INK : "white",
                    color: searchQuery ? "white" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  <IconSearch size={14} stroke={2} />
                </UnstyledButton>
              </Tooltip>

              {/* Filter icon */}
              <Tooltip label="Filter problems" position="bottom" withArrow>
                <UnstyledButton
                  onClick={openFilter}
                  aria-label="Filter saved problems"
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    border: `1.5px solid ${activeFilters > 0 ? INK : "#D1D5DB"}`,
                    backgroundColor: activeFilters > 0 ? INK : "white",
                    color: activeFilters > 0 ? "white" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  <IconAdjustmentsHorizontal size={14} stroke={2} />
                </UnstyledButton>
              </Tooltip>

              {/* Sort */}
              <Select
                value={sortOrder}
                onChange={(val) => { setSortOrder(val); setPage(0); }}
                data={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                ]}
                size="xs"
                radius="md"
                styles={{
                  input: { fontWeight: 500, border: "1.5px solid #D1D5DB", minWidth: rem(130) },
                }}
                allowDeselect={false}
              />
            </Group>
          </Group>

          {/* Active filter chips */}
          {(searchQuery || activeFilters > 0) && (
            <Group gap={6} mb="md">
              {searchQuery && (
                <Badge
                  size="sm"
                  radius="sm"
                  style={{ backgroundColor: SURFACE, color: INK, cursor: "pointer", fontWeight: 500 }}
                  rightSection={<Text size="xs" c="dimmed">✕</Text>}
                  onClick={() => { setSearchQuery(""); setPage(0); }}
                >
                  "{searchQuery}"
                </Badge>
              )}
              {appliedSubjects.map((s) => (
                <Badge
                  key={s}
                  size="sm"
                  radius="sm"
                  style={{ backgroundColor: SURFACE, color: INK, cursor: "pointer", fontWeight: 500 }}
                  rightSection={<Text size="xs" c="dimmed">✕</Text>}
                  onClick={() => { setAppliedSubjects((prev) => prev.filter((x) => x !== s)); setPage(0); }}
                >
                  {s}
                </Badge>
              ))}
              {appliedDifficulties.map((d) => (
                <Badge
                  key={d}
                  size="sm"
                  radius="sm"
                  style={{ backgroundColor: DIFFICULTY_STYLE[d as Difficulty].bg, color: DIFFICULTY_STYLE[d as Difficulty].color, cursor: "pointer", fontWeight: 500 }}
                  rightSection={<Text size="xs" c="dimmed">✕</Text>}
                  onClick={() => { setAppliedDifficulties((prev) => prev.filter((x) => x !== d)); setPage(0); }}
                >
                  {d}
                </Badge>
              ))}
            </Group>
          )}

          {/* Problem rows */}
          <Stack key={`${searchQuery}-${appliedSubjects.join()}-${appliedDifficulties.join()}-${sortOrder}`} gap={0} className="tab-fade-in">
            {pagedProblems.length > 0 ? (
              pagedProblems.map((p) => (
                <ProblemRow key={p.id} problem={p} onRemove={removeBookmark} />
              ))
            ) : (
              <Box py="xl" style={{ textAlign: "center" }}>
                <Text c="dimmed" size="sm">No saved problems match your filters.</Text>
              </Box>
            )}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="flex-end" align="center" gap={6} mt="md">
              <PaginationBtn onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Previous">
                <IconChevronLeft size={14} stroke={2} />
              </PaginationBtn>

              {Array.from({ length: totalPages }, (_, i) => (
                <UnstyledButton
                  key={i}
                  onClick={() => setPage(i)}
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    fontSize: rem(13),
                    fontWeight: 600,
                    border: `1.5px solid ${i === page ? INK : "#D1D5DB"}`,
                    backgroundColor: i === page ? INK : "white",
                    color: i === page ? "white" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  {i + 1}
                </UnstyledButton>
              ))}

              <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} aria-label="Next">
                <IconChevronRight size={14} stroke={2} />
              </PaginationBtn>
            </Group>
          )}
        </Box>
      </Box>

      {/* ── Search modal ── */}
      <Modal
        opened={searchOpen}
        onClose={() => setSearchOpen(false)}
        withCloseButton={false}
        padding={0}
        radius="md"
        size="md"
        overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
      >
        <Box p="md" style={{ borderBottom: "1px solid #F1F5F9" }}>
          <TextInput
            autoFocus
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch(searchInput)}
            placeholder="Search by question or subject..."
            leftSection={<IconSearch size={15} stroke={1.5} color="#667080" />}
            rightSection={
              searchInput && (
                <UnstyledButton onClick={() => setSearchInput("")} style={{ display: "flex", alignItems: "center" }}>
                  <Text size="xs" c="dimmed">✕</Text>
                </UnstyledButton>
              )
            }
            styles={{ input: { border: "none", boxShadow: "none", fontSize: rem(14) } }}
          />
        </Box>

        {searchInput ? (
          <Box>
            <UnstyledButton
              onClick={() => applySearch(searchInput)}
              style={{ width: "100%", padding: `${rem(12)} ${rem(16)}`, backgroundColor: PRIMARY, display: "flex", alignItems: "center", gap: rem(10) }}
            >
              <IconSearch size={15} stroke={2} color="white" />
              <Text size="sm" fw={700} c="white">
                Show problems with keyword &quot;{searchInput}&quot;
              </Text>
            </UnstyledButton>

            {SAVED_PROBLEMS
              .filter((p) => p.question.toLowerCase().includes(searchInput.toLowerCase()) || p.subject.toLowerCase().includes(searchInput.toLowerCase()))
              .slice(0, 5)
              .map((p) => {
                const meta = SUBJECT_META[p.subject];
                const Icon = meta.icon;
                return (
                  <UnstyledButton
                    key={p.id}
                    onClick={() => applySearch(searchInput)}
                    style={{ width: "100%", padding: `${rem(10)} ${rem(16)}`, display: "flex", alignItems: "center", gap: rem(10), borderBottom: "1px solid #F8FAFC" }}
                  >
                    <Box style={{ width: rem(28), height: rem(28), borderRadius: rem(7), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} stroke={1.5} color={meta.iconColor} />
                    </Box>
                    <Text size="sm" c={INK} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.question}
                    </Text>
                  </UnstyledButton>
                );
              })}
          </Box>
        ) : (
          <Box px="md" py="lg" style={{ textAlign: "center" }}>
            <Text size="sm" c="dimmed">Type to search by question text or subject</Text>
          </Box>
        )}
      </Modal>

      {/* ── Filter modal ── */}
      <Modal
        opened={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={<Text fw={700} size="md" c={INK}>Add Filter</Text>}
        radius="md"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
      >
        <Text size="sm" c="dimmed" mb="md">Select the criteria to filter by:</Text>

        <Group align="flex-start" gap="xl" mb="xl">
          {/* Subject */}
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
              Subject
            </Text>
            {SUBJECTS.map((s) => {
              const Icon = s.icon;
              const checked = draftSubjects.includes(s.key);
              return (
                <UnstyledButton
                  key={s.key}
                  onClick={() => toggleDraft(draftSubjects, setDraftSubjects, s.key)}
                  style={{ display: "flex", alignItems: "center", gap: rem(8) }}
                >
                  <Checkbox checked={checked} onChange={() => {}} color="dark" styles={{ input: { cursor: "pointer" } }} />
                  <Box style={{ width: rem(22), height: rem(22), borderRadius: rem(5), backgroundColor: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} stroke={1.5} color={s.iconColor} />
                  </Box>
                  <Text size="sm" fw={500} c={INK}>{s.key}</Text>
                </UnstyledButton>
              );
            })}
          </Stack>

          {/* Difficulty */}
          <Stack gap="xs" style={{ flex: 1 }}>
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
              Difficulty
            </Text>
            {DIFFICULTIES.map((d) => {
              const checked = draftDifficulties.includes(d);
              const style = DIFFICULTY_STYLE[d];
              return (
                <UnstyledButton
                  key={d}
                  onClick={() => toggleDraft(draftDifficulties, setDraftDifficulties, d)}
                  style={{ display: "flex", alignItems: "center", gap: rem(8) }}
                >
                  <Checkbox checked={checked} onChange={() => {}} color="dark" styles={{ input: { cursor: "pointer" } }} />
                  <Badge size="xs" radius="sm" style={{ backgroundColor: style.bg, color: style.color, fontWeight: 600 }}>
                    {d}
                  </Badge>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Group>

        <Group justify="space-between">
          <Button variant="outline" color="dark" radius="md" onClick={clearFilter}>
            Clear & Close
          </Button>
          <Button radius="md" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={applyFilter}>
            Apply Filter
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
