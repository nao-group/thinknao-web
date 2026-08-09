"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
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
  IconAtom,
  IconBookmark,
  IconChevronLeft,
  IconChevronRight,
  IconFlask,
  IconMathFunction,
  IconBook,
  IconMicroscope,
  IconPencil,
  IconPlus,
  IconSearch,
  IconStar,
} from "@tabler/icons-react";
import { INK, SURFACE, PRIMARY, CREAM, INDIGO, PANDA, VIOLET, EMERALD, MUTED } from "@/constants/colors";
import { notifications } from "@mantine/notifications";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiSession {
  id: string;
  name: string;
  status: "in_progress" | "completed";
  topic_id: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  topic_name: string;
  topic_code: string;
  created_at: string;
}

interface Topic {
  id: string;
  name: string;
  code: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { key: "math",    label: "Mathematics",         icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY, subjectCode: "MT" },
  { key: "physics", label: "Physics",              icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO,  subjectCode: "PH" },
  { key: "chem",    label: "Chemistry",            icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA,   subjectCode: "CM" },
  { key: "lac",     label: "Liberal Arts Chinese", icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET,  subjectCode: "WH" },
  { key: "sc",      label: "Science Chinese",      icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD, subjectCode: "LH" },
] as const;

type SubjectKey = (typeof SUBJECTS)[number]["key"];

/** Visual metadata keyed by API subject_code */
const SUBJECT_META: Record<string, {
  icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
  iconBg: string;
  iconColor: string;
}> = {
  MT: { icon: IconMathFunction, iconBg: CREAM,     iconColor: PRIMARY },
  PH: { icon: IconAtom,         iconBg: "#EEF0FF", iconColor: INDIGO  },
  CM: { icon: IconFlask,        iconBg: "#FDF0EC", iconColor: PANDA   },
  WH: { icon: IconBook,         iconBg: "#F5F3FF", iconColor: VIOLET  },
  LH: { icon: IconMicroscope,   iconBg: "#ECFDF5", iconColor: EMERALD },
};

const QUESTION_COUNTS = [10, 20, 40, "Custom"] as const;
const PAGE_SIZE = 10;

// ─── Sub-components ────────────────────────────────────────────────────────────

