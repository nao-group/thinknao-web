"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { rem } from "@mantine/core";
import { IconX, IconZoomIn, IconZoomOut, IconRefresh } from "@tabler/icons-react";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.3;

const ANIM_MS = 220;

export function ImageLightbox({ src, alt = "Image", onClose }: ImageLightboxProps) {
  const [visible, setVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Trigger enter animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onClose, ANIM_MS);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function reset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function zoomIn() {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }

  function zoomOut() {
    setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));
  }

  // Wheel zoom
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
  }

  // Mouse drag
  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  function onMouseUp() {
    dragging.current = false;
  }

  // Touch drag
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const lastPinchDist = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 1 && lastTouch.current) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
    if (e.touches.length === 2 && lastPinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / lastPinchDist.current;
      lastPinchDist.current = dist;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z * scale).toFixed(2))));
    }
  }

  function onTouchEnd() {
    lastTouch.current = null;
    lastPinchDist.current = null;
  }

  const transition = `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms ease`;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: `opacity ${ANIM_MS}ms ease`,
      }}
      onClick={dismiss}
    >
      {/* Image container — stop propagation so clicks inside don't close */}
      <div
        style={{
          position: "relative", width: "100%", height: "100%", overflow: "hidden",
          cursor: dragging.current ? "grabbing" : "grab",
        }}
        onClick={(e) => e.stopPropagation()}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom * (visible ? 1 : 0.88)})`,
            transformOrigin: "center center",
            maxWidth: "90vw",
            maxHeight: "85vh",
            userSelect: "none",
            transition: dragging.current ? `opacity ${ANIM_MS}ms ease` : transition,
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          position: "fixed", bottom: rem(32), left: "50%",
          transform: `translateX(-50%) translateY(${visible ? 0 : rem(16)})`,
          display: "flex", gap: rem(8), alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          borderRadius: rem(999),
          padding: `${rem(8)} ${rem(16)}`,
          transition,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ControlBtn onClick={zoomOut} title="Zoom out"><IconZoomOut size={18} /></ControlBtn>
        <span style={{ color: "white", fontSize: rem(13), fontWeight: 600, minWidth: rem(40), textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <ControlBtn onClick={zoomIn} title="Zoom in"><IconZoomIn size={18} /></ControlBtn>
        <div style={{ width: 1, height: rem(20), backgroundColor: "rgba(255,255,255,0.3)", margin: `0 ${rem(4)}` }} />
        <ControlBtn onClick={reset} title="Reset"><IconRefresh size={18} /></ControlBtn>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        style={{
          position: "fixed", top: rem(20), right: rem(20),
          background: "rgba(255,255,255,0.15)", border: "none",
          borderRadius: "50%", width: rem(40), height: rem(40),
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "white",
          transform: `scale(${visible ? 1 : 0.7})`,
          transition,
        }}
      >
        <IconX size={20} />
      </button>
    </div>
  );
}

function ControlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "none", border: "none", color: "white",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", padding: rem(4), borderRadius: rem(6),
      }}
    >
      {children}
    </button>
  );
}
