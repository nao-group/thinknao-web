"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Group, Stack, Text, TextInput, Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconMessageCircle, IconSend, IconSparkles, IconX } from "@tabler/icons-react";
import api from "@/lib/api";

const INK = "#0F172A";
const PRIMARY = "#D4A017";
const SURFACE = "#F3F5F7";
const CREAM = "#F7E7D3";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface FloatingChatbotProps {
  /** Plain-text description of the current problem shown to the AI as context */
  questionContext: string;
}

const GREETING = "Hi! I'm here to help you understand this problem. Feel free to ask anything about it.";

export function FloatingChatbot({ questionContext }: FloatingChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset chat whenever the displayed problem changes
  useEffect(() => {
    setMessages([{ role: "assistant", text: GREETING }]);
  }, [questionContext]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const { data } = await api.post<{ reply: string }>("/api/chatbot/ask", {
        context: questionContext,
        message: text,
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't connect right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <Box
          style={{
            position: "fixed",
            bottom: rem(96),
            right: rem(24),
            width: rem(360),
            height: rem(480),
            backgroundColor: "white",
            borderRadius: rem(18),
            boxShadow: "0 12px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            px="md"
            py="sm"
            style={{
              background: `linear-gradient(135deg, ${INK} 0%, #252060 100%)`,
              flexShrink: 0,
            }}
          >
            <Group justify="space-between" align="center">
              <Group gap={8}>
                <Box
                  style={{
                    width: rem(28),
                    height: rem(28),
                    borderRadius: rem(8),
                    backgroundColor: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSparkles size={15} stroke={1.5} color={PRIMARY} />
                </Box>
                <Box>
                  <Text fw={700} size="sm" c="white" lh={1.2}>AI Tutor</Text>
                  <Text size="xs" c="rgba(255,255,255,0.5)" lh={1.2}>Ask about this problem</Text>
                </Box>
              </Group>
              <UnstyledButton
                onClick={() => setOpen(false)}
                style={{
                  width: rem(28),
                  height: rem(28),
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconX size={14} stroke={2} color="rgba(255,255,255,0.8)" />
              </UnstyledButton>
            </Group>
          </Box>

          {/* Messages */}
          <Box
            style={{
              flex: 1,
              overflowY: "auto",
              padding: rem(12),
              backgroundColor: "#FAFBFC",
            }}
          >
            <Stack gap={8}>
              {messages.map((m, i) => (
                <Box
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    px="sm"
                    py="xs"
                    style={{
                      backgroundColor: m.role === "user" ? INK : "white",
                      borderRadius: m.role === "user"
                        ? `${rem(12)} ${rem(12)} ${rem(4)} ${rem(12)}`
                        : `${rem(12)} ${rem(12)} ${rem(12)} ${rem(4)}`,
                      maxWidth: "82%",
                      boxShadow: m.role === "assistant" ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                      border: m.role === "assistant" ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <Text size="sm" c={m.role === "user" ? "white" : INK} lh={1.55}>
                      {m.text}
                    </Text>
                  </Box>
                </Box>
              ))}

              {loading && (
                <Box style={{ display: "flex", justifyContent: "flex-start" }}>
                  <Box
                    px="sm"
                    py="xs"
                    style={{
                      backgroundColor: "white",
                      borderRadius: `${rem(12)} ${rem(12)} ${rem(12)} ${rem(4)}`,
                      border: "1px solid #F1F5F9",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Group gap={4}>
                      {[0, 1, 2].map((d) => (
                        <Box
                          key={d}
                          style={{
                            width: rem(6),
                            height: rem(6),
                            borderRadius: "50%",
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

          {/* Input */}
          <Box
            px="sm"
            py="sm"
            style={{
              borderTop: "1px solid #F1F5F9",
              backgroundColor: "white",
              flexShrink: 0,
            }}
          >
            <Group gap="xs" align="center" wrap="nowrap">
              <TextInput
                ref={inputRef}
                placeholder="Ask about this problem…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                style={{ flex: 1 }}
                size="sm"
                styles={{
                  input: {
                    borderRadius: rem(10),
                    fontSize: rem(13),
                    border: "1.5px solid #E2E8F0",
                    backgroundColor: SURFACE,
                  },
                }}
              />
              <UnstyledButton
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: rem(34),
                  height: rem(34),
                  borderRadius: rem(10),
                  backgroundColor: input.trim() && !loading ? PRIMARY : "#E2E8F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background-color 150ms ease",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                }}
              >
                <IconSend size={16} stroke={1.5} color={input.trim() && !loading ? "white" : "#94A3B8"} />
              </UnstyledButton>
            </Group>
          </Box>
        </Box>
      )}

      {/* ── FAB ── */}
      <Tooltip
        label="Ask AI about this problem"
        position="left"
        withArrow
        disabled={open}
      >
      <Box
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: rem(24),
          right: rem(24),
          width: rem(56),
          height: rem(56),
          borderRadius: "50%",
          background: open
            ? `linear-gradient(135deg, ${INK} 0%, #252060 100%)`
            : `linear-gradient(135deg, ${PRIMARY} 0%, #C47F10 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: open
            ? "0 4px 20px rgba(15,23,42,0.35)"
            : "0 4px 20px rgba(212,160,23,0.45)",
          zIndex: 9999,
          transition: "all 200ms ease",
        }}
        className="hover-zoom"
      >
        {open ? (
          <IconX size={22} stroke={2} color="white" />
        ) : (
          <IconMessageCircle size={22} stroke={1.5} color="white" />
        )}
      </Box>
      </Tooltip>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
