"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Box, Text } from "@mantine/core";
import styles from "./auth-split-layout.module.css";

// Resets on a full document load; survives client-side route changes.
let documentEntranceClaimed = false;
// Ceremonial gate is temporarily disabled; keep the implementation for a future re-enable.
const CEREMONIAL_GATE_ENABLED = false;

const COPY = {
  login: {
    kicker: "Your next breakthrough starts here",
    title: "Keep climbing. Your future is closer than you think.",
    body: "Every lesson builds momentum. Return to your path and turn today’s practice into tomorrow’s possibilities.",
  },
  register: {
    kicker: "A new learning journey awaits",
    title: "Open the gate to everything you can become.",
    body: "Build stronger skills, prepare with purpose, and move toward your dream university—one confident step at a time.",
  },
} as const;

function ThinkNaoLogo() {
  return (
    // Existing brand asset; keep its original proportions.
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo/think_nao_dark.png" alt="ThinkNAO" className={styles.logo} />
  );
}

function GateEntrance({ onComplete }: { onComplete: () => void }) {
  return (
    <div
      className={styles.gateSequence}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <div className={styles.gateVeil} />
      <div className={styles.gateCamera}>
        <div className={styles.gateScene}>
          <div className={`${styles.gateDoor} ${styles.gateDoorLeft}`} />
          <div className={`${styles.gateDoor} ${styles.gateDoorRight}`} />
          <div className={styles.gateFrame} />
        </div>
      </div>
    </div>
  );
}

function AmbientSky() {
  return (
    <div className={styles.ambientSky} aria-hidden="true">
      <span className={`${styles.cloud} ${styles.cloudOne}`} />
      <span className={`${styles.cloud} ${styles.cloudTwo}`} />
      <span className={`${styles.cloud} ${styles.cloudThree}`} />
      <span className={`${styles.bird} ${styles.birdOne}`} />
      <span className={`${styles.bird} ${styles.birdTwo}`} />
      <span className={`${styles.bird} ${styles.birdThree}`} />
    </div>
  );
}

export function AuthSplitLayout({
  children,
  mode = "login",
}: {
  children: React.ReactNode;
  mode?: keyof typeof COPY;
}) {
  const copy = COPY[mode];
  const [gateState, setGateState] = useState<"pending" | "ready" | "skip">(
    CEREMONIAL_GATE_ENABLED ? "pending" : "skip"
  );

  const entranceClaim = useRef<boolean | null>(null);

  useEffect(() => {
    if (!CEREMONIAL_GATE_ENABLED) return;

    if (entranceClaim.current === null) {
      const navigation = performance.getEntriesByType("navigation")[0];
      const initialPath = navigation ? new URL(navigation.name).pathname.replace(/\/$/, "") : "";
      entranceClaim.current = !documentEntranceClaimed && initialPath === `/${mode}`;
      if (entranceClaim.current) documentEntranceClaimed = true;
    }
    // Keep the same claim during React Strict Mode's effect replay.
    if (!entranceClaim.current) {
      const frame = requestAnimationFrame(() => setGateState("skip"));
      return () => cancelAnimationFrame(frame);
    }
    const texture = new window.Image();
    const timeout = window.setTimeout(() => setGateState("skip"), 1500);
    texture.onload = () => {
      window.clearTimeout(timeout);
      setGateState(state => state === "pending" ? "ready" : state);
    };
    texture.onerror = () => {
      window.clearTimeout(timeout);
      setGateState("skip");
    };
    texture.src = "/images/auth/ceremonial-gate.png";
    return () => {
      texture.onload = texture.onerror = null;
      window.clearTimeout(timeout);
    };
  }, [mode]);

  return (
    <main
      className={styles.shell}
      data-gate-state={gateState}
      onPointerDownCapture={() => setGateState("skip")}
      onFocusCapture={() => setGateState("skip")}
      onSubmitCapture={() => setGateState("skip")}
    >
      <section className={styles.hero} aria-labelledby="auth-hero-title">
        <Image
          src="/images/auth/thinknao-china-landscape.png"
          alt=""
          fill
          preload
          sizes="100vw"
          className={styles.landscape}
        />
        <div className={styles.wash} />
        <AmbientSky />

        <div className={styles.heroHeader}>
          <ThinkNaoLogo />
          <span className={styles.chapter}>LEARN · PRACTICE · GROW</span>
        </div>

        <div className={styles.heroCopy}>
          <Text className={styles.kicker}>{copy.kicker}</Text>
          <h1 id="auth-hero-title" className={styles.heroTitle}>{copy.title}</h1>
          <Text className={styles.heroBody}>{copy.body}</Text>
        </div>

      </section>

      <section className={styles.formPanel} aria-label={mode === "login" ? "Log in" : "Create an account"}>
        <div className={styles.mobileBrand}><ThinkNaoLogo /></div>
        <Box className={styles.formCard}>{children}</Box>
        <Text className={styles.formFooter}>LEARN BOLDLY · THINK BEYOND</Text>
      </section>
      {/* Ceremonial gate temporarily commented out/disabled. */}
      {CEREMONIAL_GATE_ENABLED && gateState === "ready" && (
        <GateEntrance onComplete={() => setGateState("skip")} />
      )}
    </main>
  );
}
