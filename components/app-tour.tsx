"use client";

import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconX } from "@tabler/icons-react";
import styles from "./app-tour.module.css";

const STEPS = [
  { target: null, title: "Welcome to ThinkNAO", copy: "A quick look at the tools you will use most. You can replay this tour anytime from your profile menu." },
  { target: "/dashboard", title: "Your dashboard", copy: "Find recent practice sets, continue unfinished work, and check your learning activity here." },
  { target: "/practice", title: "Practice by topic", copy: "Choose a subject and topic, answer questions, and review explanations. Your progress is saved as you work." },
  { target: "/mock-exam", title: "Take a mock exam", copy: "Try a timed exam and review your score and answers when you finish." },
  { target: "/learning-stats", title: "Track your progress", copy: "See study activity, topic accuracy, and how your mock exam scores change over time." },
  { target: "/tryout", title: "Join a Tryout", copy: "When you receive an event access code, enter it here to take the assigned Tryout." },
  { target: "appearance", title: "Choose your appearance", copy: "Switch between light and dark mode whenever you like." },
  { target: "profile", title: "Manage your account", copy: "Open your profile to update your details and check your subscription or signed-in devices." },
] as const;

interface TargetRect { top: number; left: number; width: number; height: number }

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function AppTour({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const step = STEPS[index];

  useEffect(() => {
    const target = step.target;
    if (!target) return;
    const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    element?.scrollIntoView({ block: "nearest", inline: "nearest" });
    function updatePosition() {
      if (!element || !element.getClientRects().length) {
        setTargetRect(null);
        return;
      }
      const rect = element.getBoundingClientRect();
      setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }
    const frame = window.requestAnimationFrame(updatePosition);
    const settled = window.setTimeout(updatePosition, 250);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settled);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [step.target]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [index]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const cardWidth = Math.min(350, window.innerWidth - 32);
  const cardHeight = 240;
  let cardLeft = (window.innerWidth - cardWidth) / 2;
  let cardTop = (window.innerHeight - cardHeight) / 2;
  if (targetRect) {
    const right = targetRect.left + targetRect.width + 18;
    const left = targetRect.left - cardWidth - 18;
    if (right + cardWidth < window.innerWidth - 16) {
      cardLeft = right;
      cardTop = targetRect.top + targetRect.height / 2 - cardHeight / 2;
    } else if (left >= 16) {
      cardLeft = left;
      cardTop = targetRect.top + targetRect.height / 2 - cardHeight / 2;
    } else {
      cardLeft = clamp(targetRect.left, 16, window.innerWidth - cardWidth - 16);
      cardTop = targetRect.top + targetRect.height + 18;
      if (cardTop + cardHeight > window.innerHeight - 16) cardTop = targetRect.top - cardHeight - 18;
    }
    cardTop = clamp(cardTop, 16, Math.max(16, window.innerHeight - cardHeight - 16));
  }

  return <>
    <div className={styles.hitLayer} onClick={onClose} aria-hidden="true" />
    {targetRect ? <div className={styles.spotlight} style={{ top: targetRect.top - 5, left: targetRect.left - 5, width: targetRect.width + 10, height: targetRect.height + 10 }} aria-hidden="true" /> : <div className={styles.shade} aria-hidden="true" />}
    <div ref={dialogRef} className={styles.card} style={{ top: cardTop, left: cardLeft, width: cardWidth }} role="dialog" aria-modal="true" aria-labelledby="app-tour-title" aria-describedby="app-tour-copy" tabIndex={-1}>
      <div className={styles.topline}><span>GETTING STARTED · {index + 1}/{STEPS.length}</span><button type="button" onClick={onClose} aria-label="Close tutorial"><IconX size={18} /></button></div>
      <h2 id="app-tour-title">{step.title}</h2>
      <p id="app-tour-copy">{step.copy}</p>
      <div className={styles.footer}>
        <button type="button" className={styles.skip} onClick={onClose}>Skip tour</button>
        <div className={styles.controls}>
          {index > 0 && <button type="button" className={styles.back} onClick={() => setIndex(index - 1)}><IconArrowLeft size={16} /> Back</button>}
          <button type="button" className={styles.next} onClick={() => index === STEPS.length - 1 ? onClose() : setIndex(index + 1)}>{index === STEPS.length - 1 ? "Done" : "Next"}{index < STEPS.length - 1 && <IconArrowRight size={16} />}</button>
        </div>
      </div>
    </div>
  </>;
}
