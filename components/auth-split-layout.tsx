import Image from "next/image";
import type { CSSProperties } from "react";
import { Box, Text } from "@mantine/core";
import styles from "./auth-split-layout.module.css";

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
    <img src="/images/logo/thinknao_full.svg" alt="ThinkNAO" className={styles.logo} />
  );
}

const WALL_COLUMNS = 10;
const WALL_ROWS = 5;

function WallDismantle() {
  return (
    <div className={styles.wallSequence} aria-hidden="true">
      {Array.from({ length: WALL_COLUMNS * WALL_ROWS }, (_, index) => {
        const column = index % WALL_COLUMNS;
        const row = Math.floor(index / WALL_COLUMNS);
        const direction = column < WALL_COLUMNS / 2 ? -1 : 1;
        const distance = 26 + ((column * 13 + row * 7) % 42);
        const lift = -18 - ((column * 9 + row * 11) % 46);
        const rotation = direction * (2 + ((column + row) % 5));

        return (
          <span
            key={index}
            className={styles.wallBlock}
            style={{
              "--wall-x": `${(column / (WALL_COLUMNS - 1)) * 100}%`,
              "--wall-y": `${(row / (WALL_ROWS - 1)) * 100}%`,
              "--wall-delay": `${Math.max(0, (WALL_ROWS - row - 1) * 65 + Math.abs(column - 4.5) * 22)}ms`,
              "--wall-tx": `${direction * distance}vw`,
              "--wall-ty": `${lift}vh`,
              "--wall-rotate": `${rotation}deg`,
            } as CSSProperties}
          />
        );
      })}
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

  return (
    <main className={styles.shell}>
      <section className={styles.hero} aria-labelledby="auth-hero-title">
        <Image
          src="/images/auth/thinknao-china-landscape.png"
          alt=""
          fill
          preload
          sizes="(max-width: 767px) 100vw, 58vw"
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

        <WallDismantle />
      </section>

      <section className={styles.formPanel} aria-label={mode === "login" ? "Log in" : "Create an account"}>
        <div className={styles.mobileBrand}><ThinkNaoLogo /></div>
        <Box className={styles.formCard}>{children}</Box>
        <Text className={styles.formFooter}>LEARN BOLDLY · THINK BEYOND</Text>
      </section>
    </main>
  );
}
