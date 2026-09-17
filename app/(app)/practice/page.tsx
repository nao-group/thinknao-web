"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
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
  IconBookmark,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLock,
  IconPlus,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";
import { INK, SURFACE, PRIMARY, CREAM, MUTED } from "@/constants/colors";
import { notifications } from "@mantine/notifications";
import { Card } from "@/components/ui/card";
import { PaginationBtn } from "@/components/ui/pagination-btn";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useSubscriptionAccessGuard } from "@/components/subscription-access-guard";
import { useFreeTierWarning } from "@/components/free-tier-warning-modal";
import { useAccessTier } from "@/lib/free-tier";
import { SubjectCard } from "./components/SubjectCard";
import { QuestionCountPill } from "./components/QuestionCountPill";
import { TopicPill } from "./components/TopicPill";
import { PracticeSetRow } from "./components/PracticeSetRow";
import { AverageScoreOverview } from "./components/AverageScoreOverview";
import { SUBJECTS, SUBJECT_META, TOPIC_GROUPS, QUESTION_COUNTS, PAGE_SIZE, type SubjectKey } from "./data";
import type { ApiSession, SubjectScoreOverview, Topic } from "./types";
import { fetchAverageScoreOverview, fetchSessions, fetchTopics, generatePracticeSet, renameSession, deleteSession } from "./api";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticePage() {
  const subscriptionGuard = useSubscriptionAccessGuard();
  const freeTierWarning = useFreeTierWarning();
  const freeTierStatus = useAccessTier();
  const tier = freeTierStatus?.tier ?? null;
  const isFreeTier = tier === "free";
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey>("math");
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">("in-progress");

  // Sessions list
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftSubjectCodes, setDraftSubjectCodes] = useState<string[]>([]);
  const [appliedSubjectCodes, setAppliedSubjectCodes] = useState<string[]>([]);

  // Generate modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [modalTopic, setModalTopic] = useState<Topic | null>(null);
  const [activeTopicGroup, setActiveTopicGroup] = useState("All Topics");
  const [modalCount, setModalCount] = useState<number | "Custom">(20);
  const [modalCustomCount, setModalCustomCount] = useState<number | string>("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Score overview
  const [scoreOverview, setScoreOverview] = useState<SubjectScoreOverview[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);
  const [scoresError, setScoresError] = useState<string | null>(null);

  // ── Load sessions ─────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const status = activeTab === "in-progress" ? "in_progress" : "completed";
      const { sessions, totalPages: newTotalPages } = await fetchSessions({
        status,
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        subjectCodes: appliedSubjectCodes,
      });
      setSessions(sessions);
      setTotalPages(newTotalPages);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setSessionsError("Failed to load practice sets.");
    } finally {
      setSessionsLoading(false);
    }
  }, [activeTab, page, searchQuery, appliedSubjectCodes]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const loadScoreOverview = useCallback(async () => {
    setScoresLoading(true);
    setScoresError(null);
    try {
      setScoreOverview(await fetchAverageScoreOverview(SUBJECTS));
    } catch (err) {
      console.error("Failed to load score overview:", err);
      setScoresError("Score overview is temporarily unavailable.");
    } finally {
      setScoresLoading(false);
    }
  }, []);

  useEffect(() => { loadScoreOverview(); }, [loadScoreOverview]);

  // ── Tab / pagination helpers ───────────────────────────────────────────────
  function handleTabChange(tab: "in-progress" | "completed") {
    setActiveTab(tab);
    setPage(1);
  }

  function applySearch(query: string) {
    setSearchQuery(query);
    setPage(1);
    setSearchOpen(false);
  }

  function openFilter() {
    setDraftSubjectCodes(appliedSubjectCodes);
    setFilterOpen(true);
  }

  function applyFilter() {
    setAppliedSubjectCodes(draftSubjectCodes);
    setPage(1);
    setFilterOpen(false);
  }

  function clearFilter() {
    setDraftSubjectCodes([]);
    setAppliedSubjectCodes([]);
    setPage(1);
    setFilterOpen(false);
  }

  function toggleDraftSubject(code: string) {
    setDraftSubjectCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  // ── Generate practice set ─────────────────────────────────────────────────
  async function openGenerateModal(subjectKey: SubjectKey) {
    setSelectedSubject(subjectKey);
    setModalTopic(null);
    setModalCount(20);
    setModalCustomCount("");
    setGenerating(false);
    setGenerateError(null);
    setActiveTopicGroup(TOPIC_GROUPS[subjectKey]?.[0]?.label ?? "All Topics");
    setGenerateOpen(true);

    const subject = SUBJECTS.find((s) => s.key === subjectKey)!;
    setTopicsLoading(true);
    try {
      const fetchedTopics = await fetchTopics(subject.subjectCode);
      setTopics(fetchedTopics);
      if (isFreeTier) {
        const freeTopic = fetchedTopics.find((t) => t.is_free_tier);
        if (freeTopic) {
          setModalTopic(freeTopic);
          // Jump to the group containing the free topic so it's visible, not hidden behind the default tab.
          const normalize = (value: string) => value.trim().toLowerCase().replace(/[’‘]/g, "'");
          const definitions = TOPIC_GROUPS[subjectKey];
          const ownerGroup = definitions?.find((group) =>
            group.topics.some((name) => normalize(name) === normalize(freeTopic.name))
          );
          setActiveTopicGroup(ownerGroup?.label ?? "Other Topics");
        }
      }
    } catch (err) {
      console.error("Failed to load topics:", err);
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }

  function requireUnlockedAccess(action: () => void, actionIntent: string) {
    if (tier === "lapsed" || tier === null) {
      void subscriptionGuard.requireSubscription(action, actionIntent);
      return;
    }
    action(); // free-tier caps are enforced inside the generate flow, not here
  }

  /** Same as requireUnlockedAccess, plus a free-tier warning/upgrade step for actions that consume the question cap. */
  function requireGenerateAccess(action: () => void, actionIntent: string) {
    if (tier === "lapsed" || tier === null) {
      void subscriptionGuard.requireSubscription(action, actionIntent);
      return;
    }
    if (tier !== "free") {
      action();
      return;
    }
    const cap = freeTierStatus?.practice_questions_cap ?? 10;
    const used = freeTierStatus?.practice_questions_used ?? 0;
    const remaining = Math.max(0, cap - used);
    if (remaining <= 0) {
      subscriptionGuard.showUpgradeModal(actionIntent);
      return;
    }
    freeTierWarning.warnBeforeAction(action, { remaining, cap, unit: "practice questions" });
  }

  const groupedTopics = useMemo(() => {
    const definitions = TOPIC_GROUPS[selectedSubject];
    if (!definitions) return [{ label: "All Topics", topics }];

    const normalize = (value: string) => value.trim().toLowerCase().replace(/[’‘]/g, "'");
    const topicByName = new Map(topics.map((topic) => [normalize(topic.name), topic]));
    const grouped = definitions.map((group) => ({
      label: group.label,
      topics: group.topics
        .map((name) => topicByName.get(normalize(name)))
        .filter((topic): topic is Topic => Boolean(topic)),
    }));
    const assignedNames = new Set(definitions.flatMap((group) => group.topics.map(normalize)));
    const unmatched = topics.filter((topic) => !assignedNames.has(normalize(topic.name)));

    return unmatched.length > 0
      ? [...grouped, { label: "Other Topics", topics: unmatched }]
      : grouped;
  }, [selectedSubject, topics]);

  const visibleTopics = groupedTopics.find((group) => group.label === activeTopicGroup)?.topics ?? [];

  async function handleGenerate() {
    if (!modalTopic) return;
    const n = modalCount === "Custom" ? (Number(modalCustomCount) || 10) : modalCount;
    setGenerating(true);
    setGenerateError(null);
    try {
      const { sessionId, name } = await generatePracticeSet(modalTopic.id, n);
      setGenerateOpen(false);
      const subject = SUBJECTS.find((s) => s.key === selectedSubject)!;
      const paramObj: Record<string, string> = { topic: modalTopic.name, subject: subject.subjectCode };
      if (name) paramObj.name = name;
      const params = new URLSearchParams(paramObj);
      router.push(`/practice/${sessionId}?${params.toString()}`);
    } catch (err) {
      console.error("Generate failed:", err);
      setGenerateError("Failed to generate practice set. Please try again.");
      setGenerating(false);
    }
  }

  // ── Rename session ────────────────────────────────────────────────────────
  async function handleRename(sessionId: string, name: string) {
    try {
      await renameSession(sessionId, name);
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, name } : s));
      notifications.show({
        title: "Renamed",
        message: `Practice set renamed to "${name}".`,
        color: "green",
        position: "top-right",
      });
    } catch (err) {
      console.error("Rename failed:", err);
      notifications.show({
        title: "Rename failed",
        message: "Could not rename the practice set. Please try again.",
        color: "red",
        position: "top-right",
      });
    }
  }

  // ── Delete session ────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSession(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      if (activeTab === "completed") void loadScoreOverview();
      setDeleteTarget(null);
      notifications.show({
        title: "Deleted",
        message: `"${deleteTarget.name}" has been deleted.`,
        color: "red",
        position: "top-right",
      });
    } catch (err) {
      console.error("Delete failed:", err);
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the practice set. Please try again.",
        color: "red",
        position: "top-right",
      });
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box className="editorial-page" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group className="practice-page-layout" align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>

          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">

            {/* Generate Practice Set */}
            <Card p="xl" className="warm-surface">
              <Group justify="space-between" align="flex-start" mb={rem(6)}>
                <Box>
                  <Text className="editorial-section-title" size="lg" c={INK} mb={4}>Generate Practice Set</Text>
                  <Text size="sm" c="dimmed">Choose a subject to configure topics and generate your set</Text>
                </Box>
              </Group>

              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mt="lg" mb="sm">
                Select Subject
              </Text>
              <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing={rem(12)} mb="lg" style={{ padding: rem(4) }}>
                {SUBJECTS.map((s) => (
                  <SubjectCard
                    key={s.key}
                    subject={s}
                    selected={selectedSubject === s.key}
                    onSelect={() => requireGenerateAccess(
                      () => openGenerateModal(s.key),
                      `generate a ${s.label} practice set`,
                    )}
                  />
                ))}
              </SimpleGrid>
            </Card>

            {/* My Practice Sets */}
            <Card p="xl" className="warm-surface">
              <Group justify="space-between" align="center" mb="lg">
                <Text className="editorial-section-title" size="lg" c={INK}>My Practice Sets</Text>
                <Group gap="sm" align="center">
                  <Tooltip label="Search practice sets" position="bottom" withArrow>
                    <UnstyledButton
                      onClick={() => { setSearchInput(searchQuery); setSearchOpen(true); }}
                      aria-label="Search practice sets"
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        border: `1.5px solid ${searchQuery ? INK : "#D1D5DB"}`,
                        backgroundColor: searchQuery ? INK : "white",
                        color: searchQuery ? "white" : "#6B7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 150ms ease",
                      }}
                    >
                      <IconSearch size={14} stroke={2} />
                    </UnstyledButton>
                  </Tooltip>

                  <Tooltip label="Filter practice sets" position="bottom" withArrow>
                    <UnstyledButton
                      onClick={openFilter}
                      aria-label="Filter practice sets"
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        border: `1.5px solid ${appliedSubjectCodes.length > 0 ? INK : "#D1D5DB"}`,
                        backgroundColor: appliedSubjectCodes.length > 0 ? INK : "white",
                        color: appliedSubjectCodes.length > 0 ? "white" : "#6B7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 150ms ease",
                      }}
                    >
                      <IconAdjustmentsHorizontal size={14} stroke={2} />
                    </UnstyledButton>
                  </Tooltip>

                  <Group gap={0} style={{ borderRadius: rem(999), backgroundColor: SURFACE, padding: rem(4) }}>
                    {(["in-progress", "completed"] as const).map((tab) => (
                      <UnstyledButton
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        style={{
                          padding: `${rem(6)} ${rem(16)}`, borderRadius: rem(999),
                          backgroundColor: activeTab === tab ? INK : "transparent",
                          color: activeTab === tab ? "white" : "#667080",
                          fontSize: rem(13), fontWeight: activeTab === tab ? 600 : 400,
                          transition: "all 150ms ease", cursor: "pointer",
                        }}
                      >
                        {tab === "in-progress" ? "In Progress" : "Completed"}
                      </UnstyledButton>
                    ))}
                  </Group>
                </Group>
              </Group>

              {/* Active filter badges */}
              {(searchQuery || appliedSubjectCodes.length > 0) && (
                <Group gap={6} mb="sm">
                  {searchQuery && (
                    <Badge size="sm" radius="sm"
                      style={{ backgroundColor: SURFACE, color: INK, cursor: "pointer", fontWeight: 500 }}
                      rightSection={<Text size="xs" c="dimmed">✕</Text>}
                      onClick={() => applySearch("")}
                    >
                      &quot;{searchQuery}&quot;
                    </Badge>
                  )}
                  {appliedSubjectCodes.map((code) => {
                    const s = SUBJECTS.find((sub) => sub.subjectCode === code);
                    return s ? (
                      <Badge key={code} size="sm" radius="sm"
                        style={{ backgroundColor: s.iconBg, color: s.iconColor, cursor: "pointer", fontWeight: 500 }}
                        rightSection={<Text size="xs" style={{ color: s.iconColor, opacity: 0.7 }}>✕</Text>}
                        onClick={() => { setAppliedSubjectCodes((prev) => prev.filter((c) => c !== code)); setPage(1); }}
                      >
                        {s.label}
                      </Badge>
                    ) : null;
                  })}
                </Group>
              )}

              {/* Error banner */}
              {sessionsError && (
                <Group gap={rem(6)} p="sm" mb="md"
                  style={{ backgroundColor: "#FEF2F2", borderRadius: rem(8), border: "1px solid #FECACA" }}>
                  <IconAlertCircle size={16} color="#EF4444" />
                  <Text size="sm" c="#EF4444">{sessionsError}</Text>
                </Group>
              )}

              {/* Search indicator */}
              {searchQuery && (
                <Group gap={rem(6)} mb="sm">
                  <Text size="xs" c={MUTED}>Showing results for</Text>
                  <Box px="xs" py={2} style={{ backgroundColor: CREAM, borderRadius: rem(999) }}>
                    <Text size="xs" fw={600} c={PRIMARY}>&quot;{searchQuery}&quot;</Text>
                  </Box>
                  <UnstyledButton onClick={() => applySearch("")} style={{ color: MUTED, fontSize: rem(12) }}>
                    ✕ Clear
                  </UnstyledButton>
                </Group>
              )}

              {/* Practice set rows */}
              {sessionsLoading ? (
                <Stack gap={0}>
                  {Array.from({ length: 3 }, (_, i) => (
                    <Box key={i} style={{
                      display: "flex", alignItems: "center", gap: rem(14),
                      padding: `${rem(16)} 0`, borderBottom: "1px solid #F1F5F9",
                    }}>
                      <Box style={{ width: rem(40), height: rem(40), borderRadius: rem(10), backgroundColor: SURFACE, flexShrink: 0 }} />
                      <Stack gap={rem(6)} style={{ flex: 1 }}>
                        <Box style={{ height: rem(14), width: "40%", backgroundColor: SURFACE, borderRadius: rem(4) }} />
                        <Box style={{ height: rem(12), width: "25%", backgroundColor: SURFACE, borderRadius: rem(4) }} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : sessions.length === 0 ? (
                <EmptyState
                  title={searchQuery ? "No matching practice sets" : activeTab === "in-progress" ? "Nothing in progress" : "No completed sets yet"}
                  description={searchQuery ? `Try another keyword instead of “${searchQuery}”.` : activeTab === "in-progress" ? "Generate a set above and your progress will be saved here." : "Finish a practice set to build your review history."}
                />
              ) : (
                <Stack key={activeTab} gap={0} className="tab-fade-in">
                  {sessions.map((session) => (
                    <PracticeSetRow
                      key={session.id}
                      session={session}
                      action={activeTab === "completed" ? "Review" : "Continue"}
                      onContinue={() => requireUnlockedAccess(() => {
                        const params = new URLSearchParams({
                          name: session.name,
                          topic: session.topic_name,
                          subject: session.subject_code,
                        });
                        const base = `/practice/${session.id}`;
                        router.push(
                          session.status === "completed"
                            ? `${base}?review=true&${params.toString()}`
                            : `${base}?${params.toString()}`
                        );
                      }, session.status === "completed" ? "review this practice set" : "continue this practice set")}
                      onRename={handleRename}
                      onDelete={(id, name) => setDeleteTarget({ id, name })}
                    />
                  ))}
                </Stack>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="flex-end" align="center" gap={6} mt="md">
                  <PaginationBtn
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous"
                  >
                    <IconChevronLeft size={14} stroke={2} />
                  </PaginationBtn>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <UnstyledButton
                      key={i}
                      onClick={() => setPage(i + 1)}
                      style={{
                        width: rem(32), height: rem(32), borderRadius: rem(8),
                        fontSize: rem(13), fontWeight: 600,
                        border: `1.5px solid ${i + 1 === page ? INK : "#D1D5DB"}`,
                        backgroundColor: i + 1 === page ? INK : "white",
                        color: i + 1 === page ? "white" : "#6B7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 150ms ease",
                      }}
                    >
                      {i + 1}
                    </UnstyledButton>
                  ))}

                  <PaginationBtn
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Next"
                  >
                    <IconChevronRight size={14} stroke={2} />
                  </PaginationBtn>
                </Group>
              )}
            </Card>
          </Stack>

          {/* ── Right panel ── */}
          <Stack className="practice-insights-sidebar" gap="md">
            <Box p="xl" style={{ backgroundColor: INK, borderRadius: rem(14) }}>
              <Group justify="space-between" align="flex-start" mb={rem(12)}>
                <Box style={{
                  width: rem(40), height: rem(40), borderRadius: rem(10),
                  backgroundColor: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconBookmark size={18} stroke={1.5} color="white" />
                </Box>
              </Group>
              <Text fw={700} size="md" c="white" mb={4}>Saved Problems</Text>
              <Text size="xs" c="rgba(255,255,255,0.55)" lh={1.6} mb="lg">
                Problems you bookmarked for later review
              </Text>
              <Button
                fullWidth size="sm"
                leftSection={<IconBookmark size={14} stroke={1.5} />}
                style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600, borderRadius: rem(8) }}
                onClick={() => router.push("/practice/saved-problems")}
              >
                View Saved Problems
              </Button>
            </Box>

            <AverageScoreOverview
              data={scoreOverview}
              loading={scoresLoading}
              error={scoresError}
            />
          </Stack>
        </Group>
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
            placeholder="Search practice sets..."
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
                Search for &quot;{searchInput}&quot;
              </Text>
            </UnstyledButton>
            {/* Suggestions from currently loaded sessions */}
            {sessions
              .filter((s) => s.name.toLowerCase().includes(searchInput.toLowerCase()))
              .slice(0, 5)
              .map((s) => {
                const meta = SUBJECT_META[s.subject_code] ?? SUBJECT_META["MT"];
                const Icon = meta.icon;
                return (
                  <UnstyledButton
                    key={s.id}
                    onClick={() => {
                      setSearchOpen(false);
                      const params = new URLSearchParams({ name: s.name, topic: s.topic_name, subject: s.subject_code });
                      const base = `/practice/${s.id}`;
                      router.push(s.status === "completed" ? `${base}?review=true&${params.toString()}` : `${base}?${params.toString()}`);
                    }}
                    style={{ width: "100%", padding: `${rem(10)} ${rem(16)}`, display: "flex", alignItems: "center", gap: rem(10), borderBottom: "1px solid #F8FAFC" }}
                  >
                    <Box style={{ width: rem(28), height: rem(28), borderRadius: rem(7), backgroundColor: meta.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} stroke={1.5} color={meta.iconColor} />
                    </Box>
                    <Text size="sm" c={INK}>{s.name}</Text>
                  </UnstyledButton>
                );
              })}
          </Box>
        ) : (
          <Box px="md" py="lg" style={{ textAlign: "center" }}>
            <Text size="sm" c="dimmed">Type to search practice sets by name</Text>
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
        <Text size="sm" c="dimmed" mb="md">Select the subjects to filter by:</Text>

        <Stack gap="xs" mb="xl">
          <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
            Subject
          </Text>
          {SUBJECTS.map((s) => {
            const Icon = s.icon;
            const checked = draftSubjectCodes.includes(s.subjectCode);
            return (
              <UnstyledButton
                key={s.key}
                onClick={() => toggleDraftSubject(s.subjectCode)}
                style={{ display: "flex", alignItems: "center", gap: rem(10) }}
              >
                <Checkbox checked={checked} onChange={() => {}} color="dark" styles={{ input: { cursor: "pointer" } }} />
                <Box style={{
                  width: rem(22), height: rem(22), borderRadius: rem(5),
                  backgroundColor: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={12} stroke={1.5} color={s.iconColor} />
                </Box>
                <Text size="sm" fw={500} c={INK}>{s.label}</Text>
              </UnstyledButton>
            );
          })}
        </Stack>

        <Group justify="space-between">
          <Button variant="outline" color="dark" radius="md" onClick={clearFilter}>
            Clear &amp; Close
          </Button>
          <Button radius="md" style={{ backgroundColor: INK, color: "white", fontWeight: 600 }} onClick={applyFilter}>
            Apply Filter
          </Button>
        </Group>
      </Modal>

      {/* ── Delete confirmation modal ── */}
      <Modal
        opened={deleteTarget !== null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={<Text fw={700} size="md" c={INK}>Delete Practice Set</Text>}
        radius="md"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
      >
        <Text size="sm" c="dimmed" mb="xl">
          Are you sure you want to delete{" "}
          <Text span fw={600} c={INK}>&quot;{deleteTarget?.name}&quot;</Text>?
          This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" color="dark" radius="md" disabled={deleting} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            radius="md"
            color="red"
            loading={deleting}
            onClick={handleDelete}
            style={{ fontWeight: 600 }}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      {/* ── Generate modal ── */}
      {(() => {
        const subject = SUBJECTS.find((s) => s.key === selectedSubject)!;
        const SubjectIcon = subject.icon;
        return (
          <Modal
            opened={generateOpen}
            onClose={() => setGenerateOpen(false)}
            title={
              <Group gap={10} align="center">
                <Box style={{
                  width: rem(34), height: rem(34), borderRadius: rem(9),
                  backgroundColor: subject.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <SubjectIcon size={18} stroke={1.5} color={subject.iconColor} />
                </Box>
                <Box>
                  <Text fw={700} size="md" c={INK}>{subject.label}</Text>
                  <Text size="xs" c="dimmed">Configure your practice set</Text>
                </Box>
              </Group>
            }
            radius="lg"
            size="lg"
            overlayProps={{ backgroundOpacity: 0.3, blur: 2 }}
            styles={{ body: { maxHeight: "calc(100dvh - 140px)", overflowY: "auto" } }}
          >
            {isFreeTier && (
              <Group gap={rem(6)} p="sm" mb="md" style={{ backgroundColor: CREAM, borderRadius: rem(8), border: `1px solid ${PRIMARY}` }}>
                <IconStar size={14} stroke={1.5} color={PRIMARY} fill={PRIMARY} />
                <Text size="sm" fw={600} c={PRIMARY}>
                  Free plan: {Math.max(0, (freeTierStatus?.practice_questions_cap ?? 10) - (freeTierStatus?.practice_questions_used ?? 0))} of {freeTierStatus?.practice_questions_cap ?? 10} practice questions left
                </Text>
              </Group>
            )}

            {/* Topic groups */}
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="sm">
              Topic Group
            </Text>

            {topicsLoading ? (
              <Box py="md" mb="lg" style={{ display: "flex", gap: rem(8), overflow: "hidden" }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Box key={i} style={{ height: rem(32), width: rem(120), backgroundColor: SURFACE, borderRadius: rem(999) }} />
                ))}
              </Box>
            ) : topics.length === 0 ? (
              <EmptyState compact title="No topics available" description="Try selecting another subject." mb="xl" />
            ) : (
              <>
                <Box
                  mb="lg"
                  pb={4}
                  role="tablist"
                  aria-label={`${subject.label} topic groups`}
                  style={{ display: "flex", gap: rem(8), overflowX: "auto" }}
                >
                  {groupedTopics.map((group) => (
                    <TopicPill
                      key={group.label}
                      label={group.label}
                      selected={activeTopicGroup === group.label}
                      onToggle={() => {
                        setActiveTopicGroup(group.label);
                        setModalTopic(null);
                        setGenerateError(null);
                      }}
                    />
                  ))}
                </Box>

                <Group justify="space-between" align="center" mb="sm">
                  <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed">
                    Choose Topic
                  </Text>
                  <Text size="xs" c="dimmed">In recommended learning order</Text>
                </Group>

                <Stack gap={8} mb="xl">
                  {visibleTopics.map((topic, index) => {
                    const selected = modalTopic?.id === topic.id;
                    const locked = isFreeTier && !topic.is_free_tier;
                    return (
                      <UnstyledButton
                        key={topic.id}
                        onClick={() => {
                          if (locked) {
                            void subscriptionGuard.requireSubscription(() => {}, "practice this topic");
                            return;
                          }
                          setModalTopic(selected ? null : topic);
                          setGenerateError(null);
                        }}
                        aria-pressed={selected}
                        style={{
                          width: "100%", minHeight: rem(48), padding: `${rem(10)} ${rem(12)}`,
                          borderRadius: rem(10), border: `1.5px solid ${selected ? subject.iconColor : "#E2E8F0"}`,
                          backgroundColor: selected ? subject.iconBg : "#FFFDF8",
                          display: "flex", alignItems: "center", gap: rem(12),
                          opacity: locked ? 0.55 : 1,
                          transition: "border-color 150ms ease, background-color 150ms ease, transform 150ms ease",
                        }}
                      >
                        <Box style={{
                          width: rem(28), height: rem(28), borderRadius: rem(8), flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: selected ? subject.iconColor : SURFACE,
                          color: selected ? "white" : MUTED, fontSize: rem(12), fontWeight: 700,
                        }}>
                          {locked ? <IconLock size={13} stroke={2} /> : selected ? <IconCheck size={15} stroke={2.5} /> : index + 1}
                        </Box>
                        <Text size="sm" fw={selected ? 700 : 500} c={INK} style={{ textAlign: "left" }}>
                          {topic.name}
                        </Text>
                      </UnstyledButton>
                    );
                  })}
                  {visibleTopics.length === 0 && (
                    <Box p="md" style={{ borderRadius: rem(10), backgroundColor: SURFACE, textAlign: "center" }}>
                      <Text size="sm" c="dimmed">No topics are available in this group yet.</Text>
                    </Box>
                  )}
                </Stack>
              </>
            )}

            {/* Question count */}
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="sm">
              Number of Questions
            </Text>
            {isFreeTier ? (
              <Text size="sm" c={MUTED} mb="xl">
                {Math.max(0, (freeTierStatus?.practice_questions_cap ?? 10) - (freeTierStatus?.practice_questions_used ?? 0))} question(s) remaining on the free plan
              </Text>
            ) : (
              <Group gap="sm" align="center" mb="xl">
                {QUESTION_COUNTS.map((count) => (
                  <QuestionCountPill
                    key={count}
                    value={count}
                    selected={modalCount === count}
                    onSelect={() => setModalCount(count as number | "Custom")}
                  />
                ))}
                {modalCount === "Custom" && (
                  <NumberInput
                    value={modalCustomCount}
                    onChange={setModalCustomCount}
                    placeholder="e.g. 15"
                    min={1} max={200} size="xs" radius="xl"
                    style={{ width: rem(90) }}
                    styles={{ input: { textAlign: "center" } }}
                  />
                )}
              </Group>
            )}

            {generateError && (
              <Group gap={rem(6)} p="sm" mb="md"
                style={{ backgroundColor: "#FEF2F2", borderRadius: rem(8), border: "1px solid #FECACA" }}>
                <IconAlertCircle size={16} color="#EF4444" />
                <Text size="sm" c="#EF4444">{generateError}</Text>
              </Group>
            )}

            <Group justify="space-between">
              <Button variant="outline" color="dark" radius="md" onClick={() => setGenerateOpen(false)}>
                Cancel
              </Button>
              <LandingActionButton
                rightSection={<IconPlus size={15} stroke={2.2} />}
                loading={generating}
                disabled={!modalTopic || topicsLoading}
                onClick={handleGenerate}
              >
                Generate Practice Set
              </LandingActionButton>
            </Group>
          </Modal>
        );
      })()}
      {subscriptionGuard.modal}
      {freeTierWarning.modal}
    </Box>
  );
}
