"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Group, Portal, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { PRIMARY } from "@/constants/colors";

const G_GAP = 16; // px gap between cards in the strip

export function GalleryShell({
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
  const [slideX, setSlideX] = useState(-456);
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

  // Keep the active card centered from the first painted frame and after any
  // viewport/sidebar resize. This matters when the gallery is opened from a
  // full-width list row rather than the grid view.
  useLayoutEffect(() => {
    if (!opened || !containerRef.current) return;
    const container = containerRef.current;
    const syncPosition = () => {
      const w = container.clientWidth;
      const p = Math.min(80, Math.floor(w * 0.12));
      setCw(w);
      if (!pendingDir.current) setSlideX(-(w - 2 * p + G_GAP) + p);
    };
    syncPosition();
    const observer = new ResizeObserver(syncPosition);
    observer.observe(container);
    return () => observer.disconnect();
  }, [opened]);

  // The gallery is a viewport-level dialog. Lock the document rather than only
  // hiding overflow on the overlay so wheel/touch input cannot move the list
  // behind it. Restoring the exact previous values keeps other dialogs safe.
  useLayoutEffect(() => {
    if (!opened) return;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
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
        maxHeight: "calc(100dvh - 112px)",
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
    <Portal reuseTargetNode>
      <Box
        role="dialog"
        aria-modal="true"
        className="reference-gallery-overlay"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", zIndex: 300, backgroundColor: "rgba(15,23,42,0.88)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", overscrollBehavior: "none" }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onWheel={(event) => event.stopPropagation()}
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
    </Portal>
  );
}
