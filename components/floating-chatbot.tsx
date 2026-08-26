"use client";

import { useEffect, useRef, useState } from "react";
// useRouter is intentionally not imported: opening a chat from another practice
// set no longer navigates anywhere (see openConversation).
import { Box, Group, Stack, Text, Textarea, TextInput, Tooltip, UnstyledButton, rem } from "@mantine/core";
import {
  IconArrowLeft,
  IconHistory,
  IconMessageCircle,
  IconPencil,
  IconPin,
  IconPinFilled,
  IconPlus,
  IconSearch,
  IconSend2,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth";
import { INK, PRIMARY, SURFACE, MUTED, CORRECT_DARK } from "@/constants/colors";
import { MarkdownLatexText } from "@/components/markdown-latex-text";

interface Message {
  role: "user" | "assistant";
  text: string;
  type?: "text" | "practice_set";
  timestamp?: Date;
}

interface FloatingChatbotProps {
  /** The active practice session — the chat thread is scoped to this, not to a single question. */
  sessionId: string;
  /** The question currently on screen — grounds the bot's context for this turn. */
  questionId: string;
}

const GREETING = "Hi! I'm here to help you understand this problem. Feel free to ask anything about it.";

interface HistoryMessage {
  role: string;
  content: string;
  type?: string;
}

interface ConversationSummary {
  conversation_id: string;
  session_id: string;
  title: string;
  session_name: string;
  pinned: boolean;
  last_message_at: string;
  preview: string;
}

function sortConversations(list: ConversationSummary[]): ConversationSummary[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
  });
}

interface PracticeQuestion {
  id: string;
  difficulty: string;
  question: string;
  choices: Record<string, string> | null;
  correct_answer: string | null;
  explanation: string | null;
}

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ─── /practice command rendering ───────────────────────────────────────────

function PracticeQuestionCard({ q, index }: { q: PracticeQuestion; index: number }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Box style={{ border: "1px solid #E2E8F0", borderRadius: rem(10), padding: rem(10), marginBottom: rem(8) }}>
      <Text size="xs" fw={700} c={MUTED} mb={4} tt="uppercase">
        Question {index + 1} · {q.difficulty}
      </Text>
      <Box fz="sm" mb={8}>
        <MarkdownLatexText>{q.question}</MarkdownLatexText>
      </Box>
      {q.choices && (
        <Stack gap={4} mb={8}>
          {Object.entries(q.choices).map(([key, text]) => (
            <Text key={key} size="sm" c={INK}>
              <strong>{key}.</strong> {text}
            </Text>
          ))}
        </Stack>
      )}
      {revealed ? (
        <Box style={{ backgroundColor: "#F5E6CC", borderRadius: rem(8), padding: rem(8) }}>
          <Text size="sm" fw={700} c={CORRECT_DARK}>Answer: {q.correct_answer}</Text>
          {q.explanation && (
            <Box fz="xs" mt={4}>
              <MarkdownLatexText>{q.explanation}</MarkdownLatexText>
            </Box>
          )}
        </Box>
      ) : (
        <UnstyledButton
          onClick={() => setRevealed(true)}
          style={{ fontSize: rem(12.5), color: PRIMARY, fontWeight: 600 }}
        >
          Reveal answer
        </UnstyledButton>
      )}
    </Box>
  );
}

