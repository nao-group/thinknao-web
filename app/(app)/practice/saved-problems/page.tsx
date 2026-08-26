"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import type { Difficulty } from "./types";
import { SUBJECTS, SUBJECT_META, PAGE_SIZE } from "../data";
import { INK, SURFACE, PRIMARY, CREAM } from "@/constants/colors";
import { PaginationBtn } from "@/components/ui/pagination-btn";
import { Card } from "@/components/ui/card";
import { ProblemRow, DIFFICULTY_STYLE, DIFFICULTY_LABEL } from "./components/ProblemRow";
import { fetchSavedQuestions, removeBookmark } from "./api";
import type { SavedQuestion } from "./types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SavedProblemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<SavedQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSubjects, setDraftSubjects] = useState<string[]>([]);
  const [draftDifficulties, setDraftDifficulties] = useState<string[]>([]);
  const [appliedSubjects, setAppliedSubjects] = useState<string[]>([]);
  const [appliedDifficulties, setAppliedDifficulties] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const activeFilters = appliedSubjects.length + appliedDifficulties.length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSavedQuestions({
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        subjectCodes: appliedSubjects,
        difficulties: appliedDifficulties as Difficulty[],
        sort: sortOrder,
      });
      setItems(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Failed to load saved questions:", err);
      setError("Failed to load saved questions.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, appliedSubjects, appliedDifficulties, sortOrder]);

  useEffect(() => { load(); }, [load]);

  function applySearch(query: string) {
    setSearchQuery(query);
    setPage(1);
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
    setPage(1);
    setFilterOpen(false);
  }

  function clearFilter() {
    setDraftSubjects([]);
    setDraftDifficulties([]);
    setAppliedSubjects([]);
    setAppliedDifficulties([]);
    setPage(1);
    setFilterOpen(false);
  }

  async function handleRemoveBookmark(questionId: string) {
    const previous = items;
    setItems((prev) => prev.filter((p) => p.question_id !== questionId));
    setTotal((t) => Math.max(0, t - 1));
    try {
      await removeBookmark(questionId);
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
      setItems(previous);
      setTotal((t) => t + 1);
    }
  }

  function toggleDraft(list: string[], set: (v: string[]) => void, value: string) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  }

  // Match the same flattened text the server matches (question_text_plain), so a
  // suggestion that appears here is guaranteed to survive the real search too.
  const searchSuggestions = useMemo(() => {
    const needle = searchInput.toLowerCase();
    return items
      .filter((p) => p.question_text_plain.toLowerCase().includes(needle))
      .slice(0, 5);
  }, [items, searchInput]);

  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Card p="xl">

          {/* Header row */}
          <Group justify="space-between" align="center" mb="lg">
            <Group gap={10} align="center">
              <Text fw={700} size="lg" c={INK}>Saved Problems</Text>
              <Badge
                size="sm"
                radius="sm"
                style={{ backgroundColor: CREAM, color: PRIMARY, fontWeight: 700 }}
              >
                {total} saved
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
                onChange={(val) => { setSortOrder((val as "newest" | "oldest") ?? "newest"); setPage(1); }}
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
                  onClick={() => { setSearchQuery(""); setPage(1); }}
                >
                  &quot;{searchQuery}&quot;
                </Badge>
              )}
              {appliedSubjects.map((code) => {
                const s = SUBJECTS.find((sub) => sub.subjectCode === code);
                return s ? (
                  <Badge
                    key={code}
                    size="sm"
                    radius="sm"
                    style={{ backgroundColor: SURFACE, color: INK, cursor: "pointer", fontWeight: 500 }}
                    rightSection={<Text size="xs" c="dimmed">✕</Text>}
                    onClick={() => { setAppliedSubjects((prev) => prev.filter((x) => x !== code)); setPage(1); }}
                  >
                    {s.label}
                  </Badge>
                ) : null;
              })}
              {appliedDifficulties.map((d) => (
                <Badge
                  key={d}
                  size="sm"
                  radius="sm"
                  style={{ backgroundColor: DIFFICULTY_STYLE[d as Difficulty].bg, color: DIFFICULTY_STYLE[d as Difficulty].color, cursor: "pointer", fontWeight: 500 }}
                  rightSection={<Text size="xs" c="dimmed">✕</Text>}
                  onClick={() => { setAppliedDifficulties((prev) => prev.filter((x) => x !== d)); setPage(1); }}
                >
                  {DIFFICULTY_LABEL[d as Difficulty]}
                </Badge>
              ))}
            </Group>
          )}

          {/* Error banner */}
          {error && (
            <Group gap={rem(6)} p="sm" mb="md"
              style={{ backgroundColor: "#FEF2F2", borderRadius: rem(8), border: "1px solid #FECACA" }}>
              <IconAlertCircle size={16} color="#EF4444" />
              <Text size="sm" c="#EF4444">{error}</Text>
            </Group>
          )}

          {/* Problem rows */}
          {loading ? (
            <Stack gap={0}>
              {Array.from({ length: 3 }, (_, i) => (
                <Box key={i} style={{
                  display: "flex", alignItems: "center", gap: rem(14),
                  padding: `${rem(16)} 0`, borderBottom: "1px solid #F1F5F9",
                }}>
                  <Box style={{ width: rem(40), height: rem(40), borderRadius: rem(10), backgroundColor: SURFACE, flexShrink: 0 }} />
                  <Stack gap={rem(6)} style={{ flex: 1 }}>
                    <Box style={{ height: rem(14), width: "60%", backgroundColor: SURFACE, borderRadius: rem(4) }} />
                    <Box style={{ height: rem(12), width: "25%", backgroundColor: SURFACE, borderRadius: rem(4) }} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack key={`${searchQuery}-${appliedSubjects.join()}-${appliedDifficulties.join()}-${sortOrder}-${page}`} gap={0} className="tab-fade-in">
              {items.length > 0 ? (
                items.map((p) => (
                  <ProblemRow
                    key={p.question_id}
                    problem={p}
                    onRemove={handleRemoveBookmark}
                    onView={(id) => router.push(`/practice/saved-problems/${id}`)}
                  />
                ))
              ) : (
                <Box py="xl" style={{ textAlign: "center" }}>
                  <Text c="dimmed" size="sm">
                    {searchQuery || activeFilters > 0
                      ? "No saved problems match your filters."
                      : "No saved problems yet — bookmark a question from a practice session to see it here."}
                  </Text>
                </Box>
              )}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="flex-end" align="center" gap={6} mt="md">
              <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous">
                <IconChevronLeft size={14} stroke={2} />
              </PaginationBtn>

              {Array.from({ length: totalPages }, (_, i) => (
                <UnstyledButton
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    fontSize: rem(13),
                    fontWeight: 600,
                    border: `1.5px solid ${i + 1 === page ? INK : "#D1D5DB"}`,
                    backgroundColor: i + 1 === page ? INK : "white",
                    color: i + 1 === page ? "white" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  {i + 1}
                </UnstyledButton>
              ))}

              <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next">
                <IconChevronRight size={14} stroke={2} />
              </PaginationBtn>
            </Group>
          )}
        </Card>
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

            {searchSuggestions.map((p) => {
              const meta = SUBJECT_META[p.subject_code ?? ""] ?? SUBJECT_META["MT"];
              const Icon = meta.icon;
              return (
                <UnstyledButton
                  key={p.question_id}
                  onClick={() => applySearch(searchInput)}
                  style={{ width: "100%", padding: `${rem(10)} ${rem(16)}`, display: "flex", alignItems: "center", gap: rem(10), borderBottom: "1px solid #F8FAFC" }}
                >
                  <Box style={{ width: rem(28), height: rem(28), borderRadius: rem(7), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={13} stroke={1.5} color={meta.iconColor} />
                  </Box>
                  <Text size="sm" c={INK} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.question_text_plain}
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
        size="md"
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
              const checked = draftSubjects.includes(s.subjectCode);
              return (
                <UnstyledButton
                  key={s.key}
                  onClick={() => toggleDraft(draftSubjects, setDraftSubjects, s.subjectCode)}
                  style={{ display: "flex", alignItems: "center", gap: rem(8) }}
                >
                  <Checkbox checked={checked} onChange={() => {}} color="dark" styles={{ input: { cursor: "pointer" } }} />
                  <Box style={{ width: rem(22), height: rem(22), borderRadius: rem(5), backgroundColor: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} stroke={1.5} color={s.iconColor} />
                  </Box>
                  <Text size="sm" fw={500} c={INK}>{s.label}</Text>
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
                    {DIFFICULTY_LABEL[d]}
                  </Badge>
                </UnstyledButton>
              );
            })}
          </Stack>
        </Group>

        <Group justify="space-between">
          <Button variant="outline" color="dark" radius="md" onClick={clearFilter}>
            Clear &amp; Close
          </Button>
          <Button radius="md" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={applyFilter}>
            Apply Filter
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
