import Image from "next/image";
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

        <div className={styles.heroHeader}>
          <ThinkNaoLogo />
          <span className={styles.chapter}>LEARN · PRACTICE · GROW</span>
        </div>

        <div className={styles.heroCopy}>
          <Text className={styles.kicker}>{copy.kicker}</Text>
          <h1 id="auth-hero-title" className={styles.heroTitle}>{copy.title}</h1>
          <Text className={styles.heroBody}>{copy.body}</Text>
        </div>

        <div className={`${styles.gate} ${styles.gateLeft}`} aria-hidden="true" />
        <div className={`${styles.gate} ${styles.gateRight}`} aria-hidden="true" />
      </section>

      <section className={styles.formPanel} aria-label={mode === "login" ? "Log in" : "Create an account"}>
        <div className={styles.mobileBrand}><ThinkNaoLogo /></div>
        <Box className={styles.formCard}>{children}</Box>
        <Text className={styles.formFooter}>LEARN BOLDLY · THINK BEYOND</Text>
      </section>
    </main>
  );
}
