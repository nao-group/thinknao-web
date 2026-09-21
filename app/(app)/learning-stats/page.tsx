"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Tooltip } from "@mantine/core";
import { IconArrowRight, IconBolt, IconChartBar, IconFlame, IconInfoCircle, IconTarget } from "@tabler/icons-react";
import { fetchLearningOverview, type LearningOverview } from "./api";
import styles from "./stats.module.css";

const number = new Intl.NumberFormat("en-US");
const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function percent(value: number | null) {
  return value === null ? "—" : `${Math.round(value)}%`;
}

export default function LearningStatsPage() {
  const [data, setData] = useState<LearningOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLearningOverview()
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const weekdays = useMemo(() => {
    const counts = Array(7).fill(0) as number[];
    for (const day of data?.days ?? []) {
      const weekday = new Date(`${day.date}T12:00:00Z`).getUTCDay();
      counts[(weekday + 6) % 7] += day.answers;
    }
    return counts;
  }, [data]);
  const maxWeekday = Math.max(1, ...weekdays);

  if (loading) return <main className={styles.page} aria-busy="true"><div className={styles.skeleton} /><div className={styles.skeletonGrid}>{[0, 1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}</div></main>;
  if (error || !data) return <main className={styles.page}><section className={styles.panel}><h1>Learning Stats</h1><p>We couldn&apos;t load your learning history right now.</p><button className={styles.retry} onClick={() => window.location.reload()}>Try again</button></section></main>;

  const daysByDate = new Map(data.days.map((day) => [day.date, day]));
  const endDate = new Date(`${data.days.at(-1)?.date ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  const activityDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(endDate.getTime() - (29 - index) * 86_400_000).toISOString().slice(0, 10);
    return { date, activity: daysByDate.get(date) ?? null };
  });
  const activeDays = activityDays.filter(({ activity }) => activity !== null && activity.answers > 0).length;
  const missingDays = activityDays.filter(({ activity }) => activity === null).length;

  const cards = [
    { label: "Current streak", value: `${data.current_streak} days`, detail: `Longest: ${data.longest_streak} days`, info: "Consecutive UTC days with at least one answered question. A streak through yesterday still counts until today ends.", icon: IconFlame },
    { label: "Answer accuracy", value: percent(data.total_answers ? data.answer_accuracy : null), detail: `${number.format(data.correct_answers)} of ${number.format(data.total_answers)} correct`, info: "Correct answers divided by all answers submitted in practice and mock exams, including repeat attempts.", icon: IconTarget },
    { label: "Study days", value: `${activeDays} / 30`, detail: "Days with answered questions", info: `Days with at least one answered question in the last 30 UTC calendar days, including today.${missingDays ? ` Activity data for ${missingDays} older days is not yet available from the service.` : ""}`, icon: IconChartBar },
    { label: "XP earned", value: number.format(data.total_xp), detail: "All-time learning XP", info: "Total learning XP awarded for your answers across all time.", icon: IconBolt },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>YOUR LEARNING JOURNEY</span><h1>Progress, at a glance.</h1><p>Every answer counts. Explore your study rhythm, topic accuracy, and exam progress in one place.</p></div>
        <Image src="/images/learning-stats/learning-progress-hero.png" alt="" width={1536} height={1024} priority className={styles.heroArt} />
      </header>

      <section className={styles.metrics} aria-label="Learning summary">
        {cards.map(({ label, value, detail, info, icon: Icon }) => <article className={styles.metric} key={label}><div className={styles.metricTop}><span className={styles.metricLabel}>{label}<Tooltip label={info} multiline w={250} withArrow position="top" openDelay={150} events={{ hover: true, focus: true, touch: true }}><button type="button" className={styles.metricInfo} aria-label={`About ${label}`}><IconInfoCircle size={17} stroke={1.8} aria-hidden="true" /></button></Tooltip></span><Icon size={21} stroke={1.7} aria-hidden="true" /></div><strong>{value}</strong><small>{detail}</small></article>)}
      </section>

      <div className={styles.twoColumns}>
        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>CONSISTENCY</span><h2>Learning frequency</h2></div><span>Last 30 days · UTC</span></div>
          <p className={styles.caption}>A filled day means you answered at least one question.{missingDays ? ` ${missingDays} older days are awaiting activity data.` : ""}</p>
          <div className={styles.heatmap} role="list" aria-label="Answers per day over the last 30 days">
            {activityDays.map(({ date, activity }) => {
              const dateLabel = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
              const summary = activity ? `${activity.answers} answers · ${activity.completed_sets} completed sets` : "Activity data not yet available";
              return <div key={date} role="listitem"><Tooltip label={<span className={styles.heatTooltip}><strong>{dateLabel}</strong><span>{summary}</span></span>} withArrow position="top" openDelay={120} events={{ hover: true, focus: true, touch: true }}><button type="button" className={styles.heatCell} data-level={activity === null ? "missing" : activity.answers === 0 ? 0 : activity.answers < 5 ? 1 : activity.answers < 15 ? 2 : 3} aria-label={`${dateLabel}: ${summary}`} /></Tooltip></div>;
            })}
          </div>
          <div className={styles.heatLegend}><span>Less</span><i data-level="0" /><i data-level="1" /><i data-level="2" /><i data-level="3" /><span>More</span></div>
          <h3 className={styles.smallHeading}>Answers by weekday</h3>
          <div className={styles.weekChart} aria-label="Answer frequency by weekday">
            {weekdays.map((count, index) => <div className={styles.weekColumn} key={weekdayNames[index]}><span>{count}</span><div className={styles.weekTrack}><div style={{ height: `${count ? Math.max(7, count / maxWeekday * 100) : 0}%` }} /></div><small>{weekdayNames[index]}</small></div>)}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>MILESTONES</span><h2>Practice & exams</h2></div></div>
          <div className={styles.milestones}>
            <div><strong>{number.format(data.completed_practice_sets)}</strong><span>practice sets completed</span></div>
            <div><strong>{number.format(data.completed_mock_exams)}</strong><span>mock exams completed</span></div>
            <div><strong>{percent(data.average_mock_score)}</strong><span>average mock score</span></div>
            <div><strong>{percent(data.best_mock_score)}</strong><span>best mock score</span></div>
          </div>
          <p className={styles.caption}>Mock scores are based on completed exams. Your answer accuracy includes practice and mock exam answers.</p>
          <Link href="/mock-exam" className={styles.textLink}>Explore mock exams <IconArrowRight size={17} aria-hidden="true" /></Link>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>MASTERY MAP</span><h2>Scores by subject & topic</h2></div><span>Correct answers ÷ answers submitted</span></div>
        {data.subjects.length ? <div className={styles.subjectGrid}>{data.subjects.map((subject) => <article className={styles.subject} key={subject.code}><div className={styles.subjectHeader}><div><h3>{subject.name}</h3><p>{subject.answered} answers · {subject.correct} correct</p></div><strong>{percent(subject.accuracy)}</strong></div><div className={styles.progress} aria-label={`${subject.name}: ${percent(subject.accuracy)} accuracy`}><span style={{ width: `${subject.accuracy}%` }} /></div><div className={styles.topics} tabIndex={0} role="region" aria-label={`${subject.name} topic scores`}>{subject.topics.map((topic) => <div className={styles.topic} key={topic.code}><span>{topic.name}<small>{topic.correct}/{topic.answered} correct</small></span><strong>{percent(topic.accuracy)}</strong></div>)}</div>{subject.topics.length > 5 && <p className={styles.scrollHint}>Scroll to see all {subject.topics.length} topics</p>}</article>)}</div> : <div className={styles.empty}><p>No answered topics yet. Your subject breakdown will appear after your first practice set.</p><Link href="/practice" className={styles.textLink}>Start practicing <IconArrowRight size={17} aria-hidden="true" /></Link></div>}
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>RECENTLY COMPLETED</span><h2>Your latest sessions</h2></div></div>
        {data.recent_sessions.length ? <div className={styles.recentList}>{data.recent_sessions.map((session) => <div className={styles.recent} key={session.id}><div><strong>{session.name}</strong><span>{session.subject_name} · {session.type === "mock_exam" ? "Mock exam" : "Practice"}</span></div><div><strong>{session.score === null ? "Completed" : percent(session.score)}</strong><span>{new Date(session.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div></div>)}</div> : <p className={styles.caption}>Complete a practice set or mock exam to see your history here.</p>}
      </section>
    </main>
  );
}