function PracticeSetMessage({ text }: { text: string }) {
  let parsed: { questions: PracticeQuestion[] } | null = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  if (!parsed?.questions?.length) {
    return <Text size="sm" c={INK}>{text}</Text>;
  }
  return (
    <Box>
      <Text size="sm" fw={700} c={INK} mb={8}>Here&rsquo;s a quick practice set — give them a shot!</Text>
      {parsed.questions.map((q, i) => (
        <PracticeQuestionCard key={q.id} q={q} index={i} />
      ))}
    </Box>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function FloatingChatbot({ sessionId, questionId }: FloatingChatbotProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: GREETING, timestamp: new Date() },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyLoadedForSession = useRef<string | null>(null);

  const [panelWidth, setPanelWidth] = useState(400);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(400);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      const next = dragStartWidth.current + (dragStartX.current - e.clientX);
      setPanelWidth(Math.min(Math.max(next, 320), window.innerWidth * 0.85));
    }
    function onMouseUp() {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const [historyList, setHistoryList] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [starterPrompts, setStarterPrompts] = useState<string[]>([]);
  // Non-empty when the open thread belongs to a different practice set than this
  // page — the bot is answering about that set, so say so rather than leaving the
  // student to wonder why it's talking about something else.
  const [foreignSetName, setForeignSetName] = useState("");

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    setStarterPrompts([]);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/questions/${questionId}/suggested-prompts`,
      { headers: authHeaders() }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { prompts: string[] } | null) => {
        if (!cancelled && data?.prompts?.length) setStarterPrompts(data.prompts);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [questionId]);

  function renderMessages(history: HistoryMessage[] | undefined): Message[] {
    return history?.length
      ? history.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          text: m.content,
          type: m.type === "practice_set" ? "practice_set" : "text",
        }))
      : [{ role: "assistant", text: GREETING, timestamp: new Date() }];
  }

  /** Load the most recent thread for the practice set currently on screen. */
  async function loadCurrentSessionConversation() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/${sessionId}`,
        { headers: authHeaders() }
      );
      if (!res.ok) return;
      const data: { conversation_id: string | null; messages: HistoryMessage[] } = await res.json();
      setConversationId(data.conversation_id);
      setForeignSetName("");
      setMessages(renderMessages(data.messages));
    } catch {
      // Keep whatever's already showing if this fails.
    }
  }

  /**
   * Load one specific thread by id, whichever practice set it belongs to. Opening
   * a chat about a different set no longer navigates away — the thread is shown
   * in place and keeps its own context, so replies stay grounded in the set the
   * conversation is actually about.
   */
  async function loadConversationById(targetConversationId: string) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/by-id/${targetConversationId}`,
        { headers: authHeaders() }
      );
      if (!res.ok) return;
      const data: {
        conversation_id: string;
        session_id: string;
        session_name: string;
        messages: HistoryMessage[];
      } = await res.json();
      setConversationId(data.conversation_id);
      // Only flag it when the thread belongs to a different set than this page —
      // that's when the student needs telling what the bot is answering about.
      setForeignSetName(data.session_id === sessionId ? "" : data.session_name);
      setMessages(renderMessages(data.messages));
    } catch {
      // Keep whatever's already showing if this fails.
    }
  }

  useEffect(() => {
    setMessages([{ role: "assistant", text: GREETING, timestamp: new Date() }]);
    setConversationId(null);
    setForeignSetName("");
    historyLoadedForSession.current = null;
  }, [sessionId]);

  // Restore the most recent thread the first time the panel is opened for this session.
  useEffect(() => {
    if (!open || !sessionId || historyLoadedForSession.current === sessionId) return;
    historyLoadedForSession.current = sessionId;
    loadCurrentSessionConversation();
  }, [open, sessionId]);

  // NOTE: master's "chatbot_open_conversation" sessionStorage effect is deliberately
  // dropped here. It existed only to re-open a thread after navigating to another
  // set's page; threads now open in place, so nothing ever writes that key.

  // Load the conversation-history list whenever the history view is opened, and on search.
  useEffect(() => {
    if (!open || view !== "history") return;
    let cancelled = false;
    setHistoryLoading(true);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (historySearch.trim()) params.set("q", historySearch.trim());
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations?${params.toString()}`,
          { headers: authHeaders() }
        );
        if (!res.ok || cancelled) return;
        const data: { conversations: ConversationSummary[] } = await res.json();
        if (!cancelled) setHistoryList(data.conversations ?? []);
      } catch {
        // leave the previous list showing
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }, historySearch ? 300 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, view, historySearch]);

  useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open, view]);

  useEffect(() => {
    if (open && view === "chat") setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, view]);

  async function togglePin(conv: ConversationSummary) {
    const nextPinned = !conv.pinned;
    setHistoryList((prev) =>
      sortConversations(prev.map((c) => (c.conversation_id === conv.conversation_id ? { ...c, pinned: nextPinned } : c)))
    );
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/${conv.conversation_id}/pin`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ pinned: nextPinned }),
        }
      );
    } catch {
      setHistoryList((prev) =>
        sortConversations(prev.map((c) => (c.conversation_id === conv.conversation_id ? { ...c, pinned: conv.pinned } : c)))
      );
    }
  }

  function startRename(conv: ConversationSummary) {
    setRenamingId(conv.conversation_id);
    setRenameValue(conv.title);
  }

  async function commitRename(conv: ConversationSummary) {
    setRenamingId(null);
    const title = renameValue.trim();
    if (!title || title === conv.title) return;

    const previousTitle = conv.title;
    setHistoryList((prev) =>
      prev.map((c) => (c.conversation_id === conv.conversation_id ? { ...c, title } : c))
    );
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/${conv.conversation_id}/title`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ title }),
        }
      );
    } catch {
      setHistoryList((prev) =>
        prev.map((c) => (c.conversation_id === conv.conversation_id ? { ...c, title: previousTitle } : c))
      );
    }
  }

  async function deleteConversation(conv: ConversationSummary) {
    setPendingDeleteId(null);
    const previousList = historyList;
    setHistoryList((prev) => prev.filter((c) => c.conversation_id !== conv.conversation_id));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/${conv.conversation_id}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("delete failed");

      if (conv.conversation_id === conversationId) {
        setConversationId(null);
        setForeignSetName("");
        setMessages([{ role: "assistant", text: GREETING, timestamp: new Date() }]);
      }
    } catch {
      setHistoryList(previousList);
    }
  }

  /**
   * Open any past thread in place — including one about a different practice set.
   * No navigation: the student stays on the question they're working on, and the
   * backend keeps the thread grounded in its own set (see _resolve_question in
   * routers/chatbot.py), so its context is unchanged by where it's opened from.
   */
  function openConversation(conv: ConversationSummary) {
    setView("chat");
    loadConversationById(conv.conversation_id);
  }

  async function startNewChat() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/conversations/${sessionId}/new`,
        { method: "POST", headers: authHeaders() }
      );
      if (!res.ok) return;
      const data: { conversation_id: string } = await res.json();
      setConversationId(data.conversation_id);
      // A new chat is always about the set on screen — drop any foreign context.
      setForeignSetName("");
      setMessages([{ role: "assistant", text: GREETING, timestamp: new Date() }]);
      setView("chat");
    } catch {
      // leave the current thread showing if this fails
    }
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || loading || !questionId) return;
    if (!overrideText) setInput("");
    const isPracticeCmd = text.toLowerCase().startsWith("/practice");
    setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);
    setLoading(true);

    let started = false;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questionId,
          conversation_id: conversationId,
          message: text,
        }),
      });

      if (!res.ok || !res.body) {
        let detail = "Sorry, I couldn't connect right now. Please try again.";
        try {
          const errBody = await res.json();
          if (typeof errBody?.detail === "string") detail = errBody.detail;
        } catch {
          // not JSON — keep the generic message
        }
        throw new Error(detail);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const replyTimestamp = new Date();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (!started) {
          started = true;
          setLoading(false);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", text: chunk, type: isPracticeCmd ? "practice_set" : "text", timestamp: replyTimestamp },
          ]);
        } else {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, text: last.text + chunk };
            return next;
          });
        }
      }
    } catch (err) {
      const errorText = err instanceof Error && err.message
        ? err.message
        : "Sorry, I couldn't connect right now. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: errorText, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const canSend = !!input.trim() && !loading;

  return (
    <>
      {/* ── Sliding panel ── */}
      <Box
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: rem(panelWidth),
          maxWidth: "92vw",
          backgroundColor: "white",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9998,
          transform: open ? "translateX(0)" : `translateX(${panelWidth}px)`,
          transition: isDragging.current ? "none" : "transform 220ms ease",
        }}
      >
        {/* Drag-to-resize handle */}
        <Box
          onMouseDown={(e) => {
            isDragging.current = true;
            dragStartX.current = e.clientX;
            dragStartWidth.current = panelWidth;
            document.body.style.cursor = "ew-resize";
            document.body.style.userSelect = "none";
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: rem(6),
            cursor: "ew-resize",
            zIndex: 1,
          }}
        />
        {/* ── Header ── */}
        <Box
          px="md"
          py="md"
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #F1F5F9",
            flexShrink: 0,
          }}
        >
          <Group justify="space-between" align="center">
            {view === "history" ? (
              <Group gap={8}>
                <UnstyledButton
                  onClick={() => { setView("chat"); setPendingDeleteId(null); }}
                  style={{
                    width: rem(30), height: rem(30), borderRadius: rem(8),
                    border: "1px solid #E2E8F0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <IconArrowLeft size={15} stroke={1.8} color={INK} />
                </UnstyledButton>
                <Text fw={700} size="sm" c={INK}>Chat history</Text>
              </Group>
            ) : (
              <Group gap={10}>
                <Box
                  style={{
                    width: rem(34),
                    height: rem(34),
                    borderRadius: rem(9),
                    backgroundColor: SURFACE,
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSparkles size={16} stroke={1.5} color={PRIMARY} />
                </Box>
                <Box>
                  <Text fw={700} size="sm" c={INK} lh={1.25}>AI Tutor</Text>
                  <Text size="xs" c={MUTED} lh={1.25}>Unlimited chat access</Text>
                </Box>
              </Group>
            )}

            <Group gap={6}>
              {view === "chat" && (
                <>
                  <Tooltip label="New chat" position="bottom" withArrow>
                    <UnstyledButton
                      onClick={startNewChat}
                      style={{
                        width: rem(30), height: rem(30), borderRadius: rem(8),
                        border: "1px solid #E2E8F0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <IconPlus size={15} stroke={2} color={INK} />
                    </UnstyledButton>
                  </Tooltip>
                  <Tooltip label="Chat history" position="bottom" withArrow>
                    <UnstyledButton
                      onClick={() => setView("history")}
                      style={{
                        width: rem(30), height: rem(30), borderRadius: rem(8),
                        border: "1px solid #E2E8F0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <IconHistory size={15} stroke={1.6} color={INK} />
                    </UnstyledButton>
                  </Tooltip>
                </>
              )}
              <UnstyledButton
                onClick={() => setOpen(false)}
                style={{
                  width: rem(30), height: rem(30), borderRadius: rem(8),
                  border: "1px solid #E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <IconX size={14} stroke={2} color={INK} />
              </UnstyledButton>
            </Group>
          </Group>
        </Box>

        {view === "history" ? (
          <>
            {/* Search */}
            <Box px="sm" py="sm" style={{ borderBottom: "1px solid #F1F5F9", flexShrink: 0 }}>
              <TextInput
                placeholder="Search past conversations…"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                leftSection={<IconSearch size={14} color={MUTED} />}
                size="sm"
                styles={{ input: { borderRadius: rem(10), fontSize: rem(13), border: "1.5px solid #E2E8F0", backgroundColor: SURFACE } }}
              />
            </Box>

            {/* List */}
            <Box style={{ flex: 1, overflowY: "auto", padding: rem(12), backgroundColor: "#FAFBFC" }}>
              {historyLoading && historyList.length === 0 ? (
                <Text size="sm" c={MUTED} ta="center" mt="md">Loading…</Text>
              ) : historyList.length === 0 ? (
                <Text size="sm" c={MUTED} ta="center" mt="md">
                  {historySearch ? "No conversations match that search." : "No past conversations yet."}
                </Text>
              ) : (
                <Stack gap={8}>
                  {historyList.map((c) => (
                    <Box
                      key={c.conversation_id}
                      style={{
                        backgroundColor: "white",
                        border: pendingDeleteId === c.conversation_id ? "1px solid #F3D0D0" : "1px solid #F1F5F9",
                        borderRadius: rem(10),
                        padding: rem(10),
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      {pendingDeleteId === c.conversation_id ? (
                        <Group justify="space-between" align="center" wrap="nowrap">
                          <Text size="sm" c={INK} style={{ flex: 1 }}>
                            Delete &ldquo;{c.title}&rdquo;? This can&rsquo;t be undone.
                          </Text>
                          <Group gap={6} wrap="nowrap">
                            <UnstyledButton
                              onClick={() => setPendingDeleteId(null)}
                              style={{
                                fontSize: rem(12.5), fontWeight: 600, color: MUTED,
                                padding: `${rem(5)} ${rem(9)}`, borderRadius: rem(8),
                                border: "1px solid #E2E8F0",
                              }}
                            >
                              Cancel
                            </UnstyledButton>
                            <UnstyledButton
                              onClick={() => deleteConversation(c)}
                              style={{
                                fontSize: rem(12.5), fontWeight: 600, color: "white",
                                padding: `${rem(5)} ${rem(9)}`, borderRadius: rem(8),
                                backgroundColor: "#C0392B",
                              }}
                            >
                              Delete
                            </UnstyledButton>
                          </Group>
                        </Group>
                      ) : (
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            {renamingId === c.conversation_id ? (
                              <TextInput
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.currentTarget.value)}
                                onBlur={() => commitRename(c)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") commitRename(c);
                                  if (e.key === "Escape") setRenamingId(null);
                                }}
                                size="xs"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                styles={{ input: { fontWeight: 700, fontSize: rem(13.5), color: INK, padding: `${rem(2)} ${rem(6)}` } }}
                              />
                            ) : (
                              <Box onClick={() => openConversation(c)} style={{ width: "100%", textAlign: "left", cursor: "pointer" }}>
                                <Group gap={4} align="center" wrap="nowrap">
                                  <Text size="sm" fw={700} c={INK} truncate style={{ flex: 1, minWidth: 0 }}>{c.title}</Text>
                                  <UnstyledButton
                                    onClick={(e) => { e.stopPropagation(); startRename(c); }}
                                    style={{ display: "flex", alignItems: "center", color: "#94A3B8", flexShrink: 0 }}
                                  >
                                    <IconPencil size={12} stroke={1.5} />
                                  </UnstyledButton>
                                </Group>
                                {c.session_name && (
                                  <Text size="xs" c={PRIMARY} fw={600} mt={2} truncate>{c.session_name}</Text>
                                )}
                                <Text size="xs" c={MUTED} lineClamp={2} mt={2}>{c.preview}</Text>
                                <Text size="xs" c={MUTED} mt={4} style={{ opacity: 0.7 }}>{timeAgo(c.last_message_at)}</Text>
                              </Box>
                            )}
                          </Box>
                          <Group gap={2} wrap="nowrap">
                            <UnstyledButton onClick={() => togglePin(c)} style={{ flexShrink: 0, padding: rem(4) }}>
                              {c.pinned ? (
                                <IconPinFilled size={16} color={PRIMARY} />
                              ) : (
                                <IconPin size={16} color={MUTED} />
                              )}
                            </UnstyledButton>
                            <UnstyledButton onClick={() => setPendingDeleteId(c.conversation_id)} style={{ flexShrink: 0, padding: rem(4) }}>
                              <IconTrash size={16} color={MUTED} />
                            </UnstyledButton>
                          </Group>
                        </Group>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </>
        ) : (
          <>
            {/* Viewing a thread from another practice set — the bot answers about
                THAT set, so make it obvious rather than silently confusing. */}
            {foreignSetName && (
              <Group
                gap={6}
                px="sm"
                py={8}
                wrap="nowrap"
                style={{ backgroundColor: "#FFF9EC", borderBottom: "1px solid #F1E3C2", flexShrink: 0 }}
              >
                <IconHistory size={13} stroke={1.8} color={PRIMARY} style={{ flexShrink: 0 }} />
                <Text size="xs" c={INK} style={{ lineHeight: 1.4 }}>
                  Continuing your chat about <strong>{foreignSetName}</strong>
                </Text>
              </Group>
            )}

            {/* ── Messages ── */}
            <Box style={{ flex: 1, overflowY: "auto", padding: rem(16), backgroundColor: "white" }}>
              <Stack gap={20}>
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    /* User message — right aligned */
                    <Box key={i} style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: rem(10) }}>
                      <Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", maxWidth: m.type === "practice_set" ? "94%" : "78%" }}>
                        <Group gap={6} mb={5} align="center">
                          {m.timestamp && (
                            <Text size="xs" c={MUTED} lh={1}>{formatTime(m.timestamp)}</Text>
                          )}
                          <Text size="xs" fw={700} c={INK} lh={1}>You</Text>
                        </Group>
                        <Box
                          px="md"
                          py="sm"
                          style={{
                            backgroundColor: INK,
                            borderRadius: `${rem(14)} ${rem(14)} ${rem(4)} ${rem(14)}`,
                          }}
                        >
                          <Text size="sm" c="white" lh={1.6}>{m.text}</Text>
                        </Box>
                      </Box>
                      {/* User avatar */}
                      <Box
                        style={{
                          width: rem(30),
                          height: rem(30),
                          borderRadius: "50%",
                          backgroundColor: INK,
                          border: "2px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginBottom: rem(2),
                        }}
                      >
                        <Text size="xs" fw={800} c="white" style={{ fontSize: rem(11) }}>Y</Text>
                      </Box>
                    </Box>
                  ) : (
                    /* AI message — left aligned */
                    <Box key={i} style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", gap: rem(10) }}>
                      {/* AI avatar */}
                      <Box
                        style={{
                          width: rem(30),
                          height: rem(30),
                          borderRadius: rem(8),
                          backgroundColor: SURFACE,
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: rem(22),
                        }}
                      >
                        <IconSparkles size={14} stroke={1.5} color={PRIMARY} />
                      </Box>
                      <Box style={{ maxWidth: m.type === "practice_set" ? "94%" : "82%" }}>
                        <Group gap={6} mb={5} align="center">
                          <Text size="xs" fw={700} c={INK} lh={1}>AI Tutor</Text>
                          {m.timestamp && (
                            <Text size="xs" c={MUTED} lh={1}>{formatTime(m.timestamp)}</Text>
                          )}
                        </Group>
                        {m.type === "practice_set" ? (
                          <PracticeSetMessage text={m.text} />
                        ) : (
                          <Box fz="sm" style={{ lineHeight: 1.65, color: INK }}>
                            <MarkdownLatexText>{m.text}</MarkdownLatexText>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )
                )}

                {/* Starter prompt chips */}
                {messages.length === 1 && !loading && starterPrompts.length > 0 && (
                  <Group gap={6} wrap="wrap" style={{ paddingLeft: rem(40) }}>
                    {starterPrompts.map((p) => (
                      <UnstyledButton
                        key={p}
                        onClick={() => handleSend(p)}
                        style={{
                          fontSize: rem(12.5),
                          padding: `${rem(6)} ${rem(10)}`,
                          borderRadius: rem(999),
                          border: "1px solid #E2E8F0",
                          backgroundColor: SURFACE,
                          color: INK,
                          lineHeight: 1.3,
                        }}
                      >
                        {p}
                      </UnstyledButton>
                    ))}
                  </Group>
                )}

                {/* Thinking indicator */}
                {loading && (
                  <Box style={{ display: "flex", alignItems: "flex-start", gap: rem(10) }}>
                    <Box
                      style={{
                        width: rem(30), height: rem(30), borderRadius: rem(8),
                        backgroundColor: SURFACE, border: "1px solid #E2E8F0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: rem(22),
                      }}
                    >
                      <IconSparkles size={14} stroke={1.5} color={PRIMARY} />
                    </Box>
                    <Box>
                      <Text size="xs" fw={700} c={INK} mb={6} lh={1}>AI Tutor</Text>
                      <Group gap={5} align="center">
                        {[0, 1, 2].map((d) => (
                          <Box
                            key={d}
                            style={{
                              width: rem(7), height: rem(7), borderRadius: "50%",
                              backgroundColor: "#CBD5E1",
                              animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </Group>
                    </Box>
                  </Box>
                )}

                <div ref={bottomRef} />
              </Stack>
            </Box>

            {/* ── Input composer ── */}
            <Box px="md" py="md" style={{ borderTop: "1px solid #F1F5F9", backgroundColor: "white", flexShrink: 0 }}>
              <Box
                style={{
                  border: `1.5px solid ${input.trim() ? "#CBD5E1" : "#E2E8F0"}`,
                  borderRadius: rem(16),
                  backgroundColor: SURFACE,
                  overflow: "hidden",
                  transition: "border-color 150ms ease",
                }}
              >
                <Textarea
                  ref={inputRef}
                  placeholder="Ask something..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  autosize
                  minRows={1}
                  maxRows={5}
                  styles={{
                    input: {
                      border: "none",
                      background: "transparent",
                      borderRadius: 0,
                      fontSize: rem(13.5),
                      padding: `${rem(12)} ${rem(14)}`,
                      boxShadow: "none",
                      color: INK,
                      resize: "none",
                    },
                  }}
                />
                <Group justify="flex-end" px="sm" pb="sm" pt={2}>
                  <UnstyledButton
                    onClick={() => handleSend()}
                    disabled={!canSend}
                    style={{
                      display: "flex", alignItems: "center", gap: rem(5),
                      padding: `${rem(6)} ${rem(12)}`,
                      borderRadius: rem(999),
                      backgroundColor: canSend ? INK : "#E2E8F0",
                      color: canSend ? "white" : MUTED,
                      fontSize: rem(13),
                      fontWeight: 600,
                      cursor: canSend ? "pointer" : "default",
                      transition: "background-color 150ms ease, color 150ms ease",
                    }}
                  >
                    Send
                    <IconSend2 size={13} stroke={2} />
                  </UnstyledButton>
                </Group>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* ── FAB ── */}
      {!open && (
        <Tooltip label="Ask AI about this problem" position="left" withArrow>
          <Box
            onClick={() => setOpen(true)}
            style={{
              position: "fixed",
              bottom: rem(24),
              right: rem(24),
              width: rem(56),
              height: rem(56),
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${PRIMARY} 0%, #C47F10 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(212,160,23,0.45)",
              zIndex: 9999,
              transition: "all 200ms ease",
            }}
            className="hover-zoom"
          >
            <IconMessageCircle size={22} stroke={1.5} color="white" />
          </Box>
        </Tooltip>
      )}

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