function SubjectCard({
  subject,
  selected,
  onSelect,
}: {
  subject: (typeof SUBJECTS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = subject.icon;
  return (
    <UnstyledButton
      onClick={onSelect}
      className="hover-zoom"
      style={{
        width: "100%", height: "100%", padding: rem(20),
        borderRadius: rem(12),
        border: `2px solid ${selected ? PRIMARY : "#E2E8F0"}`,
        backgroundColor: selected ? CREAM : "white",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: rem(10), transition: "border-color 150ms ease, background-color 150ms ease",
        cursor: "pointer",
      }}
    >
      <Box style={{
        width: rem(48), height: rem(48), borderRadius: rem(12),
        backgroundColor: subject.iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} stroke={1.5} color={subject.iconColor} />
      </Box>
      <Text size="sm" fw={selected ? 700 : 500} c={selected ? PRIMARY : INK}
        style={{ transition: "color 150ms ease", textAlign: "center" }}>
        {subject.label}
      </Text>
    </UnstyledButton>
  );
}

function QuestionCountPill({
  value, selected, onSelect,
}: { value: number | string; selected: boolean; onSelect: () => void }) {
  return (
    <UnstyledButton onClick={onSelect} style={{
      padding: `${rem(6)} ${rem(16)}`, borderRadius: rem(999),
      backgroundColor: selected ? INK : "transparent",
      border: `1px solid ${selected ? INK : "#CBD5E1"}`,
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      color: selected ? "white" : INK, transition: "all 150ms ease", cursor: "pointer",
    }}>
      {value}
    </UnstyledButton>
  );
}

function TopicPill({
  label, selected, onToggle,
}: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <UnstyledButton onClick={onToggle} style={{
      padding: `${rem(6)} ${rem(12)}`, borderRadius: rem(999),
      backgroundColor: selected ? INK : "white",
      border: `1.5px solid ${selected ? INK : "#CBD5E1"}`,
      fontSize: rem(13), fontWeight: selected ? 600 : 400,
      color: selected ? "white" : INK, transition: "all 150ms ease",
      cursor: "pointer", whiteSpace: "nowrap",
    }}>
      {label}
    </UnstyledButton>
  );
}

function PaginationBtn({ children, onClick, "aria-label": ariaLabel }: {
  children: React.ReactNode; onClick: () => void; "aria-label": string;
}) {
  return (
    <UnstyledButton onClick={onClick} aria-label={ariaLabel} style={{
      width: rem(32), height: rem(32), borderRadius: rem(8),
      border: "1.5px solid #D1D5DB", backgroundColor: "white", color: "#6B7280",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {children}
    </UnstyledButton>
  );
}

function PracticeSetRow({
  session, action, onContinue, onRename,
}: {
  session: ApiSession;
  action: string;
  onContinue: () => void;
  onRename: (id: string, name: string) => Promise<void>;
}) {
  const meta = SUBJECT_META[session.subject_code] ?? SUBJECT_META["MT"];
  const Icon = meta.icon;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.name);

  const createdDate = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  async function commitEdit() {
    setEditing(false);
    if (editValue.trim() && editValue !== session.name) {
      await onRename(session.id, editValue.trim());
    } else {
      setEditValue(session.name);
    }
  }

  return (
    <Box className="hover-zoom" style={{
      display: "flex", alignItems: "center", gap: rem(14),
      padding: `${rem(16)} 0`, borderBottom: "1px solid #F1F5F9",
    }}>
      <Box style={{
        width: rem(40), height: rem(40), borderRadius: rem(10),
        backgroundColor: meta.iconBg, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} stroke={1.5} color={meta.iconColor} />
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <TextInput
            value={editValue}
            onChange={(e) => setEditValue(e.currentTarget.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") { setEditValue(session.name); setEditing(false); }
            }}
            size="xs"
            autoFocus
            styles={{ input: { fontWeight: 600, fontSize: rem(14), color: INK, padding: `${rem(2)} ${rem(6)}` } }}
          />
        ) : (
          <Group gap={4} align="center" mb={4}>
            <Text size="sm" fw={600} c={INK}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {editValue}
            </Text>
            <Tooltip label="Rename" withArrow position="top">
              <UnstyledButton
                onClick={() => setEditing(true)}
                style={{ display: "flex", alignItems: "center", color: "#94A3B8", flexShrink: 0 }}
              >
                <IconPencil size={13} stroke={1.5} />
              </UnstyledButton>
            </Tooltip>
          </Group>
        )}
        <Text size="xs" c="dimmed">
          {session.topic_name} · Created {createdDate}
        </Text>
      </Box>

      <Button size="xs" variant="default" radius="sm" style={{ flexShrink: 0 }} onClick={onContinue}>
        {action}
      </Button>
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PracticePage() {
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
  const [modalCount, setModalCount] = useState<number | "Custom">(20);
  const [modalCustomCount, setModalCustomCount] = useState<number | string>("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Search modal
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // ── Load sessions ─────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const status = activeTab === "in-progress" ? "in_progress" : "completed";
      const { data } = await api.get("/api/sessions", {
        params: {
          type: "practice",
          status,
          page,
          page_size: PAGE_SIZE,
          ...(searchQuery ? { search: searchQuery } : {}),
          ...(appliedSubjectCodes.length > 0 ? { subject_codes: appliedSubjectCodes } : {}),
        },
        paramsSerializer: (params) => {
          const qs = new URLSearchParams();
          for (const [key, value] of Object.entries(params)) {
            if (Array.isArray(value)) {
              value.forEach((v) => qs.append(key, v));
            } else if (value !== undefined && value !== null) {
              qs.append(key, String(value));
            }
          }
          return qs.toString();
        },
      });
      setSessions(data.sessions ?? []);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      setSessionsError("Failed to load practice sets.");
    } finally {
      setSessionsLoading(false);
    }
  }, [activeTab, page, searchQuery, appliedSubjectCodes]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

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
  async function openGenerateModal() {
    setModalTopic(null);
    setModalCount(20);
    setModalCustomCount("");
    setGenerateError(null);
    setGenerateOpen(true);

    const subject = SUBJECTS.find((s) => s.key === selectedSubject)!;
    setTopicsLoading(true);
    try {
      const { data } = await api.get(`/api/subjects/${subject.subjectCode}/topics`);
      setTopics(data.topics ?? []);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }

  async function handleGenerate() {
    if (!modalTopic) return;
    const n = modalCount === "Custom" ? (Number(modalCustomCount) || 10) : modalCount;
    setGenerating(true);
    setGenerateError(null);
    try {
      const { data } = await api.post("/api/practice", { topic_id: modalTopic.id, n });
      setGenerateOpen(false);
      const paramObj: Record<string, string> = { topic: modalTopic.name };
      if (data.name) paramObj.name = data.name;
      const params = new URLSearchParams(paramObj);
      router.push(`/practice/${data.session_id}?${params.toString()}`);
    } catch (err) {
      console.error("Generate failed:", err);
      setGenerateError("Failed to generate practice set. Please try again.");
      setGenerating(false);
    }
  }

  // ── Rename session ────────────────────────────────────────────────────────
  async function handleRename(sessionId: string, name: string) {
    try {
      await api.patch(`/api/sessions/${sessionId}/name`, { name });
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box p={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        <Group align="flex-start" gap="xl" wrap="nowrap" style={{ alignItems: "stretch" }}>

          {/* ── Main column ── */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">

            {/* Generate Practice Set */}
            <Box p="xl" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              <Group justify="space-between" align="flex-start" mb={rem(6)}>
                <Box>
                  <Text fw={700} size="lg" c={INK} mb={4}>Generate Practice Set</Text>
                  <Text size="sm" c="dimmed">Choose a subject and let AI build your set instantly</Text>
                </Box>
                <Group gap={6} px="sm" py={rem(6)} style={{ borderRadius: rem(999), border: `1px solid ${PRIMARY}`, flexShrink: 0 }}>
                  <IconStar size={13} stroke={1.5} color={PRIMARY} fill={PRIMARY} />
                  <Text size="xs" fw={600} c={PRIMARY}>AI-Powered</Text>
                </Group>
              </Group>

              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mt="lg" mb="sm">
                Select Subject
              </Text>
              <Box mb="lg" style={{ display: "flex", gap: rem(12), overflowX: "auto", paddingBottom: rem(4), paddingTop: rem(4), paddingLeft: rem(4), paddingRight: rem(4) }}>
                {SUBJECTS.map((s) => (
                  <Box key={s.key} style={{ width: rem(150), flex: "0 0 auto", alignSelf: "stretch" }}>
                    <SubjectCard subject={s} selected={selectedSubject === s.key} onSelect={() => setSelectedSubject(s.key)} />
                  </Box>
                ))}
              </Box>

              <Group justify="flex-end">
                <Button
                  leftSection={<IconPlus size={15} stroke={2} />}
                  size="md" radius="lg" onClick={openGenerateModal}
                  style={{ backgroundColor: INK, color: "white", fontWeight: 600, paddingLeft: rem(15) }}
                >
                  Generate Practice Set
                </Button>
              </Group>
            </Box>

            {/* My Practice Sets */}
            <Box p="xl" style={{ backgroundColor: "white", borderRadius: rem(14) }}>
              <Group justify="space-between" align="center" mb="lg">
                <Text fw={700} size="lg" c={INK}>My Practice Sets</Text>
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
                <Box py="xl" style={{ textAlign: "center" }}>
                  <Text size="sm" c={MUTED}>
                    {searchQuery
                      ? `No practice sets found for "${searchQuery}"`
                      : activeTab === "in-progress"
                      ? "No practice sets in progress. Generate one above!"
                      : "No completed practice sets yet."}
                  </Text>
                </Box>
              ) : (
                <Stack key={activeTab} gap={0} className="tab-fade-in">
                  {sessions.map((session) => (
                    <PracticeSetRow
                      key={session.id}
                      session={session}
                      action={activeTab === "completed" ? "Review" : "Continue"}
                      onContinue={() => {
                        const params = new URLSearchParams({
                          name: session.name,
                          topic: session.topic_name,
                        });
                        const base = `/practice/${session.id}`;
                        router.push(
                          session.status === "completed"
                            ? `${base}?review=true&${params.toString()}`
                            : `${base}?${params.toString()}`
                        );
                      }}
                      onRename={handleRename}
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
            </Box>
          </Stack>

          {/* ── Right panel ── */}
          <Box visibleFrom="lg" style={{ width: rem(300), flexShrink: 0 }}>
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
          </Box>
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
                      const params = new URLSearchParams({ name: s.name, topic: s.topic_name });
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
          >
            {/* Topics */}
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="sm">
              Topic
            </Text>

            {topicsLoading ? (
              <Box py="md" style={{ display: "flex", flexWrap: "wrap", gap: rem(8) }}>
                {Array.from({ length: 4 }, (_, i) => (
                  <Box key={i} style={{ height: rem(32), width: rem(120), backgroundColor: SURFACE, borderRadius: rem(999) }} />
                ))}
              </Box>
            ) : topics.length === 0 ? (
              <Text size="sm" c={MUTED} mb="xl">No topics available for this subject.</Text>
            ) : (
              <Box mb="xl" style={{ display: "flex", flexWrap: "wrap", gap: rem(8) }}>
                {topics.map((t) => (
                  <TopicPill
                    key={t.id}
                    label={t.name}
                    selected={modalTopic?.id === t.id}
                    onToggle={() => setModalTopic(modalTopic?.id === t.id ? null : t)}
                  />
                ))}
              </Box>
            )}

            {/* Question count */}
            <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: "0.06em" }} c="dimmed" mb="sm">
              Number of Questions
            </Text>
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
              <Button
                leftSection={<IconPlus size={15} stroke={2} />}
                radius="md"
                loading={generating}
                disabled={!modalTopic || topicsLoading}
                onClick={handleGenerate}
                style={{
                  backgroundColor: !modalTopic || topicsLoading ? "#94A3B8" : INK,
                  color: "white", fontWeight: 600, opacity: 1,
                }}
              >
                Generate Practice Set
              </Button>
            </Group>
          </Modal>
        );
      })()}
    </Box>
  );
}
