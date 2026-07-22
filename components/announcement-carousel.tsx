"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Box, Button, Group, Text, Title, UnstyledButton, rem } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPlayerPlayFilled } from "@tabler/icons-react";

const INK = "#0F172A";
const PRIMARY = "#D4A017";
const INDIGO = "#6670B0";
const SURFACE = "#F3F5F7";

const SLIDES = [
  {
    bg: INK,
    accent: PRIMARY,
    badge: "NEW · July 2026",
    title: "CSCA July Mock Exam is now live — test yourself before the real thing!",
    sub: "Full-length simulation · 120 questions · Timed · Instant results",
    cta: "Start Exam",
    end: "Ends July 31",
    glow: "rgba(212,160,23,0.18)",
  },
  {
    bg: "#1E3A5F",
    accent: "#60A5FA",
    badge: "NEW · July 2026",
    title: "20 new practice sets added — cover every topic in the CSCA syllabus.",
    sub: "Governance · Risk · Compliance · Internal Audit · Ethics",
    cta: "Browse Sets",
    end: "Updated Jul 22",
    glow: "rgba(96,165,250,0.15)",
  },
  {
    bg: "#2D1B4E",
    accent: INDIGO,
    badge: "COMMUNITY",
    title: "Join the July Study Group — weekly sessions with top scorers.",
    sub: "Live Q&A · Peer review · Strategy tips from students who passed",
    cta: "Join Now",
    end: "Every Saturday",
    glow: "rgba(102,112,176,0.2)",
  },
];

const SLIDE_WIDTH = 82;
const GAP = 16;

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

export function AnnouncementCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <Box>
      {/* Slides track with fade overlay */}
      <Box style={{ position: "relative" }}>
        <Box style={{ overflow: "hidden", borderRadius: rem(14) }}>
          <Box
            style={{
              display: "flex",
              gap: rem(GAP),
              transform: `translateX(calc(${-current} * (${SLIDE_WIDTH}% + ${GAP}px)))`,
              transition: "transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            {SLIDES.map((slide, i) => (
              <Box
                key={i}
                style={{
                  flex: `0 0 ${SLIDE_WIDTH}%`,
                  minHeight: rem(240),
                  borderRadius: rem(14),
                  backgroundColor: slide.bg,
                  backgroundImage: `radial-gradient(ellipse at 85% 50%, ${slide.glow} 0%, transparent 65%)`,
                  padding: rem(28),
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    position: "absolute",
                    top: "-60px",
                    right: "160px",
                    width: "220px",
                    height: "220px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.05)",
                    pointerEvents: "none",
                  }}
                />

                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Badge
                      size="sm"
                      radius="sm"
                      mb={10}
                      style={{
                        backgroundColor: slide.accent,
                        color: "white",
                        fontWeight: 700,
                        fontSize: rem(11),
                      }}
                    >
                      {slide.badge}
                    </Badge>
                    <Title
                      order={3}
                      c="white"
                      mb={8}
                      style={{ fontSize: rem(18), lineHeight: 1.35, fontWeight: 700 }}
                    >
                      {slide.title}
                    </Title>
                    <Text size="sm" c="rgba(255,255,255,0.5)">
                      {slide.sub}
                    </Text>
                  </Box>

                  <Box style={{ flexShrink: 0 }}>
                    <Button
                      leftSection={<IconPlayerPlayFilled size={13} />}
                      size="sm"
                      mb={8}
                      style={{
                        backgroundColor: slide.accent,
                        color: "white",
                        fontWeight: 700,
                        borderRadius: rem(10),
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slide.cta}
                    </Button>
                    <Text size="xs" c="rgba(255,255,255,0.4)" ta="right">
                      {slide.end}
                    </Text>
                  </Box>
                </Group>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right fade overlay */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "22%",
            borderRadius: `0 ${rem(14)} ${rem(14)} 0`,
            background: `linear-gradient(to right, transparent 0%, ${SURFACE} 100%)`,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Pagination — below the carousel */}
      <Group justify="flex-end" align="center" gap={6} mt={12}>
        <PaginationBtn onClick={prev} aria-label="Previous">
          <IconChevronLeft size={14} stroke={2} />
        </PaginationBtn>

        {SLIDES.map((_, i) => (
          <UnstyledButton
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: rem(32),
              height: rem(32),
              borderRadius: rem(8),
              fontSize: rem(13),
              fontWeight: 600,
              border: `1.5px solid ${i === current ? INK : "#D1D5DB"}`,
              backgroundColor: i === current ? INK : "white",
              color: i === current ? "white" : "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms ease",
            }}
          >
            {i + 1}
          </UnstyledButton>
        ))}

        <PaginationBtn onClick={next} aria-label="Next">
          <IconChevronRight size={14} stroke={2} />
        </PaginationBtn>
      </Group>
    </Box>
  );
}
