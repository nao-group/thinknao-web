"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconClock, IconFlag, IconMaximize, IconMinimize, IconSend } from "@tabler/icons-react";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { DEMO_CODE, TRYOUT_ITEM_COUNT, TRYOUT_QUESTIONS, TRYOUT_STEPS, readTryoutAttempt, saveTryoutAttempt, scoreTryout, type TryoutAttempt, type TryoutQuestion } from "@/lib/tryout-demo";
import styles from "./exam.module.css";

function timeLabel(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

const subscribeToMount = () => () => {};

export default function TryoutExamPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(() => typeof window === "undefined" ? null : readTryoutAttempt());
  const ready = useSyncExternalStore(subscribeToMount, () => true, () => false);
  const [now, setNow] = useState(() => Date.now());
  const [current, setCurrent] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [review, setReview] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!attempt || attempt.submittedAt) return;
    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= attempt.deadline) {
        const saved = readTryoutAttempt();
        if (!saved || saved.submittedAt) return;
        const finished = { ...saved, submittedAt: currentTime };
        saveTryoutAttempt(finished);
        setAttempt(finished);
      }
    };
    const timer = window.setInterval(tick, 1000);
    const initialTick = window.setTimeout(tick, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initialTick); };
  }, [attempt]);

  if (!ready) return <main className={styles.center}><p>Loading tryout…</p></main>;
  if (!attempt || attempt.code !== DEMO_CODE) return <main className={styles.center}><h1>Access code required</h1><p>Enter your tryout code to begin.</p><Link className={styles.primaryLink} href="/tryout">Go to Tryout</Link></main>;

  const answeredItems = TRYOUT_QUESTIONS.reduce((total, item) => total + Object.keys(item.correct).filter((blank) => Boolean(attempt.answers[item.id]?.[blank])).length, 0);
  const result = scoreTryout(attempt.answers);
  const step = TRYOUT_STEPS[current];
  const question = TRYOUT_QUESTIONS[step.groupIndex];
  const readingItem = question.items?.find((item) => item.index === step.blank);
  const isFinished = Boolean(attempt.submittedAt);
  const remaining = Math.max(0, Math.ceil((attempt.deadline - now) / 1000));

  function choose(blank: string, key: string) {
    if (!attempt || isFinished) return;
    const blanks = { ...(attempt.answers[question.id] ?? {}) };
    blanks[blank] = key;
    const next = { ...attempt, answers: { ...attempt.answers, [question.id]: blanks } };
    setAttempt(next);
    saveTryoutAttempt(next);
  }

  function submit() {
    if (!attempt || isFinished) return;
    const finished = { ...attempt, submittedAt: Date.now() };
    setAttempt(finished);
    saveTryoutAttempt(finished);
    setConfirmSubmit(false);
    setReview(false);
  }

  function renderOptions(blank: string, options: TryoutQuestion["options"]) {
    return <div className={styles.options} role="group" aria-label={`Answer choices for question ${blank}`}>
      {options.map((option) => {
        const selected = attempt?.answers[question.id]?.[blank] === option.key;
        const correct = review && question.correct[blank] === option.key;
        return <button key={option.key} type="button" className={styles.option} data-selected={selected || undefined} data-correct={correct || undefined} data-wrong={(review && selected && !correct) || undefined} onClick={() => choose(blank, option.key)} disabled={isFinished} aria-pressed={selected}><span>{option.key}</span>{option.text}</button>;
      })}
    </div>;
  }

  if (isFinished && !review) return <main className={styles.resultPage}>
    <div className={styles.resultCard}>
      <span className={styles.eyebrow}>TRYOUT COMPLETE · DEMO</span>
      <h1>Your result is ready.</h1>
      <p>You completed the Humanities Chinese tryout in 中文.</p>
      <div className={styles.score}><strong>{result.percentage}%</strong><span>{result.correct} of {result.total} questions correct</span></div>
      <p className={styles.resultNote}>This is a local demo result. Email delivery will be enabled when the tryout backend is connected.</p>
      <div className={styles.resultActions}>
        <LandingActionButton
          className={styles.resultButton}
          presentation="auth"
          rightSection={<IconArrowRight size={16} />}
          onClick={() => { setReview(true); setCurrent(0); }}
        >
          Review answers
        </LandingActionButton>
        <LandingActionButton
          className={styles.resultButton}
          presentation="auth"
          tone="secondary"
          onClick={() => router.push("/tryout")}
        >
          Back to Tryout
        </LandingActionButton>
      </div>
    </div>
  </main>;

  return <main className={styles.exam}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>HUMANITIES CHINESE TRYOUT</span><strong>{review ? "Review answers" : "Exam in progress"}</strong></div>
      <div className={styles.topActions}>
        <span className={styles.language}>中文 · Demo</span>
        {!isFinished && <div className={styles.timer} data-urgent={remaining <= 300}><IconClock size={18} aria-hidden="true" /><time aria-label={`${remaining} seconds remaining`}>{timeLabel(remaining)}</time></div>}
        <button className={styles.fullscreenButton} type="button" title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => { if (fullscreen) void document.exitFullscreen(); else void document.documentElement.requestFullscreen(); }}>{fullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}</button>
        {review ? <button className={styles.topButton} onClick={() => setReview(false)}>View result</button> : <button className={styles.topButton} onClick={() => setConfirmSubmit(true)}>Submit tryout</button>}
      </div>
    </header>
    <div className={styles.workspace}>
      <div className={styles.mainColumn}>
        <div className={styles.progressRow}><span>Question {current + 1} of {TRYOUT_ITEM_COUNT}</span><span>{answeredItems} of {TRYOUT_ITEM_COUNT} answered</span></div>
        <div className={styles.progressTrack}><span style={{ width: `${answeredItems / TRYOUT_ITEM_COUNT * 100}%` }} /></div>
        <article className={styles.questionCard} onCopy={(event) => event.preventDefault()} onCut={(event) => event.preventDefault()} onContextMenu={(event) => event.preventDefault()}>
          <div className={styles.questionHeader}><span className={styles.kind}>{question.label}</span><span>#{String(current + 1).padStart(2, "0")}</span></div>
          {question.type === "YL" && question.passage && <section className={styles.passage}><strong>阅读材料 · Reading passage</strong><p>{question.passage}</p></section>}
          <h1>{readingItem?.prompt ?? question.prompt}</h1>
          {question.type === "YL" && readingItem
            ? renderOptions(readingItem.index, readingItem.options)
            : renderOptions("1", question.options)}
          {review && <p className={styles.feedback}>{attempt.answers[question.id]?.[step.blank] ? attempt.answers[question.id]?.[step.blank] === question.correct[step.blank] ? "Correct answer" : "Incorrect answer" : "Not answered"}</p>}
        </article>
        <div className={styles.bottomNav}><button onClick={() => setCurrent((index) => Math.max(0, index - 1))} disabled={current === 0}><IconArrowLeft size={17} /> Previous</button>{current < TRYOUT_ITEM_COUNT - 1 ? <button onClick={() => setCurrent((index) => index + 1)}>Next question <IconArrowRight size={17} /></button> : review ? <button onClick={() => setReview(false)}>View result <IconArrowRight size={17} /></button> : <button onClick={() => setConfirmSubmit(true)}>Submit tryout <IconSend size={17} /></button>}</div>
      </div>
      <aside className={styles.sidebar} aria-label="Question navigation">
        <div className={styles.sideHeading}><IconFlag size={18} /><strong>Question navigator</strong></div>
        <p>Jump to any question. Your answers are saved in this browser session.</p>
        <div className={styles.numberGrid}>{TRYOUT_STEPS.map((item, index) => {
          const answered = Boolean(attempt.answers[TRYOUT_QUESTIONS[item.groupIndex].id]?.[item.blank]);
          return <button key={`${item.groupIndex}-${item.blank}`} className={styles.number} data-active={current === index || undefined} data-answered={answered || undefined} onClick={() => setCurrent(index)} aria-label={`Question ${index + 1}${answered ? ", answered" : ", unanswered"}`} aria-current={current === index ? "step" : undefined}>{index + 1}</button>;
        })}</div>
        <div className={styles.legend}><span><i className={styles.answeredDot} /> Answered</span><span><i /> Unanswered</span></div>
        <div className={styles.sideFooter}><strong>{answeredItems}/{TRYOUT_ITEM_COUNT} answered</strong><span>{TRYOUT_ITEM_COUNT - answeredItems} remaining</span></div>
      </aside>
    </div>
    {confirmSubmit && <div className={styles.dialogBackdrop} role="presentation"><div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className={styles.dialogVisual}><Image src="/images/practice/finish-confirmation-transparent.png" alt="" width={1536} height={1024} className={styles.dialogArt} /></div>
      <div className={styles.dialogContent}><h2 id="submit-title">Submit your tryout?</h2><p>{TRYOUT_ITEM_COUNT - answeredItems} questions are still unanswered. Your result will appear immediately after submission.</p><div className={styles.dialogActions}><button onClick={() => setConfirmSubmit(false)}>Keep working</button><button className={styles.primary} onClick={submit}>Submit answers</button></div></div>
    </div></div>}
  </main>;
}
