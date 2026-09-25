"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IconArrowRight, IconClock, IconKey, IconLanguage, IconNotebook } from "@tabler/icons-react";
import { DEMO_CODE, TRYOUT_DURATION_SECONDS, TRYOUT_ITEM_COUNT, TRYOUT_QUESTIONS, readTryoutAttempt, saveTryoutAttempt } from "@/lib/tryout-demo";
import styles from "./tryout.module.css";

export default function TryoutPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function enterTryout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized !== DEMO_CODE) {
      setError("This demo code isn't recognized. Check the code and try again.");
      return;
    }
    const existing = readTryoutAttempt();
    if (!existing || existing.submittedAt) {
      saveTryoutAttempt({ code: DEMO_CODE, deadline: Date.now() + TRYOUT_DURATION_SECONDS * 1000, answers: {} });
    }
    // The submit click provides the user gesture browsers require for fullscreen.
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
    router.push("/tryout/exam");
  }

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>EVENTS / TRYOUT</span>
        <h1>A focused space for your next tryout.</h1>
        <p>Enter the access code sent after registration. Each code is assigned to one subject and one exam language.</p>
      </div>
      <Image src="/images/tryout/tryout-hero-transparent.png" alt="" width={1536} height={1024} priority className={styles.heroArt} />
    </section>
    <div className={styles.grid}>
      <section className={styles.card}>
        <span className={styles.eyebrow}>AVAILABLE DEMO</span>
        <h2>Humanities Chinese Tryout</h2>
        <p className={styles.muted}>Preview the full tryout flow with sample questions. Your answers and result stay in this browser session.</p>
        <div className={styles.facts}>
          <span><IconNotebook size={18} /> {TRYOUT_ITEM_COUNT} questions · {TRYOUT_QUESTIONS.length} sets</span>
          <span><IconClock size={18} /> 30 minutes</span>
          <span><IconLanguage size={18} /> 中文</span>
        </div>
        <div className={styles.callout}><strong>Demo access code</strong><code>{DEMO_CODE}</code><small>For preview only. Real registration codes will be validated by the tryout service.</small></div>
      </section>
      <section className={styles.card}>
        <span className={styles.eyebrow}>JOIN THE TRYOUT</span>
        <h2>Enter your access code</h2>
        <p className={styles.muted}>Once you start, the timer keeps running if you refresh or leave this tab.</p>
        <form onSubmit={enterTryout}>
          <label htmlFor="tryout-code">Access code</label>
          <div className={styles.inputWrap}><IconKey size={19} aria-hidden="true" /><input id="tryout-code" autoComplete="off" value={code} onChange={(event) => { setCode(event.target.value); setError(""); }} placeholder="Enter your code" aria-invalid={!!error} aria-describedby={error ? "tryout-code-error" : undefined} /></div>
          {error && <p className={styles.error} id="tryout-code-error" role="alert">{error}</p>}
          <button className={styles.primary} type="submit">Continue to tryout <IconArrowRight size={18} /></button>
        </form>
        <p className={styles.footnote}>Results appear immediately in this demo. Email delivery will be available when the backend is connected.</p>
      </section>
    </div>
  </main>;
}
