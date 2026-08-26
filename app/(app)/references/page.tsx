"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
  IconCards,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { fetchWords, fetchFormulas } from "./api";
import type { WordEntry, FormulaEntry } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

import { INK, PRIMARY, MUTED } from "@/constants/colors";
import { Pagination } from "@/components/ui/pagination";

import { TabBar } from "./components/TabBar";
import { SubjectChips, type SubjectFilter } from "./components/SubjectChips";
import { ViewToggle } from "./components/ViewToggle";
import { WordCard } from "./components/WordCard";
import { FormulaCard } from "./components/FormulaCard";
import { WordRow } from "./components/WordRow";
import { FormulaRow } from "./components/FormulaRow";
import { WordDetailModal } from "./components/WordDetailModal";
import { FormulaDetailModal } from "./components/FormulaDetailModal";
import { EmptyState } from "./components/EmptyState";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { FlashcardStudy } from "./components/FlashcardStudy";
import type { FlashcardItem } from "./components/flashcard-types";

// Strips diacritics (e.g. pinyin tone marks) and lowercases, so "daoshu" matches "dǎoshù".
function normalizeForSearch(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ─── Pagination ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

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
    <Box className="editorial-page" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        {/* Page header */}
        <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
          <Box>
            <Text className="editorial-page-title" mb={4}>References</Text>
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
        <Box className="warm-surface">
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
